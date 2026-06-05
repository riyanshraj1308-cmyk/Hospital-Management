const express = require('express');
const router = express.Router();
const { getDoctors, getDoctor, createDoctor, updateDoctor, getAvailableSlots, getSpecializations } = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/specializations', getSpecializations);
router.get('/', getDoctors);
router.post('/', authorize('admin'), createDoctor);
router.get('/:id', getDoctor);
router.put('/:id', authorize('admin', 'doctor'), updateDoctor);
router.get('/:id/available-slots', getAvailableSlots);

module.exports = router;
