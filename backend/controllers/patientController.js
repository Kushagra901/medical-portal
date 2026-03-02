const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register patient
// @route   POST /api/patients/register
exports.registerPatient = async (req, res) => {
  try {
    console.log('Received patient data:', req.body);

    const { email } = req.body;

    // Check if patient exists
    const existingPatient = await Patient.findOne({ email });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Patient already exists with this email'
      });
    }

    // Create patient with ALL fields
    const patient = await Patient.create(req.body);
    console.log('Patient created:', patient);

    // Generate token
    const token = generateToken(patient._id, 'patient');

    // Return ALL patient data
    res.status(201).json({
      success: true,
      token,
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        height: patient.height,
        weight: patient.weight,
        allergies: patient.allergies,
        currentMedications: patient.currentMedications,
        emergencyContact: patient.emergencyContact,
        address: patient.address,
        insuranceProvider: patient.insuranceProvider,
        insuranceId: patient.insuranceId,
        profileImage: patient.profileImage,
        role: 'patient'
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

// @desc    Login patient
// @route   POST /api/patients/login
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for patient
    const patient = await Patient.findOne({ email }).select('+password');

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await patient.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(patient._id, 'patient');

    // Return ALL patient data
    res.status(200).json({
      success: true,
      token,
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        height: patient.height,
        weight: patient.weight,
        allergies: patient.allergies,
        currentMedications: patient.currentMedications,
        emergencyContact: patient.emergencyContact,
        address: patient.address,
        insuranceProvider: patient.insuranceProvider,
        insuranceId: patient.insuranceId,
        profileImage: patient.profileImage,
        role: 'patient'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in patient
// @route   GET /api/patients/me
exports.getMe = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/:id
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};