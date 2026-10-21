const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { verifyToken, requireAdmin } = require('../middleware/authHandler');

router.get('/', verifyToken, requireAdmin, getDashboardStats);

module.exports = router;
