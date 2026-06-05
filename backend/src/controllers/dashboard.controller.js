const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');
const Appointment = require('../models/appointment.model');
const MedicalRecord = require('../models/record.model');
const Billing = require('../models/billing.model');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /api/dashboard/stats
const getStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalPatients,
    totalDoctors,
    todayAppointments,
    pendingAppointments,
    monthlyRevenue,
    totalRevenue,
    recentPatients,
  ] = await Promise.all([
    Patient.countDocuments({ status: 'active' }),
    Doctor.countDocuments({ isActive: true }),
    Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: { $nin: ['cancelled'] } }),
    Appointment.countDocuments({ status: { $in: ['scheduled', 'confirmed'] } }),
    Billing.aggregate([
      { $match: { paymentDate: { $gte: thisMonthStart }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]),
    Billing.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]),
    Patient.find({ status: 'active' }).sort({ createdAt: -1 }).limit(5).select('name patientId phone createdAt'),
  ]);

  res.json({
    totalPatients,
    totalDoctors,
    todayAppointments,
    pendingAppointments,
    monthlyRevenue: monthlyRevenue[0]?.total || 0,
    totalRevenue: totalRevenue[0]?.total || 0,
    recentPatients,
  });
});

// GET /api/dashboard/appointments-chart
const getAppointmentsChart = asyncHandler(async (req, res) => {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    last7Days.push(d);
  }

  const data = await Promise.all(
    last7Days.map(async (day) => {
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const count = await Appointment.countDocuments({ date: { $gte: day, $lt: next } });
      return {
        date: day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        appointments: count,
      };
    })
  );

  res.json(data);
});

// GET /api/dashboard/revenue-chart
const getRevenueChart = asyncHandler(async (req, res) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const data = await Promise.all(
    months.map(async ({ year, month }) => {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);
      const result = await Billing.aggregate([
        { $match: { createdAt: { $gte: start, $lt: end } } },
        { $group: { _id: null, revenue: { $sum: '$amountPaid' }, invoices: { $sum: 1 } } },
      ]);
      return {
        month: start.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        revenue: result[0]?.revenue || 0,
        invoices: result[0]?.invoices || 0,
      };
    })
  );

  res.json(data);
});

// GET /api/dashboard/department-stats
const getDepartmentStats = asyncHandler(async (req, res) => {
  const stats = await Appointment.aggregate([
    {
      $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doctorInfo' },
    },
    { $unwind: '$doctorInfo' },
    {
      $group: {
        _id: '$doctorInfo.department',
        appointments: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    { $sort: { appointments: -1 } },
  ]);
  res.json(stats);
});

module.exports = { getStats, getAppointmentsChart, getRevenueChart, getDepartmentStats };
