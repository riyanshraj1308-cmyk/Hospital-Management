require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const connectDB = require('./db');

const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');
const Appointment = require('../models/appointment.model');

const seed = async () => {
  await connectDB();

  console.log('🌱 Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
  ]);

  // ✅ Pass plain-text passwords — the User model's pre('save') hook hashes them
  console.log('👤 Creating users...');
  const adminUser = await User.create({
    name: 'System Admin',
    email: 'admin@medicore.com',
    password: 'Admin@123',
    role: 'admin',
  });

  const doctorUser = await User.create({
    name: 'Dr. Arjun Sharma',
    email: 'doctor@medicore.com',
    password: 'Doctor@123',
    role: 'doctor',
  });

  await User.create({
    name: 'Priya Mehta',
    email: 'reception@medicore.com',
    password: 'Reception@123',
    role: 'receptionist',
  });

  console.log('🩺 Creating doctors...');
  const doctor = await Doctor.create({
    userId: doctorUser._id,
    name: 'Dr. Arjun Sharma',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD (Cardiology)',
    experience: 12,
    phone: '+91-9876543210',
    email: 'doctor@medicore.com',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'],
    consultationFee: 800,
    department: 'Cardiology',
  });

  const doctor2 = await Doctor.create({
    name: 'Dr. Neha Gupta',
    specialization: 'Pediatrics',
    qualification: 'MBBS, DCH',
    experience: 8,
    phone: '+91-9876543211',
    email: 'neha@medicore.com',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableSlots: ['10:00', '10:30', '11:00', '11:30', '16:00', '16:30'],
    consultationFee: 600,
    department: 'Pediatrics',
  });

  console.log('👥 Creating patients...');
  const patients = await Patient.insertMany([
    {
      patientId: 'P-000001',
      name: 'Rahul Verma',
      age: 45,
      gender: 'Male',
      phone: '+91-9123456789',
      email: 'rahul@example.com',
      address: '12, MG Road, Aligarh, UP',
      bloodGroup: 'B+',
      allergies: ['Penicillin'],
      emergencyContact: { name: 'Sunita Verma', phone: '+91-9123456780', relation: 'Wife' },
    },
    {
      patientId: 'P-000002',
      name: 'Sunita Agarwal',
      age: 32,
      gender: 'Female',
      phone: '+91-9234567890',
      email: 'sunita@example.com',
      address: '45, Civil Lines, Aligarh, UP',
      bloodGroup: 'A+',
      allergies: [],
      emergencyContact: { name: 'Ramesh Agarwal', phone: '+91-9234567891', relation: 'Husband' },
    },
    {
      patientId: 'P-000003',
      name: 'Kartik Singh',
      age: 8,
      gender: 'Male',
      phone: '+91-9345678901',
      email: 'kartik@example.com',
      address: '78, Dodhpur, Aligarh, UP',
      bloodGroup: 'O+',
      allergies: ['Dust'],
      emergencyContact: { name: 'Mohan Singh', phone: '+91-9345678902', relation: 'Father' },
    },
  ]);

  console.log('📅 Creating appointments...');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await Appointment.insertMany([
    {
      appointmentId: 'APT-000001',
      patient: patients[0]._id,
      doctor: doctor._id,
      date: today,
      timeSlot: '10:00',
      status: 'confirmed',
      type: 'consultation',
      notes: 'Follow-up for hypertension',
      fee: 800,
    },
    {
      appointmentId: 'APT-000002',
      patient: patients[1]._id,
      doctor: doctor._id,
      date: tomorrow,
      timeSlot: '11:00',
      status: 'scheduled',
      type: 'consultation',
      notes: 'Chest pain complaint',
      fee: 800,
    },
    {
      appointmentId: 'APT-000003',
      patient: patients[2]._id,
      doctor: doctor2._id,
      date: tomorrow,
      timeSlot: '10:30',
      status: 'scheduled',
      type: 'consultation',
      notes: 'Routine checkup',
      fee: 600,
    },
  ]);

  console.log('\n✅ Seed complete!');
  console.log('\n📋 Login Credentials:');
  console.log('  Admin:        admin@medicore.com     / Admin@123');
  console.log('  Doctor:       doctor@medicore.com    / Doctor@123');
  console.log('  Receptionist: reception@medicore.com / Reception@123');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
