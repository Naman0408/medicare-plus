const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor'], default: 'patient' },
  phone: { type: String },
  dob: { type: Date },
  gender: { type: String },
  bloodGroup: { type: String },
  bio: { type: String },
  // Doctor-specific
  specialty: { type: String },
  licenseNo: { type: String },
  experience: { type: Number },
  hospital: { type: String },
  fee: { type: Number },
  // Patient-specific
  address: { type: String },
  emergencyContact: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
