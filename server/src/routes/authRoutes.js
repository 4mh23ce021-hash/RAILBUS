const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

// Public Auth Endpoints
router.post('/passenger/register', authController.passengerRegister);
router.post('/passenger/login', authController.passengerLogin);
router.post('/admin/login', authController.adminLogin);
router.post('/conductor/login', authController.conductorLogin);

// Protected Auth Verification
router.get('/me', authenticate, authController.getMe);

module.exports = router;
