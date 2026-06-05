const express = require('express');
const router = express.Router();
const { getAppointments, getAppointment, createAppointment, updateAppointment, updateStatus, getTodayAppointments } = require('../controllers/appointment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/today', getTodayAppointments);
router.get('/', getAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointment);
router.put('/:id', updateAppointment);
router.put('/:id/status', updateStatus);

module.exports = router;
