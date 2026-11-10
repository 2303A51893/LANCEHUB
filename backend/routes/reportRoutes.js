
const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

// Get dashboard data
router.get(
  '/dashboard',
  authenticateToken,
  reportController.getDashboardData
);

// Get project bids report
router.get(
  '/project-bids',
  authenticateToken,
  reportController.getProjectBidsReport
);

// Get freelancer performance report
router.get(
  '/freelancer-performance',
  authenticateToken,
  reportController.getFreelancerPerformanceReport
);

// Get contract status report
router.get(
  '/contract-status',
  authenticateToken,
  reportController.getContractStatusReport
);

// Get payment milestones report
router.get(
  '/payment-milestones',
  authenticateToken,
  reportController.getPaymentMilestonesReport
);

module.exports = router;
