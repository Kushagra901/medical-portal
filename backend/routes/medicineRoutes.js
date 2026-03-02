const express = require('express');
const { 
  getMedicines, 
  getMedicine, 
  createMedicine, 
  updateMedicine, 
  deleteMedicine,
  suggestMedicines 
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getMedicines)
  .post(protect, authorize('doctor'), createMedicine);

router.route('/:id')
  .get(protect, getMedicine)
  .put(protect, authorize('doctor'), updateMedicine)
  .delete(protect, authorize('doctor'), deleteMedicine);

router.get('/suggest/:keyword', protect, suggestMedicines);

module.exports = router;