const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // "09:30"
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    type: {
      type: String,
      enum: ['consultation', 'follow-up', 'emergency', 'procedure', 'lab-visit'],
      default: 'consultation',
    },
    notes: { type: String },
    symptoms: [{ type: String }],
    fee: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    cancelReason: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate appointmentId
appointmentSchema.pre('save', async function (next) {
  if (this.appointmentId) return next();
  const count = await mongoose.model('Appointment').countDocuments();
  this.appointmentId = `APT-${String(count + 1).padStart(6, '0')}`;
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
