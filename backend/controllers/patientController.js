const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
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

    // Create patient
    const patient = await Patient.create(req.body);
    console.log('Patient created:', patient._id);

    // Generate token
    const token = generateToken(patient._id, 'patient');

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
        role: 'patient',
        medicalHistory: patient.medicalHistory
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
        role: 'patient',
        medicalHistory: patient.medicalHistory
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

// @desc    Get all patients for a doctor
// @route   GET /api/patients/doctor/patients
exports.getDoctorPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ doctorId: req.user.id })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Assign patient to doctor
// @route   PUT /api/patients/:id/assign
exports.assignPatient = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const patientId = req.params.id;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update patient
    patient.doctorId = doctorId;
    patient.assignedDoctor = doctor.name;
    await patient.save();

    // Update doctor's patient list
    if (!doctor.patients || !doctor.patients.includes(patientId)) {
      await Doctor.findByIdAndUpdate(doctorId, {
        $push: { patients: patientId },
        $inc: { patientCount: 1 }
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
      message: `Patient assigned to Dr. ${doctor.name}`
    });
  } catch (error) {
    console.error('Assign patient error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get patient's doctor
// @route   GET /api/patients/my-doctor
exports.getMyDoctor = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).populate('doctorId', 'name specialization phone email');
    
    res.status(200).json({
      success: true,
      data: patient.doctorId || null
    });
  } catch (error) {
    console.error('Get my doctor error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};