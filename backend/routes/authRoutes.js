
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get logged-in user details
router.get('/me', authenticateToken, authController.getMe);

// Update user profile
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
