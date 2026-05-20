const crypto    = require('crypto');
const bcrypt    = require('bcryptjs');
const Doctor    = require('../models/Doctor');
const Patient   = require('../models/Patient');
const sendEmail = require('../utils/emailService');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError     = require('../utils/AppError');

// Step 1 — user enters email
const forgotPassword = asyncWrapper(async (req, res) => {
  const { email, role } = req.body;
  const Model = role === 'doctor' ? Doctor : Patient;

  const user = await Model.findOne({ email });
  if (!user) throw new AppError('No account found with this email', 404);

  // Generate OTP
  const otp     = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiry  = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.resetOtp       = otpHash;
  user.resetOtpExpiry = expiry;
  await user.save();

  await sendEmail({
    to:      email,
    subject: 'MediCare Portal — Password Reset OTP',
    html: `
      <h2>Password Reset OTP</h2>
      <p>Your OTP is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p>
      <p>This OTP expires in 10 minutes.</p>
      <p>If you did not request this, ignore this email.</p>
    `
  });

  res.json({ success: true, message: 'OTP sent to your email' });
});

// Step 2 — user submits OTP + new password
const resetPassword = asyncWrapper(async (req, res) => {
  const { email, otp, newPassword, role } = req.body;
  const Model = role === 'doctor' ? Doctor : Patient;

  const user = await Model.findOne({ email }).select('+password');
  if (!user || !user.resetOtp) throw new AppError('Invalid request', 400);
  if (new Date() > user.resetOtpExpiry) throw new AppError('OTP has expired', 400);

  const isMatch = await bcrypt.compare(otp, user.resetOtp);
  if (!isMatch) throw new AppError('Incorrect OTP', 400);

  user.password       = newPassword; // pre-save hook will hash it
  user.resetOtp       = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successfully' });
});

module.exports = { forgotPassword, resetPassword };
