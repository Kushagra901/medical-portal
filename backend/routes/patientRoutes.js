const express = require('express');
const { 
  registerPatient, 
  loginPatient, 
  getMe,
  updatePatient 
} = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.get('/me', protect, getMe);
router.put('/:id', protect, updatePatient);

module.exports = router;