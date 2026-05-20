const Appointment = require('../models/Appointment');
const Doctor      = require('../models/Doctor');
const Patient     = require('../models/Patient');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError     = require('../utils/AppError');
const sendEmail    = require('../utils/emailService');
const sendNotification = require('../utils/notify');
const paginate = require('../utils/paginate');


// Patient books an appointment
const createAppointment = asyncWrapper(async (req, res) => {
  const { doctorId, date, timeSlot, reason } = req.body;

  // Check slot not already taken
  const existing = await Appointment.findOne({
    doctorId, date: new Date(date), timeSlot,
    status: { $in: ['pending', 'confirmed'] }
  });
  if (existing) throw new AppError('This slot is already booked', 400);

  const appointment = await Appointment.create({
    patientId: req.user.id,
    doctorId, date, timeSlot, reason
  });

  // Email notification to doctor
  const doctor  = await Doctor.findById(doctorId).select('name email');
  const patient = await Patient.findById(req.user.id).select('name email');

  await sendEmail({
    to:      doctor.email,
    subject: 'New Appointment Booking — MediCare',
    html: `<h3>New Appointment</h3>
      <p>Patient: <strong>${patient.name}</strong></p>
      <p>Date: <strong>${new Date(date).toDateString()}</strong> at <strong>${timeSlot}</strong></p>
      <p>Reason: ${reason || 'Not specified'}</p>
      <p>Please log in to confirm or cancel.</p>`
  });

  // In-app notification to doctor
  await sendNotification(req, {
    userId: doctorId,
    userType: 'doctor',
    message: `New appointment from ${patient.name} on ${new Date(date).toDateString()} at ${timeSlot}`,
    type: 'appointment'
  });

  res.status(201).json({ success: true, appointment });
});

// Doctor gets their appointments
const getDoctorAppointments = asyncWrapper(async (req, res) => {
  const { status, date } = req.query;
  const filter = { doctorId: req.user.id };
  if (status) filter.status = status;
  if (date)   filter.date   = new Date(date);

  const result = await paginate(
    Appointment,
    filter,
    req,
    { path: 'patientId', select: 'name phone email' }
  );
  res.json({ success: true, ...result });
});

// Patient gets their appointments
const getPatientAppointments = asyncWrapper(async (req, res) => {
  const result = await paginate(
    Appointment,
    { patientId: req.user.id },
    req,
    { path: 'doctorId', select: 'name specialization phone address consultationFee' }
  );
  res.json({ success: true, ...result });
});

// Doctor confirms appointment
const confirmAppointment = asyncWrapper(async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, doctorId: req.user.id, status: 'pending' },
    { status: 'confirmed' },
    { new: true }
  );
  if (!appointment) throw new AppError('Appointment not found', 404);

  // Email notification to patient
  const pat = await Patient.findById(appointment.patientId).select('name email');
  const doc = await Doctor.findById(appointment.doctorId).select('name address');

  await sendEmail({
    to:      pat.email,
    subject: 'Appointment Confirmed — MediCare',
    html: `<h3>Your appointment is confirmed!</h3>
      <p>Doctor: <strong>Dr. ${doc.name}</strong></p>
      <p>Date: <strong>${new Date(appointment.date).toDateString()}</strong> at <strong>${appointment.timeSlot}</strong></p>
      <p>Address: ${doc.address || 'See portal for details'}</p>`
  });

  // In-app notification to patient
  await sendNotification(req, {
    userId: appointment.patientId,
    userType: 'patient',
    message: `Your appointment with Dr. ${doc.name} on ${new Date(appointment.date).toDateString()} has been confirmed!`,
    type: 'appointment'
  });

  res.json({ success: true, appointment });
});

// Doctor or patient cancels
const cancelAppointment = asyncWrapper(async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, status: { $in: ['pending', 'confirmed'] } },
    { status: 'cancelled' },
    { new: true }
  );
  if (!appointment) throw new AppError('Appointment not found', 404);
  res.json({ success: true, appointment });
});

// Doctor marks complete
const completeAppointment = asyncWrapper(async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, doctorId: req.user.id, status: 'confirmed' },
    { status: 'completed', notes: req.body.notes || '' },
    { new: true }
  );
  if (!appointment) throw new AppError('Appointment not found', 404);
  res.json({ success: true, appointment });
});

// Get available slots for a doctor on a date
const getAvailableSlots = asyncWrapper(async (req, res) => {
  const { doctorId, date } = req.query;
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new AppError('Doctor not found', 404);

  // Generate 30-min slots from doctor's availableTime (e.g. "9:00 AM - 5:00 PM")
  const slots = [];
  if (doctor.availableTime && doctor.availableTime.includes('-')) {
    const [startStr, endStr] = doctor.availableTime.split('-').map(s => s.trim());
    try {
      let current = new Date(`1970-01-01 ${startStr}`);
      const end   = new Date(`1970-01-01 ${endStr}`);
      while (current < end) {
        slots.push(current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        current = new Date(current.getTime() + 30 * 60000);
      }
    } catch (e) {
      // If time parsing fails, return empty slots
    }
  }

  // Remove already-booked slots
  const booked = await Appointment.find({
    doctorId, date: new Date(date),
    status: { $in: ['pending', 'confirmed'] }
  }).select('timeSlot');
  const bookedSlots = booked.map(a => a.timeSlot);
  const available   = slots.filter(s => !bookedSlots.includes(s));

  res.json({ success: true, available, allSlots: slots });
});

module.exports = {
  createAppointment, getDoctorAppointments, getPatientAppointments,
  confirmAppointment, cancelAppointment, completeAppointment, getAvailableSlots
};
