const { body } = require('express-validator');

const allowedStatuses = ['todo', 'in_progress', 'done'];
const allowedPriorities = ['low', 'medium', 'high'];

function dueDateNotPast(value) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Due date must be a valid date');
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (parsedDate < startOfToday) {
    throw new Error('Due date cannot be in the past');
  }

  return true;
}

const createTaskValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('projectId').isMongoId().withMessage('Valid projectId is required'),
  body('assignedTo').optional({ checkFalsy: true }).isMongoId().withMessage('Valid assignedTo is required'),
  body('dueDate').notEmpty().withMessage('Due date is required').custom(dueDateNotPast),
  body('description').optional().trim(),
  body('status').optional().isIn(allowedStatuses).withMessage('Status must be todo, in_progress, or done'),
  body('priority').optional().isIn(allowedPriorities).withMessage('Priority must be low, medium, or high')
];

const updateTaskValidators = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('projectId').optional({ checkFalsy: true }).isMongoId().withMessage('ProjectId must be valid'),
  body('assignedTo').optional({ checkFalsy: true }).isMongoId().withMessage('AssignedTo must be valid'),
  body('dueDate').optional().custom(dueDateNotPast),
  body('description').optional().trim(),
  body('status').optional().isIn(allowedStatuses).withMessage('Status must be todo, in_progress, or done'),
  body('priority').optional().isIn(allowedPriorities).withMessage('Priority must be low, medium, or high')
];

module.exports = {
  createTaskValidators,
  updateTaskValidators,
  allowedStatuses,
  allowedPriorities
};
