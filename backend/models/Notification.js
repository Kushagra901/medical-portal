const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['doctor', 'patient', 'admin'] },
  message:  { type: String, required: true },
  type:     { type: String, enum: ['appointment', 'prescription', 'lab_report', 'system'] },
  isRead:   { type: Boolean, default: false },
  link:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
