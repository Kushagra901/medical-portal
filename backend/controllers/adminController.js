const Doctor      = require('../models/Doctor');
const Patient     = require('../models/Patient');
const Admin       = require('../models/Admin');
const Appointment = require('../models/Appointment');
const jwt         = require('jsonwebtoken');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError     = require('../utils/AppError');

const loginAdmin = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) throw new AppError('Invalid credentials', 401);
  const isMatch = await admin.matchPassword(password);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.cookie('adminToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  });
  res.json({ success: true, admin: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' } });
});

const logoutAdmin = (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out' });
};

const getDashboardStats = asyncWrapper(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalDoctors, totalPatients, totalAppointments, pendingDoctors, todayAppointments] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),
    Appointment.countDocuments(),
    Doctor.countDocuments({ isVerified: false }),
    Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
  ]);
  res.json({ success: true, stats: { totalDoctors, totalPatients, totalAppointments, pendingDoctors, todayAppointments } });
});

const getPendingDoctors = asyncWrapper(async (req, res) => {
  const doctors = await Doctor.find({ isVerified: false }).select('-password -resetOtp');
  res.json({ success: true, doctors });
});

const verifyDoctor = asyncWrapper(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
  if (!doctor) throw new AppError('Doctor not found', 404);
  res.json({ success: true, message: `Dr. ${doctor.name} verified` });
});

const rejectDoctor = asyncWrapper(async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Doctor rejected and removed' });
});

const getAllUsers = asyncWrapper(async (req, res) => {
  const doctors  = await Doctor.find().select('-password -resetOtp');
  const patients = await Patient.find().select('-password -resetOtp');
  res.json({ success: true, doctors, patients });
});

module.exports = { loginAdmin, logoutAdmin, getDashboardStats, getPendingDoctors, verifyDoctor, rejectDoctor, getAllUsers };
