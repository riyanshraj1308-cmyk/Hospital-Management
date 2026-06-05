const express = require('express');
const router = express.Router();
const { getStats, getAppointmentsChart, getRevenueChart, getDepartmentStats } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/stats', getStats);
router.get('/appointments-chart', getAppointmentsChart);
router.get('/revenue-chart', getRevenueChart);
router.get('/department-stats', getDepartmentStats);

module.exports = router;
