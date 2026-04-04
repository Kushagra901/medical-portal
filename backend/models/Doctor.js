const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true },
  dateOfBirth: { type: String, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: null },
  specialization: { type: String, required: true },
  license: { type: String, required: true, unique: true },
  experience: { type: String, required: true },
  qualification: { type: String, required: true },
  hospital: { type: String, default: '' },
  consultationFee: { type: String, required: true },
  availableDays: { type: [String], default: [] },
  availableTime: { type: String, required: true },
  address: { type: String, required: true },
  bio: { type: String, default: '' },
  profileImage: { type: String, default: null },
  role: { type: String, default: 'doctor' },
  createdAt: { type: Date, default: Date.now }
});

// Encrypt password using bcrypt
DoctorSchema.pre('save', async function(next) {
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

// IMPORTANT: Add this method to compare passwords
DoctorSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('Doctor', DoctorSchema);