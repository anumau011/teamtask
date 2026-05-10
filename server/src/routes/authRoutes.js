const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { registerValidators, loginValidators } = require('../validators/authValidators');
const { register, login, me } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerValidators, validateRequest, asyncHandler(register));
router.post('/login', loginValidators, validateRequest, asyncHandler(login));
router.get('/me', authMiddleware, asyncHandler(me));

module.exports = router;
