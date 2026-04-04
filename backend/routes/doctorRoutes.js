const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Import controller functions - make sure all functions exist
const { 
  registerDoctor, 
  loginDoctor, 
  getMe,
  updateDoctor,
  getMyPatients,
  searchPatients,
  addPatientNote
} = require('../controllers/doctorController');

// Public routes
router.post('/register', registerDoctor);
router.post('/login', loginDoctor);

// Protected routes
router.get('/me', protect, getMe);
router.put('/:id', protect, updateDoctor);
router.get('/my-patients', protect, getMyPatients);
router.get('/search-patients', protect, searchPatients);
router.post('/patient-notes/:patientId', protect, addPatientNote);

module.exports = router;