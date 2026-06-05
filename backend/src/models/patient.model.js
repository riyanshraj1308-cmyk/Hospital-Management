const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dateOfBirth: { type: Date },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true },
    address: { type: String },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    currentMedications: [{ type: String }],
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
    },
    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    photo: { type: String },
  },
  { timestamps: true }
);

// Auto-generate patientId
patientSchema.pre('save', async function (next) {
  if (this.patientId) return next();
  const count = await mongoose.model('Patient').countDocuments();
  this.patientId = `P-${String(count + 1).padStart(6, '0')}`;
  next();
});

// Virtual: full appointment history (populated separately)
patientSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'patient',
});

patientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
