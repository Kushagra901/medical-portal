const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  use: { type: String, required: true },
  dosage: String,
  category: String,
  manufacturer: String,
  sideEffects: String,
  contraindications: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medicine', MedicineSchema);