const prisma = require('../config/prisma');

/**
 * Get trains available for booking
 */
async function getTrains(req, res, next) {
  try {
    const trains = await prisma.train.findMany({
      orderBy: { scheduledArrival: 'asc' }
    });
    return res.json({ success: true, trains });
  } catch (err) {
    next(err);
  }
}

/**
 * Get active destinations with coordinates
 */
async function getDestinations(req, res, next) {
  try {
    const destinations = await prisma.destination.findMany({
      where: { isActive: true },
      include: {
        routes: {
          where: { isActive: true },
          include: { stops: { orderBy: { stopOrder: 'asc' } } }
        }
      },
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, destinations });
  } catch (err) {
    next(err);
  }
}

/**
 * Get active routes with stops
 */
async function getRoutes(req, res, next) {
  try {
    const routes = await prisma.route.findMany({
      where: { isActive: true },
      include: {
        destination: true,
        stops: { orderBy: { stopOrder: 'asc' } }
      }
    });
    return res.json({ success: true, routes });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current passenger's bookings
 */
async function getMyBookings(req, res, next) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { passengerId: req.user.id },
      include: {
        train: true,
        destination: true,
        route: true,
        pool: {
          include: {
            assignedVehicle: true
          }
        },
        tickets: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single booking details for authenticated passenger
 */
async function getBookingDetails(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        passengerId: req.user.id
      },
      include: {
        train: true,
        destination: true,
        route: {
          include: { stops: { orderBy: { stopOrder: 'asc' } } }
        },
        pool: {
          include: {
            assignedVehicle: true
          }
        },
        tickets: true,
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized access.'
      });
    }

    return res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
}

/**
 * Get passenger's confirmed digital tickets
 */
async function getMyTickets(req, res, next) {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { passengerId: req.user.id },
      include: {
        booking: {
          include: {
            train: true,
            destination: true,
            pool: {
              include: {
                assignedVehicle: true
              }
            }
          }
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
 * Get passenger profile
 */
async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        passengerProfile: true,
        createdAt: true
      }
    });
    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

/**
 * Update passenger profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, phone, emergencyContact, preferredLanguage } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name ? name.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        passengerProfile: {
          upsert: {
            create: { emergencyContact, preferredLanguage: preferredLanguage || 'en' },
            update: { emergencyContact, preferredLanguage }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        passengerProfile: true
      }
    });
    return res.json({ success: true, message: 'Profile updated successfully.', user: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Get passenger notifications
 */
async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark a single notification as read
 */
async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data: { isRead: true }
    });
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark all notifications as read
 */
async function markAllNotificationsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Trigger test/simulation notifications (Bus Booked, Bus Cancelled, Bus Nearby, Reaching Destination)
 */
async function simulateNotification(req, res, next) {
  try {
    const { type, busNumber, destinationName } = req.body;
    const userId = req.user.id;

    let title = 'KSRTC Feeder Bus Update';
    let message = 'Your transit status has been updated.';
    let notifType = 'INFO';
    let linkUrl = '/passenger/trips';

    const bus = busNumber || 'KA-09-F-4412';
    const dest = destinationName || 'Chamundi Hill';

    if (type === 'BUS_BOOKED') {
      title = '🎉 Feeder Bus Booked & Confirmed!';
      message = `Guaranteed seat confirmed on Bus #${bus} to ${dest}. Boarding at Bay 3 Portico.`;
      notifType = 'SUCCESS';
      linkUrl = '/passenger/trips';
    } else if (type === 'BUS_CANCELLED') {
      title = '⚠️ Feeder Bus Cancelled (Disruption)';
      message = `Feeder Bus #${bus} to ${dest} was cancelled due to track delay. 100% full refund eligible now.`;
      notifType = 'ALERT';
      linkUrl = '/passenger/trips';
    } else if (type === 'BUS_NEARBY') {
      title = '🚌 Feeder Bus Nearby (Within 500m)!';
      message = `Your synchronized bus #${bus} has entered Mysuru Station Portico Bay 3. Ready for boarding!`;
      notifType = 'INFO';
      linkUrl = '/passenger/live-tracking';
    } else if (type === 'DESTINATION_APPROACHING') {
      title = '🔔 2-Minute Destination Proximity Alert!';
      message = `You are reaching ${dest} in approximately 2 minutes! Please prepare your belongings to alight.`;
      notifType = 'WARNING';
      linkUrl = '/passenger/live-tracking';
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        role: 'PASSENGER',
        title,
        message,
        type: notifType,
        linkUrl
      }
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`passenger:${userId}`).emit('notification:new', notification);
    }

    return res.status(201).json({ success: true, notification });
  } catch (err) {
    next(err);
  }
}

/**
 * Multi-Train Platform Synchronization Matrix
 * Pairs up trains arriving at Mysuru Junction within a 10-minute window across different platforms
 */
async function getMultiSyncTrains(req, res, next) {
  try {
    const trains = await prisma.train.findMany({
      orderBy: { estimatedArrival: 'asc' }
    });

    function parseMins(timeStr) {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    }

    const syncGroups = [];
    const pairedIds = new Set();

    for (let i = 0; i < trains.length; i++) {
      const t1 = trains[i];
      if (pairedIds.has(t1.id)) continue;

      const group = {
        primaryTrain: t1,
        synchronizedTrains: [],
        arrivalGapMinutes: 0,
        status: 'STANDALONE', // 'SYNC_ACTIVE' (gap <= 10), 'SPLIT_DUE_TO_DELAY' (gap > 10), 'STANDALONE'
        busAllocation: 'Dedicated Feeder Bus',
        notes: ''
      };

      for (let j = i + 1; j < trains.length; j++) {
        const t2 = trains[j];
        if (pairedIds.has(t2.id)) continue;

        const gap = Math.abs(parseMins(t1.estimatedArrival) - parseMins(t2.estimatedArrival));
        if (gap <= 10) {
          group.synchronizedTrains.push(t2);
          group.arrivalGapMinutes = gap;
          group.status = 'SYNC_ACTIVE';
          group.busAllocation = 'Single Shared Feeder Bus (Platform ' + t1.platform + ' & ' + t2.platform + ' Combined)';
          group.notes = `Both trains arrive within ${gap} mins gap. Passengers merged into one feeder bus!`;
          pairedIds.add(t2.id);
          break;
        } else if (gap <= 30 && (t1.delayMinutes > 0 || t2.delayMinutes > 0)) {
          // Detect delay split condition
          group.synchronizedTrains.push(t2);
          group.arrivalGapMinutes = gap;
          group.status = 'SPLIT_DUE_TO_DELAY';
          group.busAllocation = 'Split Into 2 Dedicated Feeder Buses';
          group.notes = `Delay caused ${gap} mins arrival gap (> 10 min limit). First train passengers depart without waiting for delayed train!`;
          pairedIds.add(t2.id);
          break;
        }
      }

      pairedIds.add(t1.id);
      syncGroups.push(group);
    }

    return res.json({ success: true, syncGroups });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTrains,
  getDestinations,
  getRoutes,
  getMyBookings,
  getBookingDetails,
  getMyTickets,
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  simulateNotification,
  getMultiSyncTrains
};
