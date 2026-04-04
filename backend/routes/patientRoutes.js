const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Import controller functions
const { 
  registerPatient, 
  loginPatient, 
  getMe,
  updatePatient,
  getDoctorPatients,
  assignPatient,
  getMyDoctor
} = require('../controllers/patientController');

// Public routes
router.post('/register', registerPatient);
router.post('/login', loginPatient);

// Protected routes
router.get('/me', protect, getMe);
router.put('/:id', protect, updatePatient);
router.get('/doctor/patients', protect, getDoctorPatients);
router.put('/:id/assign', protect, assignPatient);
router.get('/my-doctor', protect, getMyDoctor);

module.exports = router;