const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');

// Strictly Protected Admin Endpoints
router.use(authenticate, requireAdmin);

// Dashboard Overview
router.get('/dashboard', adminController.getDashboardOverview);

// User & Passenger Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.get('/passengers', adminController.getPassengers);

// Trains & Live Monitoring
router.get('/trains', adminController.getTrains);
router.patch('/trains/:id', adminController.updateTrainStatus);

// Passenger Pools
router.get('/pools', adminController.getPools);
router.post('/pools/:id/approve', adminController.approvePool);
router.post('/pools/:id/reject', adminController.rejectPool);

// Destinations
router.get('/destinations', adminController.getDestinations);
router.post('/destinations', adminController.createDestination);
router.put('/destinations/:id', adminController.updateDestination);

// Fleet & Drivers
router.get('/vehicles', adminController.getVehicles);
router.post('/vehicles', adminController.createVehicle);
router.put('/vehicles/:id', adminController.updateVehicle);
router.get('/drivers', adminController.getDrivers);

// Dispatches
router.get('/dispatches', adminController.getDispatches);
router.patch('/dispatches/:id/status', adminController.updateDispatchStatus);

// Payments & Tickets
router.get('/payments', adminController.getPayments);
router.get('/tickets', adminController.getTickets);

// Analytics & Reports
router.get('/analytics', adminController.getDemandAnalytics);
router.get('/reports', adminController.getReportData);

module.exports = router;
