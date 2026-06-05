const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    recordId: { type: String, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    visitDate: { type: Date, default: Date.now },
    chiefComplaint: { type: String },
    diagnosis: [{ type: String }],
    symptoms: [{ type: String }],
    vitalSigns: {
      bloodPressure: String,   // "120/80"
      heartRate: Number,       // bpm
      temperature: Number,     // °C
      weight: Number,          // kg
      height: Number,          // cm
      oxygenSaturation: Number, // %
      respiratoryRate: Number,
    },
    prescriptions: [
      {
        medicine: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      },
    ],
    labTests: [
      {
        testName: String,
        result: String,
        normalRange: String,
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
        reportFile: String, // uploaded file path
      },
    ],
    followUpDate: { type: Date },
    doctorNotes: { type: String },
    attachments: [{ filename: String, path: String, uploadedAt: Date }],
    isConfidential: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

medicalRecordSchema.pre('save', async function (next) {
  if (this.recordId) return next();
  const count = await mongoose.model('MedicalRecord').countDocuments();
  this.recordId = `REC-${String(count + 1).padStart(6, '0')}`;
  next();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
