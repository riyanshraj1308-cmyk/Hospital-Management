require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/auth.routes');
const patientRoutes = require('./src/routes/patient.routes');
const doctorRoutes = require('./src/routes/doctor.routes');
const appointmentRoutes = require('./src/routes/appointment.routes');
const recordRoutes = require('./src/routes/record.routes');
const billingRoutes = require('./src/routes/billing.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const { errorHandler } = require('./src/middleware/error.middleware');

const app = express();

connectDB();

// Allow all localhost origins during development
app.use(cors({
  origin: (origin, cb) => cb(null, true),   // allow all origins
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏥 MediCore API running → http://localhost:${PORT}`);
  console.log(`   Health check     → http://localhost:${PORT}/api/health`);
});

module.exports = app;
