const express = require('express');
const router = express.Router();
const conductorController = require('../controllers/conductorController');
const authenticate = require('../middleware/authenticate');
const requireConductor = require('../middleware/requireConductor');

// Protected Conductor Endpoints
router.use(authenticate, requireConductor);

router.get('/dashboard', conductorController.getConductorDashboard);
router.post('/validate-qr', conductorController.validateQRTicket);
router.post('/validate-manual', conductorController.validateManualCode);

module.exports = router;
