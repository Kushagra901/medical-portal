const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, select: false },
  phone: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  gender: { type: String, default: '' },
  specialization: { type: String, default: '' },
  license: { type: String, default: '' },
  experience: { type: String, default: '' },
  qualification: { type: String, default: '' },
  hospital: { type: String, default: '' },
  consultationFee: { type: String, default: '' },
  availableDays: { type: [String], default: [] },
  availableTime: { type: String, default: '' },
  address: { type: String, default: '' },
  bio: { type: String, default: '' },
  profileImage: { type: String, default: null },
  role: { type: String, default: 'doctor' },
  createdAt: { type: Date, default: Date.now }
});

// Only hash password if it exists and is modified
DoctorSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Only compare if password exists
DoctorSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Doctor', DoctorSchema);