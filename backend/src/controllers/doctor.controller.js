const Doctor = require('../models/doctor.model');
const Appointment = require('../models/appointment.model');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /api/doctors
const getDoctors = asyncHandler(async (req, res) => {
  const { search, specialization, isActive } = req.query;
  const query = {};
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { specialization: { $regex: search, $options: 'i' } }];
  if (specialization) query.specialization = specialization;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const doctors = await Doctor.find(query).sort({ name: 1 });
  res.json(doctors);
});

// GET /api/doctors/:id
const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
});

// POST /api/doctors
const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.status(201).json(doctor);
});

// PUT /api/doctors/:id
const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
});

// GET /api/doctors/:id/available-slots
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Date is required' });

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  if (!doctor.availableDays.includes(dayName)) {
    return res.json({ availableSlots: [], message: 'Doctor is not available on this day' });
  }

  // Get already booked slots
  const booked = await Appointment.find({
    doctor: req.params.id,
    date: {
      $gte: new Date(date),
      $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
    },
    status: { $nin: ['cancelled', 'no-show'] },
  }).select('timeSlot');

  const bookedSlots = booked.map((a) => a.timeSlot);
  const availableSlots = doctor.availableSlots.filter((s) => !bookedSlots.includes(s));

  res.json({ availableSlots, bookedSlots, allSlots: doctor.availableSlots });
});

// GET /api/doctors/specializations
const getSpecializations = asyncHandler(async (req, res) => {
  const specs = await Doctor.distinct('specialization');
  res.json(specs);
});

module.exports = { getDoctors, getDoctor, createDoctor, updateDoctor, getAvailableSlots, getSpecializations };
