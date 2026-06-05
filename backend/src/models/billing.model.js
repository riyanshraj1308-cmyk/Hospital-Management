const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    items: [
      {
        description: String,
        quantity: { type: Number, default: 1 },
        unitPrice: Number,
        total: Number,
      },
    ],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },       // percentage
    tax: { type: Number, default: 18 },             // GST percentage
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'insurance', 'bank-transfer', 'other'],
    },
    paymentDate: { type: Date },
    dueDate: { type: Date },
    notes: { type: String },
    insuranceClaim: {
      provider: String,
      claimNumber: String,
      amount: Number,
      status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

billingSchema.pre('save', async function (next) {
  if (this.invoiceId) return next();
  const count = await mongoose.model('Billing').countDocuments();
  this.invoiceId = `INV-${String(count + 1).padStart(6, '0')}`;
  next();
});

// Auto-calculate totals
billingSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);
  const discountAmount = (this.subtotal * this.discount) / 100;
  const afterDiscount = this.subtotal - discountAmount;
  this.taxAmount = (afterDiscount * this.tax) / 100;
  this.totalAmount = afterDiscount + this.taxAmount;
  this.balance = this.totalAmount - this.amountPaid;
  if (this.balance <= 0) this.paymentStatus = 'paid';
  else if (this.amountPaid > 0) this.paymentStatus = 'partial';
  next();
});

module.exports = mongoose.model('Billing', billingSchema);
