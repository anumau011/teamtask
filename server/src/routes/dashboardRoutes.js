const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', asyncHandler(getDashboard));

module.exports = router;
