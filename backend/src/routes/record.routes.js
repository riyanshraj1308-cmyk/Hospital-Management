const express = require('express');
const router = express.Router();
const { getPatientRecords, getRecord, createRecord, updateRecord, deleteRecord } = require('../controllers/record.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/single/:id', getRecord);
router.get('/:patientId', getPatientRecords);
router.post('/', authorize('admin', 'doctor', 'nurse'), createRecord);
router.put('/:id', authorize('admin', 'doctor'), updateRecord);
router.delete('/:id', authorize('admin'), deleteRecord);

module.exports = router;
