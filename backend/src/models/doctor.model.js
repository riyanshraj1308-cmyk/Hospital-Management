const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    qualification: { type: String },
    experience: { type: Number, default: 0 },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String },
    consultationFee: { type: Number, default: 0 },
    availableDays: [
      {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
    ],
    availableSlots: [{ type: String }], // e.g., ["09:00","09:30"]
    maxPatientsPerDay: { type: Number, default: 20 },
    isActive: { type: Boolean, default: true },
    bio: { type: String },
    photo: { type: String },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
