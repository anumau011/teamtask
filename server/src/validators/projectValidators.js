const { body } = require('express-validator');

const createProjectValidators = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim()
];

const addMemberValidators = [
  body('userId').trim().notEmpty().withMessage('Valid userId is required')
];

module.exports = {
  createProjectValidators,
  addMemberValidators
};
