const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',  required: true },
  date:          { type: Date,   required: true },
  timeSlot:      { type: String, required: true },
  status:        { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  reason:        { type: String, default: '' },
  notes:         { type: String, default: '' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
