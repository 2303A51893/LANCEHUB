
const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// Get logged-in user's notifications
router.get(
  '/',
  authenticateToken,
  notificationController.getMyNotifications
);

// Mark one notification as read
router.patch(
  '/:id/read',
  authenticateToken,
  notificationController.markAsRead
);

// Mark all notifications as read
router.post(
  '/mark-all-read',
  authenticateToken,
  notificationController.markAllAsRead
);

module.exports = router;
