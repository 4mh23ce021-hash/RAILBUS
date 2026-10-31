const prisma = require('../config/prisma');
const { computeDemandAnalytics } = require('../algorithms/demandAnalysis');
const { POOL_RULES } = require('../algorithms/poolingAlgorithm');

/**
 * Admin Dashboard Operational Overview Metrics
 */
async function getDashboardOverview(req, res, next) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalUsers,
      totalPassengers,
      activePassengers,
      totalBookings,
      pendingBookings,
      allPools,
      monitoredTrains,
      delayedTrains,
      vehicles,
      activeDispatches,
      payments,
      tickets
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PASSENGER' } }),
      prisma.user.count({ where: { role: 'PASSENGER', status: 'ACTIVE' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.passengerPool.findMany(),
      prisma.train.count(),
      prisma.train.count({ where: { status: 'DELAYED' } }),
      prisma.vehicle.findMany(),
      prisma.dispatchRecord.count({ where: { status: { in: ['SCHEDULED', 'BOARDING'] } } }),
      prisma.payment.findMany(),
      prisma.ticket.findMany()
    ]);

    const activePools = allPools.filter(p => ['FORMING', 'ELIGIBLE_FOR_REVIEW', 'APPROVED', 'FULL'].includes(p.status)).length;
    const poolsAwaitingApproval = allPools.filter(p => p.status === 'ELIGIBLE_FOR_REVIEW').length;
    const approvedPools = allPools.filter(p => p.status === 'APPROVED').length;
    const fullPools = allPools.filter(p => p.status === 'FULL').length;

    const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
    const totalPaymentVolume = payments
      .filter(p => p.status === 'CAPTURED')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingRefunds = payments.filter(p => p.status === 'REFUNDED').length;
    const successfulBoardings = tickets.filter(t => t.status === 'BOARDED').length;

    // Recent Activity / Feed
    const recentBookings = await prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        passenger: { select: { id: true, name: true, phone: true } },
        destination: true,
        train: true
      }
    });

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, role: true } }
      }
    });

    return res.json({
      success: true,
      metrics: {
        totalUsers,
        totalPassengers,
        activePassengers,
        totalBookings,
        pendingBookings,
        activePools,
        poolsAwaitingApproval,
        approvedPools,
        fullPools,
        monitoredTrains,
        delayedTrains,
        availableVehicles,
        totalVehicles: vehicles.length,
        activeDispatches,
        totalPaymentVolume,
        pendingRefunds,
        successfulBoardings
      },
      recentBookings,
      recentAuditLogs
    });
  } catch (err) {
    next(err);
  }
}

/**
 * User Management
 */
