
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth');

// Public: Browse freelancers
router.get(
  '/freelancers',
  userController.getFreelancers
);

// Admin: Get all users
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  userController.getAllUsers
);

// Authenticated: Get user by ID
router.get(
  '/:id',
  authenticateToken,
  userController.getUserById
);

// Admin: Activate or deactivate a user
router.patch(
  '/:id/toggle-status',
  authenticateToken,
  authorizeRoles('admin'),
  userController.toggleUserStatus
);

// Admin: Delete a user
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  userController.deleteUser
);

module.exports = router;
