const { body } = require('express-validator');

const updateRoleValidators = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'project_manager', 'developer'])
    .withMessage('Role must be admin, project_manager, or developer')
];

module.exports = {
  updateRoleValidators
};
