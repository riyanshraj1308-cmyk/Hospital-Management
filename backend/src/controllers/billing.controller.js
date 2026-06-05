const Billing = require('../models/billing.model');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /api/billing
const getInvoices = asyncHandler(async (req, res) => {
  const { patientId, status, page = 1, limit = 10 } = req.query;
  const query = {};
  if (patientId) query.patient = patientId;
  if (status) query.paymentStatus = status;

  const total = await Billing.countDocuments(query);
  const invoices = await Billing.find(query)
    .populate('patient', 'name patientId phone')
    .populate('doctor', 'name specialization')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ invoices, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/billing/:id
const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Billing.findById(req.params.id)
    .populate('patient', 'name patientId phone email address')
    .populate('doctor', 'name specialization')
    .populate('appointment');
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json(invoice);
});

// POST /api/billing/invoice
const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await Billing.create({ ...req.body, createdBy: req.user._id });
  await invoice.populate('patient', 'name patientId');
  res.status(201).json(invoice);
});

// PUT /api/billing/:id
const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json(invoice);
});

// PUT /api/billing/:id/pay
const recordPayment = asyncHandler(async (req, res) => {
  const { amountPaid, paymentMethod } = req.body;
  const invoice = await Billing.findById(req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

  invoice.amountPaid = (invoice.amountPaid || 0) + amountPaid;
  invoice.paymentMethod = paymentMethod;
  invoice.paymentDate = new Date();
  await invoice.save();

  res.json(invoice);
});

// GET /api/billing/stats
const getBillingStats = asyncHandler(async (req, res) => {
  const stats = await Billing.aggregate([
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        total: { $sum: '$totalAmount' },
        paid: { $sum: '$amountPaid' },
      },
    },
  ]);
  const totalRevenue = await Billing.aggregate([
    { $group: { _id: null, total: { $sum: '$amountPaid' } } },
  ]);
  res.json({ stats, totalRevenue: totalRevenue[0]?.total || 0 });
});

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, recordPayment, getBillingStats };
