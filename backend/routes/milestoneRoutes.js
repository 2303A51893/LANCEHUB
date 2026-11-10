
const express = require('express');
const router = express.Router();

const milestoneController = require('../controllers/milestoneController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth');

// Client or admin creates a milestone
router.post(
  '/',
  authenticateToken,
  authorizeRoles('client', 'admin'),
  milestoneController.createMilestone
);

// Get milestones for a contract
router.get(
  '/contract/:contractId',
  authenticateToken,
  milestoneController.getContractMilestones
);

// Freelancer or admin submits a deliverable
router.post(
  '/:milestoneId/deliverables',
  authenticateToken,
  authorizeRoles('freelancer', 'admin'),
  milestoneController.submitDeliverable
);

// Client or admin reviews a deliverable
router.post(
  '/deliverables/:deliverableId/review',
  authenticateToken,
  authorizeRoles('client', 'admin'),
  milestoneController.reviewDeliverable
);

module.exports = router;
