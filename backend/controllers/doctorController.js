const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register doctor
// @route   POST /api/doctors/register
exports.registerDoctor = async (req, res) => {
  try {
    console.log('Received doctor data:', req.body);

    const { email, license } = req.body;

    // Check if doctor exists
    const existingDoctor = await Doctor.findOne({ 
      $or: [{ email }, { license }] 
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor already exists with this email or license'
      });
    }

    // Create doctor
    const doctor = await Doctor.create(req.body);
    console.log('Doctor created:', doctor._id);

    // Generate token
    const token = generateToken(doctor._id, 'doctor');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        dateOfBirth: doctor.dateOfBirth,
        gender: doctor.gender,
        specialization: doctor.specialization,
        license: doctor.license,
        experience: doctor.experience,
        qualification: doctor.qualification,
        hospital: doctor.hospital,
        consultationFee: doctor.consultationFee,
        availableDays: doctor.availableDays,
        availableTime: doctor.availableTime,
        address: doctor.address,
        bio: doctor.bio,
        profileImage: doctor.profileImage,
        role: 'doctor'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login doctor
// @route   POST /api/doctors/login
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for doctor
    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor) {
      console.log('Doctor not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password using matchPassword method
    const isMatch = await doctor.matchPassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(doctor._id, 'doctor');

    // Remove password from output
    const doctorOutput = {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      dateOfBirth: doctor.dateOfBirth,
      gender: doctor.gender,
      specialization: doctor.specialization,
      license: doctor.license,
      experience: doctor.experience,
      qualification: doctor.qualification,
      hospital: doctor.hospital,
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays,
      availableTime: doctor.availableTime,
      address: doctor.address,
      bio: doctor.bio,
      profileImage: doctor.profileImage,
      role: 'doctor'
    };

    res.status(200).json({
      success: true,
      token,
      user: doctorOutput
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in doctor
// @route   GET /api/doctors/me
exports.getMe = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all patients assigned to doctor
// @route   GET /api/doctors/my-patients
exports.getMyPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ doctorId: req.user.id })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Get my patients error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Search patients for doctor
// @route   GET /api/doctors/search-patients
exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    
    const patients = await Patient.find({
      doctorId: req.user.id,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add note for patient
// @route   POST /api/doctors/patient-notes/:patientId
exports.addPatientNote = async (req, res) => {
  try {
    const { note } = req.body;
    const patientId = req.params.patientId;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Verify patient belongs to this doctor
    if (patient.doctorId && patient.doctorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add notes for this patient'
      });
    }
    
    // Add to patient's medical history or notes (simplified)
    if (!patient.medicalHistory) {
      patient.medicalHistory = [];
    }
    
    patient.medicalHistory.push({
      condition: 'Doctor Note',
      diagnosedDate: new Date().toISOString().split('T')[0],
      notes: note,
      recordedAt: new Date()
    });
    
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: patient.medicalHistory[patient.medicalHistory.length - 1]
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};