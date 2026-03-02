const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PatientSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, select: false },
  phone: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  gender: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  height: { type: String, default: '' },
  weight: { type: String, default: '' },
  allergies: { type: String, default: '' },
  currentMedications: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  address: { type: String, default: '' },
  insuranceProvider: { type: String, default: '' },
  insuranceId: { type: String, default: '' },
  profileImage: { type: String, default: null },
  role: { type: String, default: 'patient' },
  medicalHistory: [{
    condition: String,
    diagnosedDate: String,
    notes: String,
    recordedAt: { type: Date, default: Date.now }
  }],
  lastVisit: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Only hash password if it exists and is modified
PatientSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Only compare if password exists
PatientSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Patient', PatientSchema);