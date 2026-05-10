const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { updateRoleValidators } = require('../validators/userValidators');
const { listUsers, updateUserRole } = require('../controllers/userController');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('admin'));
router.get('/', asyncHandler(listUsers));
router.put('/:id/role', updateRoleValidators, validateRequest, asyncHandler(updateUserRole));

module.exports = router;
