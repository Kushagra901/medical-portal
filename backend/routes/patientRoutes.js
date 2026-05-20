const express = require('express');
const { protect } = require('../middleware/auth');
const { validate, patientRegisterRules, loginRules } = require('../middleware/validators');
const { upload } = require('../config/cloudinary');
const Patient = require('../models/Patient');
const router = express.Router();

// Import controller functions
const { 
  registerPatient, 
  loginPatient, 
  logoutPatient,
  getMe,
  updatePatient,
  getDoctorPatients,
  assignPatient,
  getMyDoctor
} = require('../controllers/patientController');

// Public routes
router.post('/register', patientRegisterRules, validate, registerPatient);
router.post('/login', loginRules, validate, loginPatient);

// Protected routes
router.post('/logout', protect, logoutPatient);
router.get('/me', protect, getMe);
router.put('/:id', protect, updatePatient);
router.get('/doctor/patients', protect, getDoctorPatients);
router.put('/:id/assign', protect, assignPatient);
router.get('/my-doctor', protect, getMyDoctor);

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

    await Patient.findByIdAndUpdate(req.params.id, { profileImage: imageUrl });
    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;