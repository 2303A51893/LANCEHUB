
const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth');

// Public: Get all projects
router.get('/', projectController.getAllProjects);

// Protected: Get current user's projects
router.get(
  '/my/projects',
  authenticateToken,
  projectController.getMyProjects
);

// Public: Get project details
router.get('/:id', projectController.getProjectById);

// Client or admin: Create a project
router.post(
  '/',
  authenticateToken,
  authorizeRoles('client', 'admin'),
  projectController.createProject
);

// Client or admin: Update a project
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('client', 'admin'),
  projectController.updateProject
);

// Client or admin: Delete a project
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('client', 'admin'),
  projectController.deleteProject
);

module.exports = router;
