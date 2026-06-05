const MedicalRecord = require('../models/record.model');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /api/records/:patientId
const getPatientRecords = asyncHandler(async (req, res) => {
  const records = await MedicalRecord.find({ patient: req.params.patientId })
    .populate('doctor', 'name specialization')
    .populate('appointment', 'appointmentId date timeSlot')
    .sort({ visitDate: -1 });
  res.json(records);
});

// GET /api/records/single/:id
const getRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id)
    .populate('patient', 'name patientId')
    .populate('doctor', 'name specialization qualification');
  if (!record) return res.status(404).json({ message: 'Record not found' });
  res.json(record);
});

// POST /api/records
const createRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.create({ ...req.body, createdBy: req.user._id });
  await record.populate('patient', 'name patientId');
  await record.populate('doctor', 'name specialization');
  res.status(201).json(record);
});

// PUT /api/records/:id
const updateRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!record) return res.status(404).json({ message: 'Record not found' });
  res.json(record);
});

// DELETE /api/records/:id
const deleteRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findByIdAndDelete(req.params.id);
  if (!record) return res.status(404).json({ message: 'Record not found' });
  res.json({ message: 'Record deleted' });
});

module.exports = { getPatientRecords, getRecord, createRecord, updateRecord, deleteRecord };
