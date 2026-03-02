const express = require('express');
const { 
  createPrescription, 
  getPrescriptions, 
  getPrescription,
  getPatientPrescriptions 
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, authorize('doctor'), getPrescriptions)
  .post(protect, authorize('doctor'), createPrescription);

router.get('/patient/:patientId', protect, getPatientPrescriptions);
router.get('/:id', protect, getPrescription);

module.exports = router;