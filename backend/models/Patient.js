const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true },
  dateOfBirth: { type: String, default: null },
  gender: { type: String, default: null },
  bloodGroup: { type: String, default: null },
  height: { type: String, default: null },
  weight: { type: String, default: null },
  allergies: { type: String, default: null },
  currentMedications: { type: String, default: null },
  emergencyContact: { type: String, default: null },
  emergencyPhone: { type: String, default: null },
  address: { type: String, default: null },
  insuranceProvider: { type: String, default: null },
  insuranceId: { type: String, default: null },
  profileImage: { type: String, default: null },
  role: { type: String, default: 'patient' },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  },
  assignedDoctor: { type: String, default: '' },
  medicalHistory: [{
    condition: String,
    diagnosedDate: String,
    notes: String,
    recordedAt: { type: Date, default: Date.now }
  }],
  lastVisit: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Encrypt password using bcrypt
PatientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Add matchPassword method
PatientSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('Patient', PatientSchema);