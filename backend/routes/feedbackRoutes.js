
const express = require('express');
const router = express.Router();

const feedbackController = require('../controllers/feedbackController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth');

// Client or admin submits feedback
router.post(
  '/',
  authenticateToken,
  authorizeRoles('client', 'admin'),
  feedbackController.submitFeedback
);

// Get feedback for a freelancer
router.get(
  '/freelancer/:freelancerId',
  feedbackController.getFreelancerFeedback
);

module.exports = router;
