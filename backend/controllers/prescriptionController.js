const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const sendEmail = require('../utils/emailService');
const paginate = require('../utils/paginate');


// @desc    Create new prescription
// @route   POST /api/prescriptions
exports.createPrescription = async (req, res) => {
  try {
    // Add doctor ID to request body
    req.body.doctorId = req.user.id;
    const prescription = await Prescription.create(req.body);

    // Update patient's last visit
    await Patient.findByIdAndUpdate(req.body.patientId, {
      lastVisit: new Date()
    });

    // Email notification to patient
    const patient = await Patient.findById(req.body.patientId).select('name email');
    if (patient && patient.email) {
      await sendEmail({
        to:      patient.email,
        subject: 'New Prescription — MediCare Portal',
        html: `<h3>Prescription Created</h3>
          <p>Dear ${patient.name},</p>
          <p>Dr. ${req.user.name} has created a new prescription for you.</p>
          <p>Log in to MediCare Portal to view and download your prescription.</p>
          <p>Prescription ID: <strong>${prescription._id}</strong></p>`
      });
    }

    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all prescriptions for a doctor
// @route   GET /api/prescriptions
exports.getPrescriptions = async (req, res) => {
  try {
    const result = await paginate(
      Prescription, 
      { doctorId: req.user.id }, 
      req, 
      { path: 'patientId', select: 'name phone' }
    );
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name phone');
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get prescriptions by patient
// @route   GET /api/prescriptions/patient/:patientId
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const result = await paginate(
      Prescription,
      { patientId: req.params.patientId },
      req,
      { path: 'doctorId', select: 'name specialization' }
    );
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};