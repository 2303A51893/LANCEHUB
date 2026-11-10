
const express = require('express');
const router = express.Router();

const bidController = require('../controllers/bidController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth');

// Freelancer submits a bid
router.post(
  '/',
  authenticateToken,
  authorizeRoles('freelancer', 'admin'),
  bidController.submitBid
);

// Freelancer views their own bids
router.get(
  '/my',
  authenticateToken,
  authorizeRoles('freelancer', 'admin'),
  bidController.getMyBids
);

// Project owner views all bids on a project
router.get(
  '/project/:projectId',
  authenticateToken,
  bidController.getBidsForProject
);

// Client accepts a bid
router.post(
  '/:bidId/accept',
  authenticateToken,
  authorizeRoles('client', 'admin'),
  bidController.acceptBid
);

// Client rejects a bid
router.post(
  '/:bidId/reject',
  authenticateToken,
  authorizeRoles('client', 'admin'),
  bidController.rejectBid
);

module.exports = router;
