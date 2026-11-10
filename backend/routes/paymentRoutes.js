
const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth');

// Get all payments
router.get(
  '/',
  authenticateToken,
  paymentController.getAllPayments
);

// Get payment statistics
router.get(
  '/stats',
  authenticateToken,
  paymentController.getPaymentStats
);

// Payment reviewer or admin reviews a payment
router.post(
  '/:paymentId/review',
  authenticateToken,
  authorizeRoles('payment_reviewer', 'admin'),
  paymentController.reviewPayment
);

module.exports = router;
