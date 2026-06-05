const Appointment = require('../models/appointment.model');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /api/appointments
const getAppointments = asyncHandler(async (req, res) => {
  const { date, doctorId, patientId, status, page = 1, limit = 20 } = req.query;
  const query = {};

  if (date) {
    const d = new Date(date);
    query.date = { $gte: d, $lt: new Date(d.setDate(d.getDate() + 1)) };
  }
  if (doctorId) query.doctor = doctorId;
  if (patientId) query.patient = patientId;
  if (status) query.status = status;

  const total = await Appointment.countDocuments(query);
  const appointments = await Appointment.find(query)
    .populate('patient', 'name patientId phone')
    .populate('doctor', 'name specialization')
    .sort({ date: 1, timeSlot: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ appointments, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/appointments/:id
const getAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id)
    .populate('patient')
    .populate('doctor');
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  res.json(appt);
});

// POST /api/appointments
const createAppointment = asyncHandler(async (req, res) => {
  const { doctor, date, timeSlot } = req.body;

  // Check slot conflict
  const conflict = await Appointment.findOne({
    doctor,
    date: {
      $gte: new Date(date),
      $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
    },
    timeSlot,
    status: { $nin: ['cancelled', 'no-show'] },
  });

  if (conflict) return res.status(409).json({ message: 'This time slot is already booked' });

  const appt = await Appointment.create({ ...req.body, createdBy: req.user._id });
  await appt.populate('patient', 'name patientId');
  await appt.populate('doctor', 'name specialization');

  res.status(201).json(appt);
});

// PUT /api/appointments/:id
const updateAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('patient', 'name patientId')
    .populate('doctor', 'name specialization');
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  res.json(appt);
});

// PUT /api/appointments/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const { status, cancelReason } = req.body;
  const appt = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status, ...(cancelReason && { cancelReason }) },
    { new: true }
  );
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  res.json(appt);
});

// GET /api/appointments/today
const getTodayAppointments = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await Appointment.find({
    date: { $gte: today, $lt: tomorrow },
    status: { $nin: ['cancelled'] },
  })
    .populate('patient', 'name patientId phone')
    .populate('doctor', 'name specialization')
    .sort({ timeSlot: 1 });

  res.json(appointments);
});

module.exports = { getAppointments, getAppointment, createAppointment, updateAppointment, updateStatus, getTodayAppointments };
