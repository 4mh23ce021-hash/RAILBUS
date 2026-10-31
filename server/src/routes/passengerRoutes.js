const express = require('express');
const router = express.Router();
const passengerController = require('../controllers/passengerController');
const bookingController = require('../controllers/bookingController');
const authenticate = require('../middleware/authenticate');
const requirePassenger = require('../middleware/requirePassenger');

// Public catalog endpoints for exploration
router.get('/trains', passengerController.getTrains);
router.get('/trains/multi-sync', passengerController.getMultiSyncTrains);
router.get('/destinations', passengerController.getDestinations);
router.get('/routes', passengerController.getRoutes);

// Protected Passenger Endpoints
router.use(authenticate, requirePassenger);

router.get('/bookings', passengerController.getMyBookings);
router.get('/bookings/:id', passengerController.getBookingDetails);
router.post('/bookings', bookingController.createBooking);
router.post('/bookings/confirm-payment', bookingController.confirmPaymentAndJoinPool);
router.post('/bookings/:id/refund', bookingController.requestBookingRefund);

router.get('/tickets', passengerController.getMyTickets);
router.get('/profile', passengerController.getProfile);
router.put('/profile', passengerController.updateProfile);

// Notifications & alerts
router.get('/notifications', passengerController.getNotifications);
router.patch('/notifications/:id/read', passengerController.markNotificationRead);
router.post('/notifications/mark-all-read', passengerController.markAllNotificationsRead);
router.post('/notifications/simulate', passengerController.simulateNotification);

module.exports = router;
