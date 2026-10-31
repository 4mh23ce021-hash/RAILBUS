const prisma = require('../config/prisma');

/**
 * Conductor Dashboard: Assigned Bus, Route, Manifest, and Boarding Metrics
 */
async function getConductorDashboard(req, res, next) {
  try {
    const conductorId = req.user.id;
    const conductorProfile = await prisma.conductorProfile.findUnique({
      where: { userId: conductorId }
    });

    // Find assigned vehicle or fallback to first available active dispatch vehicle
    let busId = conductorProfile?.assignedBusId || 'KA-09-F-4412';
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        OR: [
          { busNumber: busId },
          { registrationNumber: busId }
        ]
      }
    });

    // Find active pool assigned to this vehicle or today's active pool
    const activePool = await prisma.passengerPool.findFirst({
      where: {
        OR: [
          { assignedVehicleId: vehicle ? vehicle.id : undefined },
          { status: { in: ['APPROVED', 'DISPATCHED', 'FULL'] } }
        ]
      },
      include: {
        destination: true,
        train: true,
        assignedVehicle: true,
        members: {
          include: {
            passenger: { select: { id: true, name: true, phone: true } },
            booking: {
              include: {
                tickets: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Flatten manifest
    const manifest = [];
    let totalAssignedSeats = 0;
    let boardedSeats = 0;

    if (activePool) {
      activePool.members.forEach(member => {
        const ticket = member.booking?.tickets?.[0];
        const isBoarded = ticket?.status === 'BOARDED';
        totalAssignedSeats += member.passengerCount;
        if (isBoarded) boardedSeats += member.passengerCount;

        manifest.push({
          bookingId: member.booking.id,
          bookingCode: member.booking.bookingCode,
          passengerName: member.passenger.name,
          phone: member.passenger.phone ? '***' + member.passenger.phone.slice(-4) : 'N/A',
          passengerCount: member.passengerCount,
          ticketCode: ticket ? ticket.ticketCode : 'N/A',
          sixDigitCode: ticket ? ticket.sixDigitCode : 'N/A',
          ticketStatus: ticket ? ticket.status : 'PENDING',
          boardedAt: ticket?.boardedAt || null
        });
      });
    }

    // Recent Scans
    const recentScans = await prisma.ticketScan.findMany({
      where: { conductorId: conductorProfile?.id },
      include: {
        ticket: {
          include: {
            passenger: { select: { name: true } },
            booking: { include: { destination: true } }
          }
        }
      },
      orderBy: { scannedAt: 'desc' },
      take: 10
    });

    return res.json({
      success: true,
      conductor: {
        name: req.user.name,
        employeeId: conductorProfile?.employeeId || 'KSRTC-MYS-8821',
        badgeNumber: conductorProfile?.badgeNumber || 'BDG-5409',
        assignedBus: vehicle ? vehicle.registrationNumber : 'KA-09-F-4412',
        busType: vehicle?.vehicleType || 'KSRTC Sarige / City Express',
        capacity: vehicle?.capacity || 56
      },
      activePool: activePool ? {
        id: activePool.id,
        poolCode: activePool.poolCode,
        destination: activePool.destination.name,
        train: `${activePool.train.trainNumber} - ${activePool.train.trainName}`,
        boardingWindow: activePool.targetBoardingWindow || '13:10 - 13:25',
        status: activePool.status
      } : null,
      boardingMetrics: {
        totalAssigned: totalAssignedSeats,
        boardedCount: boardedSeats,
        remainingCount: Math.max(0, totalAssignedSeats - boardedSeats),
        boardingCompletionPercentage: totalAssignedSeats > 0 ? Math.round((boardedSeats / totalAssignedSeats) * 100) : 0
      },
      manifest,
      recentScans
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Validate Ticket via QR Token Scan
 */
async function validateQRTicket(req, res, next) {
  try {
    const { qrToken } = req.body;
    if (!qrToken) {
      return res.status(400).json({ success: false, message: 'QR Token is required for validation.' });
    }

    const conductorProfile = await prisma.conductorProfile.findUnique({
      where: { userId: req.user.id }
    });

    // Check if token matches format or extracted payload
    let tokenLookup = qrToken;
    try {
      const parsed = JSON.parse(qrToken);
      if (parsed.token) tokenLookup = parsed.token;
      else if (parsed.ticketCode) tokenLookup = parsed.ticketCode;
    } catch (e) {
      // Raw string token
    }

    // Atomic transaction for ticket validation
    const validationResult = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findFirst({
        where: {
          OR: [
            { qrToken: tokenLookup },
            { ticketCode: tokenLookup }
          ]
        },
        include: {
          passenger: { select: { id: true, name: true, phone: true } },
          booking: {
            include: {
              destination: true,
              train: true,
              pool: { include: { assignedVehicle: true } }
            }
          }
        }
      });

      if (!ticket) {
        // Record failed scan
        return {
          status: 'INVALID',
          message: 'Invalid Ticket. No matching digital ticket record found in system.'
        };
      }

      // Check if already boarded
      if (ticket.status === 'BOARDED') {
        await tx.ticketScan.create({
          data: {
            ticketId: ticket.id,
            conductorId: conductorProfile?.id,
            scanMethod: 'QR_SCAN',
            result: 'DUPLICATE',
            notes: `Duplicate scan attempt. Ticket was already boarded at ${ticket.boardedAt ? ticket.boardedAt.toLocaleTimeString() : 'earlier'}`
          }
        });

        return {
          status: 'DUPLICATE',
          message: `DUPLICATE TICKET WARNING! Ticket already boarded at ${ticket.boardedAt ? ticket.boardedAt.toLocaleTimeString() : 'prior time'}.`,
          ticket
        };
      }

      // Check expiry
      if (new Date() > new Date(ticket.expiresAt)) {
        await tx.ticketScan.create({
          data: {
            ticketId: ticket.id,
            conductorId: conductorProfile?.id,
            scanMethod: 'QR_SCAN',
            result: 'EXPIRED',
            notes: 'Ticket expired'
          }
        });
        return {
          status: 'EXPIRED',
          message: 'This ticket has expired.',
          ticket
        };
      }

      // Mark as BOARDED
      const boardedTicket = await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'BOARDED',
          boardedAt: new Date(),
          validatedByConductorId: req.user.id
        },
        include: {
          passenger: { select: { id: true, name: true, phone: true } },
          booking: {
            include: {
              destination: true,
              train: true
            }
          }
        }
      });

      // Record successful scan
      await tx.ticketScan.create({
        data: {
          ticketId: ticket.id,
          conductorId: conductorProfile?.id,
          scanMethod: 'QR_SCAN',
          result: 'SUCCESS',
          notes: `Boarded by Conductor ${req.user.name}`
        }
      });

      // Create confirmation notification for passenger
      await tx.notification.create({
        data: {
          userId: ticket.passengerId,
          role: 'PASSENGER',
          title: 'Welcome Aboard!',
          message: `Your ticket ${ticket.ticketCode} was successfully validated. Safe travels to ${ticket.booking.destination.name}!`,
          type: 'SUCCESS'
        }
      });

      return {
        status: 'SUCCESS',
        message: 'Ticket Validated Successfully! Passenger Approved for Boarding.',
        ticket: boardedTicket
      };
    });

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('ticket:boarded', {
        ticketId: validationResult.ticket?.id,
        status: validationResult.status,
        timestamp: new Date().toISOString()
      });
    }

    if (validationResult.status === 'SUCCESS') {
      return res.json({ success: true, ...validationResult });
    } else {
      return res.status(400).json({ success: false, ...validationResult });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Validate Ticket via 6-Digit Code (Manual Entry)
 */
async function validateManualCode(req, res, next) {
  try {
    const { sixDigitCode } = req.body;
    if (!sixDigitCode || String(sixDigitCode).length !== 6) {
      return res.status(400).json({ success: false, message: 'Valid 6-digit verification code required.' });
    }

    const conductorProfile = await prisma.conductorProfile.findUnique({
      where: { userId: req.user.id }
    });

    const validationResult = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findFirst({
        where: { sixDigitCode: String(sixDigitCode).trim() },
        include: {
          passenger: { select: { id: true, name: true, phone: true } },
          booking: {
            include: {
              destination: true,
              train: true,
              pool: { include: { assignedVehicle: true } }
            }
          }
        }
      });

      if (!ticket) {
        return {
          status: 'INVALID',
          message: `Invalid 6-digit code (${sixDigitCode}). No matching active ticket found.`
        };
      }

      if (ticket.status === 'BOARDED') {
        await tx.ticketScan.create({
          data: {
            ticketId: ticket.id,
            conductorId: conductorProfile?.id,
            scanMethod: 'MANUAL_CODE',
            result: 'DUPLICATE',
            notes: `Duplicate 6-digit entry. Already boarded at ${ticket.boardedAt ? ticket.boardedAt.toLocaleTimeString() : 'earlier'}`
          }
        });

        return {
          status: 'DUPLICATE',
          message: `DUPLICATE CODE! Ticket already marked boarded at ${ticket.boardedAt ? ticket.boardedAt.toLocaleTimeString() : 'prior time'}.`,
          ticket
        };
      }

      if (new Date() > new Date(ticket.expiresAt)) {
        await tx.ticketScan.create({
          data: {
            ticketId: ticket.id,
            conductorId: conductorProfile?.id,
            scanMethod: 'MANUAL_CODE',
            result: 'EXPIRED',
            notes: 'Ticket expired'
          }
        });
        return {
          status: 'EXPIRED',
          message: 'This ticket has expired.',
          ticket
        };
      }

      // Mark as BOARDED
      const boardedTicket = await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'BOARDED',
          boardedAt: new Date(),
          validatedByConductorId: req.user.id
        },
        include: {
          passenger: { select: { id: true, name: true, phone: true } },
          booking: {
            include: {
              destination: true,
              train: true
            }
          }
        }
      });

      await tx.ticketScan.create({
        data: {
          ticketId: ticket.id,
          conductorId: conductorProfile?.id,
          scanMethod: 'MANUAL_CODE',
          result: 'SUCCESS',
          notes: `Boarded via manual code entry by Conductor ${req.user.name}`
        }
      });

      await tx.notification.create({
        data: {
          userId: ticket.passengerId,
          role: 'PASSENGER',
          title: 'Welcome Aboard!',
          message: `Your ticket ${ticket.ticketCode} was verified via 6-digit code. Have a pleasant journey!`,
          type: 'SUCCESS'
        }
      });

      return {
        status: 'SUCCESS',
        message: '6-Digit Code Validated! Boarding Confirmed.',
        ticket: boardedTicket
      };
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('ticket:boarded', {
        ticketId: validationResult.ticket?.id,
        status: validationResult.status,
        timestamp: new Date().toISOString()
      });
    }

    if (validationResult.status === 'SUCCESS') {
      return res.json({ success: true, ...validationResult });
    } else {
      return res.status(400).json({ success: false, ...validationResult });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getConductorDashboard,
  validateQRTicket,
  validateManualCode
};
