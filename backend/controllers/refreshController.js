const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const refreshTokens = async (req, res) => {
  try {
    const doctorRefreshToken = req.cookies.doctorRefreshToken;
    const patientRefreshToken = req.cookies.patientRefreshToken;

    if (!doctorRefreshToken && !patientRefreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    if (doctorRefreshToken) {
      // Refresh doctor token
      const decoded = jwt.verify(doctorRefreshToken, process.env.JWT_REFRESH_SECRET || 'superrefreshsecret');
      if (decoded.role !== 'doctor') {
        return res.status(401).json({ success: false, message: 'Invalid token role' });
      }

      const doctor = await Doctor.findById(decoded.id);
      if (!doctor) {
        return res.status(401).json({ success: false, message: 'Doctor not found' });
      }

      const newAccessToken = jwt.sign({ id: doctor._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '15m' });
      const newRefreshToken = jwt.sign({ id: doctor._id, role: 'doctor' }, process.env.JWT_REFRESH_SECRET || 'superrefreshsecret', { expiresIn: '30d' });

      res.cookie("doctorToken", newAccessToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge:   15 * 60 * 1000 // 15 mins
      });

      res.cookie("doctorRefreshToken", newRefreshToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge:   30 * 24 * 60 * 60 * 1000 // 30 days
      });

      return res.json({ success: true, role: 'doctor' });
    }

    if (patientRefreshToken) {
      // Refresh patient token
      const decoded = jwt.verify(patientRefreshToken, process.env.JWT_REFRESH_SECRET || 'superrefreshsecret');
      if (decoded.role !== 'patient') {
        return res.status(401).json({ success: false, message: 'Invalid token role' });
      }

      const patient = await Patient.findById(decoded.id);
      if (!patient) {
        return res.status(401).json({ success: false, message: 'Patient not found' });
      }

      const newAccessToken = jwt.sign({ id: patient._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '15m' });
      const newRefreshToken = jwt.sign({ id: patient._id, role: 'patient' }, process.env.JWT_REFRESH_SECRET || 'superrefreshsecret', { expiresIn: '30d' });

      res.cookie("patientToken", newAccessToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge:   15 * 60 * 1000 // 15 mins
      });

      res.cookie("patientRefreshToken", newRefreshToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge:   30 * 24 * 60 * 60 * 1000 // 30 days
      });

      return res.json({ success: true, role: 'patient' });
    }

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

module.exports = { refreshTokens };
