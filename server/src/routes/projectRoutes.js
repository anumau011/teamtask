const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createProjectValidators,
  addMemberValidators
} = require('../validators/projectValidators');
const {
  createProject,
  listProjects,
  getProjectById,
  addMember,
  removeMember
} = require('../controllers/projectController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', asyncHandler(listProjects));
router.get('/:id', asyncHandler(getProjectById));
router.post('/', roleMiddleware('project_manager', 'admin'), createProjectValidators, validateRequest, asyncHandler(createProject));
router.post('/:id/members', roleMiddleware('project_manager', 'admin'), addMemberValidators, validateRequest, asyncHandler(addMember));
router.delete('/:id/members/:userId', roleMiddleware('project_manager', 'admin'), asyncHandler(removeMember));

module.exports = router;
