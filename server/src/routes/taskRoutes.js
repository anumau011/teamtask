const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createTaskValidators,
  updateTaskValidators
} = require('../validators/taskValidators');
const {
  createTask,
  listTasks,
  updateTask,
  deleteTask,
  getOverdueTasks
} = require('../controllers/taskController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', asyncHandler(listTasks));
router.get('/overdue', asyncHandler(getOverdueTasks));
router.post('/', roleMiddleware('project_manager', 'admin'), createTaskValidators, validateRequest, asyncHandler(createTask));
router.put('/:id', updateTaskValidators, validateRequest, asyncHandler(updateTask));
router.delete('/:id', roleMiddleware('project_manager', 'admin'), asyncHandler(deleteTask));

module.exports = router;
