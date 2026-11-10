
const express = require('express');
const router = express.Router();

const contractController = require('../controllers/contractController');
const { authenticateToken } = require('../middleware/auth');

// Get all contracts
router.get(
  '/',
  authenticateToken,
  contractController.getAllContracts
);

// Get contract by ID
router.get(
  '/:id',
  authenticateToken,
  contractController.getContractById
);

// Update contract status
router.patch(
  '/:id/status',
  authenticateToken,
  contractController.updateContractStatus
);

module.exports = router;
