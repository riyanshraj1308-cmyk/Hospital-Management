const Patient = require('../models/patient.model');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /api/patients
const getPatients = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { patientId: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;

  const total = await Patient.countDocuments(query);
  const patients = await Patient.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ patients, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/patients/:id
const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
});

// POST /api/patients
const createPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.create({ ...req.body, registeredBy: req.user._id });
  res.status(201).json(patient);
});

// PUT /api/patients/:id
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
});

// DELETE /api/patients/:id (archive)
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { status: 'archived' },
    { new: true }
  );
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json({ message: 'Patient archived successfully' });
});

// GET /api/patients/:id/history
const getPatientHistory = asyncHandler(async (req, res) => {
  const Appointment = require('../models/appointment.model');
  const MedicalRecord = require('../models/record.model');
  const Billing = require('../models/billing.model');

  const [appointments, records, invoices] = await Promise.all([
    Appointment.find({ patient: req.params.id }).populate('doctor', 'name specialization').sort({ date: -1 }),
    MedicalRecord.find({ patient: req.params.id }).populate('doctor', 'name').sort({ visitDate: -1 }),
    Billing.find({ patient: req.params.id }).sort({ createdAt: -1 }),
  ]);

  res.json({ appointments, records, invoices });
});

module.exports = { getPatients, getPatient, createPatient, updatePatient, deletePatient, getPatientHistory };
