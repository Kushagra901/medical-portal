const express = require('express');
const { protect } = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const router = express.Router();

// @desc    Get all data (patients and doctors) for Excel export
// @route   GET /api/export/all-data
// @access  Private (accessible to logged-in doctors)
router.get('/all-data', protect, async (req, res) => {
  try {
    // You can add logic here to restrict this to only 'admin' role if you have one,
    // but the prompt implies doctors should be able to download the DB.
    
    // Fetch all doctors from MongoDB
    const doctors = await Doctor.find({}).sort('-createdAt');
    
    // Fetch all patients from MongoDB
    const patients = await Patient.find({}).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      data: {
        doctors,
        patients
      }
    });
  } catch (error) {
    console.error('Export all data error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
