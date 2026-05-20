const express = require('express');
const { protect } = require('../middleware/auth');
const { validate, doctorRegisterRules, loginRules } = require('../middleware/validators');
const { upload } = require('../config/cloudinary');
const Doctor = require('../models/Doctor');
const router = express.Router();

// Import controller functions
const { 
  registerDoctor, 
  loginDoctor, 
  logoutDoctor,
  getMe,
  updateDoctor,
  getMyPatients,
  searchPatients,
  addPatientNote
} = require('../controllers/doctorController');

// Public routes
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: true }).select('-password -resetOtp -resetOtpExpiry');
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/register', doctorRegisterRules, validate, registerDoctor);
router.post('/login', loginRules, validate, loginDoctor);

// Protected routes
router.post('/logout', protect, logoutDoctor);
router.get('/me', protect, getMe);
router.put('/:id', protect, updateDoctor);
router.get('/my-patients', protect, getMyPatients);
router.get('/search-patients', protect, searchPatients);
router.post('/patient-notes/:patientId', protect, addPatientNote);

router.put('/profile-image/:id', protect, upload.single('profileImage'), async (req, res) => {
  try {
    let imageUrl;
    if (req.file) {
      if (req.file.path) {
        imageUrl = req.file.path; // Cloudinary URL
      } else if (req.file.buffer) {
        imageUrl = `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`;
      }
    }
    
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    await Doctor.findByIdAndUpdate(req.params.id, { profileImage: imageUrl });
    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;