async function getUsers(req, res, next) {
  try {
    const { search, role, status } = req.query;
    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { bookings: true, tickets: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle User Status (Activate/Suspend)
 */
async function toggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    // Protect demo admin from suspension
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (targetUser && targetUser.email === 'admin@railbus.demo') {
      return res.status(403).json({ success: false, message: 'Primary demo admin account cannot be suspended.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, status: true, role: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_USER_STATUS',
        resource: 'USER',
        details: `Updated user ${updated.email} status to ${status}`
      }
    });

    return res.json({ success: true, user: updated, message: `User status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
}

/**
 * Passenger Management
 */
async function getPassengers(req, res, next) {
  try {
    const { trainId, destinationId, bookingStatus, search } = req.query;

    const where = {
      passenger: {
        role: 'PASSENGER'
      }
    };

    if (trainId) where.trainId = trainId;
    if (destinationId) where.destinationId = destinationId;
    if (bookingStatus) where.bookingStatus = bookingStatus;
    if (search) {
      where.passenger = {
        ...where.passenger,
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } }
        ]
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        passenger: {
          select: { id: true, name: true, email: true, phone: true, status: true }
        },
        train: true,
        destination: true,
        pool: true,
        tickets: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, passengers: bookings });
  } catch (err) {
    next(err);
  }
}

/**
 * Train Management & Live Monitoring
 */
async function getTrains(req, res, next) {
  try {
    const trains = await prisma.train.findMany({
      include: {
        _count: {
          select: { bookings: true, passengerPools: true }
        }
      },
      orderBy: { scheduledArrival: 'asc' }
    });
    return res.json({ success: true, trains });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Train Operational Data (Delays, Platform, Status)
 */
async function updateTrainStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { delayMinutes, platform, status, estimatedArrival } = req.body;

    const train = await prisma.train.update({
      where: { id },
      data: {
        delayMinutes: delayMinutes !== undefined ? parseInt(delayMinutes, 10) : undefined,
        platform: platform || undefined,
        status: status || undefined,
        estimatedArrival: estimatedArrival || undefined,
        lastUpdated: new Date()
      }
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('train:status_updated', {
        trainId: train.id,
        trainNumber: train.trainNumber,
        delayMinutes: train.delayMinutes,
        status: train.status,
        estimatedArrival: train.estimatedArrival,
        platform: train.platform
      });
    }

    return res.json({ success: true, message: 'Train operational data updated.', train });
  } catch (err) {
    next(err);
  }
}

/**
 * Pool Management
 */
async function getPools(req, res, next) {
  try {
    const { status, destinationId, trainId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (destinationId) where.destinationId = destinationId;
    if (trainId) where.trainId = trainId;

    const pools = await prisma.passengerPool.findMany({
      where,
      include: {
        destination: true,
        train: true,
        assignedVehicle: true,
        members: {
          include: {
            passenger: { select: { id: true, name: true, phone: true } },
            booking: { include: { tickets: true } }
          }
        },
        dispatchRecords: {
          include: {
            vehicle: true,
            driver: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, pools });
  } catch (err) {
    next(err);
  }
}

/**
 * Approve Passenger Pool (Assign Vehicle & authorize dispatch)
 */
async function approvePool(req, res, next) {
  try {
    const { id } = req.params;
    const { vehicleId, targetBoardingWindow } = req.body;

    const pool = await prisma.passengerPool.findUnique({
      where: { id },
      include: { destination: true, train: true }
    });

    if (!pool) {
      return res.status(404).json({ success: false, message: 'Pool not found.' });
    }

    // Capacity verification
    let vehicle = null;
    if (vehicleId) {
      vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Assigned vehicle not found.' });
      }
      if (pool.currentPassengerCount > vehicle.capacity) {
        return res.status(400).json({
          success: false,
          message: `Cannot approve pool. Passenger count (${pool.currentPassengerCount}) exceeds vehicle capacity (${vehicle.capacity}).`
        });
      }
    }

    // Update pool status
    const updatedPool = await prisma.passengerPool.update({
      where: { id },
      data: {
        status: 'APPROVED',
        assignedVehicleId: vehicleId || undefined,
        targetBoardingWindow: targetBoardingWindow || pool.targetBoardingWindow
      },
      include: {
        destination: true,
        train: true,
        assignedVehicle: true
      }
    });

    // Update vehicle status to ASSIGNED if vehicle was selected
    if (vehicleId) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'ASSIGNED' }
      });
    }

    // Create Dispatch Record automatically
    const dispatchCode = `DSP-MYS-${Date.now().toString().slice(-6)}`;
    const scheduledDeparture = updatedPool.targetBoardingWindow ? updatedPool.targetBoardingWindow.split('-')[1]?.trim() || '13:30' : '13:30';

    if (vehicleId) {
      await prisma.dispatchRecord.create({
        data: {
          dispatchCode,
          poolId: pool.id,
          vehicleId,
          scheduledDeparture,
          departureBay: 'Bay 3 (KSRTC City Connector)',
          status: 'SCHEDULED',
          approvedByAdminId: req.user.id
        }
      });
    }

    // Broadcast Socket.IO update
    const io = req.app.get('io');
    if (io) {
      io.emit('pool:approved', {
        poolId: pool.id,
        poolCode: pool.poolCode,
        status: 'APPROVED',
        assignedVehicle: vehicle ? vehicle.busNumber : null
      });
      io.emit('pool:updated', {
        poolId: pool.id,
        status: 'APPROVED',
        currentPassengerCount: pool.currentPassengerCount
      });
    }

    return res.json({
      success: true,
      message: `Pool ${pool.poolCode} approved successfully and vehicle scheduled.`,
      pool: updatedPool
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reject Passenger Pool
 */
async function rejectPool(req, res, next) {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const pool = await prisma.passengerPool.findUnique({ where: { id } });
    if (!pool) {
      return res.status(404).json({ success: false, message: 'Pool not found.' });
    }

    const updatedPool = await prisma.passengerPool.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason || 'Operational capacity constraints'
      }
    });

    // Notify all passengers in this cancelled pool of bus cancellation and instant refund
    const poolBookings = await prisma.booking.findMany({
      where: { poolId: pool.id },
      include: { destination: true }
    });

    const io = req.app.get('io');

    for (const b of poolBookings) {
      await prisma.notification.create({
        data: {
          userId: b.passengerId,
          role: 'PASSENGER',
          title: '⚠️ KSRTC Feeder Bus Cancelled',
          message: `Feeder bus for ${b.destination.name} (Booking ${b.bookingCode}) was cancelled: ${rejectionReason || 'Operational constraints'}. 100% instant refund is available in My Trips.`,
          type: 'ALERT',
          linkUrl: '/passenger/trips'
        }
      });
      if (io) {
        io.to(`passenger:${b.passengerId}`).emit('booking:updated', {
          bookingId: b.id,
          status: 'CANCELLED'
        });
      }
    }

    if (io) {
      io.emit('pool:rejected', {
        poolId: pool.id,
        poolCode: pool.poolCode,
        rejectionReason
      });
      io.emit('pool:updated', {
        poolId: pool.id,
        status: 'REJECTED',
        currentPassengerCount: pool.currentPassengerCount
      });
    }

    return res.json({
      success: true,
      message: `Pool ${pool.poolCode} rejected. Reason logged.`,
      pool: updatedPool
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Destination Management (CRUD)
 */
async function getDestinations(req, res, next) {
  try {
    const destinations = await prisma.destination.findMany({
      include: {
        _count: {
          select: { bookings: true, passengerPools: true, routes: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, destinations });
  } catch (err) {
    next(err);
  }
}

async function createDestination(req, res, next) {
  try {
    const { name, address, latitude, longitude, category, baseFare, estimatedTravelMinutes } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const destination = await prisma.destination.create({
      data: {
        name,
        slug,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        category: category || 'City Zone',
        baseFare: parseFloat(baseFare) || 35.0,
        estimatedTravelMinutes: parseInt(estimatedTravelMinutes, 10) || 20,
        isActive: true
      }
    });

    return res.status(201).json({ success: true, message: 'Destination added.', destination });
  } catch (err) {
    next(err);
  }
}

async function updateDestination(req, res, next) {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude, category, baseFare, estimatedTravelMinutes, isActive } = req.body;

    const destination = await prisma.destination.update({
      where: { id },
      data: {
        name: name || undefined,
        address: address || undefined,
        latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
        category: category || undefined,
        baseFare: baseFare !== undefined ? parseFloat(baseFare) : undefined,
        estimatedTravelMinutes: estimatedTravelMinutes !== undefined ? parseInt(estimatedTravelMinutes, 10) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined
      }
    });

    return res.json({ success: true, message: 'Destination updated.', destination });
  } catch (err) {
    next(err);
  }
}

/**
 * Vehicle Management (CRUD)
 */
async function getVehicles(req, res, next) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { busNumber: 'asc' }
    });
    return res.json({ success: true, vehicles });
  } catch (err) {
    next(err);
  }
}

async function createVehicle(req, res, next) {
  try {
    const { busNumber, registrationNumber, vehicleType, capacity, status, depot } = req.body;
    const vehicle = await prisma.vehicle.create({
      data: {
        busNumber,
        registrationNumber,
        vehicleType: vehicleType || 'KSRTC Sarige / City Express',
        capacity: parseInt(capacity, 10) || 56,
        status: status || 'AVAILABLE',
        depot: depot || 'Mysuru Central Depot 1'
      }
    });
    return res.status(201).json({ success: true, message: 'Vehicle added to fleet.', vehicle });
  } catch (err) {
    next(err);
  }
}

async function updateVehicle(req, res, next) {
  try {
    const { id } = req.params;
    const { status, depot, capacity } = req.body;
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        status: status || undefined,
        depot: depot || undefined,
        capacity: capacity ? parseInt(capacity, 10) : undefined
      }
    });
    return res.json({ success: true, message: 'Vehicle record updated.', vehicle });
  } catch (err) {
    next(err);
  }
}

/**
 * Driver Management
 */
async function getDrivers(req, res, next) {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, drivers });
  } catch (err) {
    next(err);
  }
}

/**
 * Dispatch Management
 */
async function getDispatches(req, res, next) {
  try {
    const dispatches = await prisma.dispatchRecord.findMany({
      include: {
        pool: {
          include: {
            destination: true,
            train: true
          }
        },
        vehicle: true,
        driver: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, dispatches });
  } catch (err) {
    next(err);
  }
}

async function updateDispatchStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, actualDeparture, driverId } = req.body;

    const dispatch = await prisma.dispatchRecord.update({
      where: { id },
      data: {
        status: status || undefined,
        actualDeparture: actualDeparture || undefined,
        driverId: driverId || undefined
      },
      include: { vehicle: true, pool: true }
    });

    // If departed, update vehicle status to IN_TRANSIT
    if (status === 'DEPARTED' && dispatch.vehicleId) {
      await prisma.vehicle.update({
        where: { id: dispatch.vehicleId },
        data: { status: 'IN_TRANSIT' }
      });
      await prisma.passengerPool.update({
        where: { id: dispatch.poolId },
        data: { status: 'DISPATCHED' }
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('dispatch:updated', {
        dispatchId: dispatch.id,
        status: dispatch.status,
        poolId: dispatch.poolId
      });
    }

    return res.json({ success: true, message: 'Dispatch status updated.', dispatch });
  } catch (err) {
    next(err);
  }
}

/**
 * Payment Management
 */
async function getPayments(req, res, next) {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        passenger: { select: { id: true, name: true, email: true, phone: true } },
        booking: {
          include: {
            destination: true,
            train: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
}

/**
 * Ticket Management
 */
async function getTickets(req, res, next) {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        passenger: { select: { id: true, name: true, phone: true } },
        booking: {
          include: {
            destination: true,
            train: true,
            pool: { include: { assignedVehicle: true } }
          }
        },
        scans: {
          include: { conductor: true },
          orderBy: { scannedAt: 'desc' }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });
    return res.json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
}

/**
 * Demand Analytics Endpoint
 */
async function getDemandAnalytics(req, res, next) {
  try {
    const analytics = await computeDemandAnalytics();
    return res.json({ success: true, analytics });
  } catch (err) {
    next(err);
  }
}

/**
 * Operational Reports CSV Export Data
 */
async function getReportData(req, res, next) {
  try {
    const { reportType } = req.query; // 'bookings', 'pools', 'revenue', 'boarding'

    if (reportType === 'pools') {
      const pools = await prisma.passengerPool.findMany({
        include: { destination: true, train: true, assignedVehicle: true }
      });
      const rows = pools.map(p => ({
        'Pool Code': p.poolCode,
        'Destination': p.destination.name,
        'Train Number': p.train.trainNumber,
        'Train Name': p.train.trainName,
        'Date': p.journeyDate,
        'Status': p.status,
        'Passengers': p.currentPassengerCount,
        'Assigned Bus': p.assignedVehicle ? p.assignedVehicle.busNumber : 'Unassigned',
        'Boarding Window': p.targetBoardingWindow || 'N/A'
      }));
      return res.json({ success: true, reportType, rows });
    }

    // Default: Bookings report
    const bookings = await prisma.booking.findMany({
      include: { passenger: { select: { name: true, phone: true } }, destination: true, train: true, tickets: true }
    });
    const rows = bookings.map(b => ({
      'Booking Code': b.bookingCode,
      'Passenger': b.passenger.name,
      'Contact': b.passenger.phone ? '***' + b.passenger.phone.slice(-4) : 'N/A',
      'Train': `${b.train.trainNumber} - ${b.train.trainName}`,
      'Destination': b.destination.name,
      'Seats': b.passengerCount,
      'Fare (INR)': b.totalFare,
      'Payment Status': b.paymentStatus,
      'Booking Status': b.bookingStatus,
      'Date': b.journeyDate
    }));

    return res.json({ success: true, reportType: reportType || 'bookings', rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardOverview,
  getUsers,
  toggleUserStatus,
  getPassengers,
  getTrains,
  updateTrainStatus,
  getPools,
  approvePool,
  rejectPool,
  getDestinations,
  createDestination,
  updateDestination,
  getVehicles,
  createVehicle,
  updateVehicle,
  getDrivers,
  getDispatches,
  updateDispatchStatus,
  getPayments,
  getTickets,
  getDemandAnalytics,
  getReportData
};
