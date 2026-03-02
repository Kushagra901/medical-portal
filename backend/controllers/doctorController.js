const Doctor = require('../models/Doctor');
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

    // Create doctor with ALL fields
    const doctor = await Doctor.create(req.body);
    console.log('Doctor created:', doctor);

    // Generate token
    const token = generateToken(doctor._id, 'doctor');

    // Return ALL doctor data
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

    // Check for doctor
    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await doctor.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(doctor._id, 'doctor');

    // Return ALL doctor data
    res.status(200).json({
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