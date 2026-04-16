const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authController = require('./controllers/authController');
const appointmentController = require('./controllers/appointmentController');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
if (process.env.MONGO_URI) {
  connectDB(process.env.MONGO_URI);
}

// ─── AUTH ROUTES ─────────────────────────────────────────────
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login',    authController.login);

// Get current user profile
app.get('/api/auth/me', protect, async (req, res) => {
  res.json(req.user);
});

// Update profile
app.put('/api/auth/me', protect, async (req, res) => {
  try {
    const User = require('./models/User');
    const allowed = ['name','phone','dob','gender','bloodGroup','bio',
                     'specialty','hospital','fee','experience','address','emergencyContact'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── APPOINTMENT ROUTES ───────────────────────────────────────
app.post('/api/appointments',      protect, appointmentController.createAppointment);
app.get('/api/appointments',       protect, appointmentController.getAppointments);
app.delete('/api/appointments/:id',protect, appointmentController.deleteAppointment);

// Update appointment status (doctor action)
app.put('/api/appointments/:id', protect, async (req, res) => {
  try {
    const Appointment = require('./models/Appointment');
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    if (!appt) return res.status(404).json({ error: 'Not found' });
    res.json(appt);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── DOCTORS LIST (public) ────────────────────────────────────
app.get('/api/doctors', async (req, res) => {
  try {
    const User = require('./models/User');
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .limit(50);
    res.json(doctors);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single doctor
app.get('/api/doctors/:id', async (req, res) => {
  try {
    const User = require('./models/User');
    const doc = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');
    if (!doc) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MediCare+ API running on port ${PORT}`));
