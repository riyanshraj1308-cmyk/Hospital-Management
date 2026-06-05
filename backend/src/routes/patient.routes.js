const express = require('express');
const router = express.Router();
const { getPatients, getPatient, createPatient, updatePatient, deletePatient, getPatientHistory } = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', getPatients);
router.post('/', createPatient);
router.get('/:id', getPatient);
router.put('/:id', updatePatient);
router.delete('/:id', authorize('admin'), deletePatient);
router.get('/:id/history', getPatientHistory);

module.exports = router;
