const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  createAppointment, getDoctorAppointments, getPatientAppointments,
  confirmAppointment, cancelAppointment, completeAppointment, getAvailableSlots
} = require('../controllers/appointmentController');

router.get('/slots',           protect, getAvailableSlots);
router.post('/',               protect, createAppointment);
router.get('/doctor',          protect, getDoctorAppointments);
router.get('/patient',         protect, getPatientAppointments);
router.patch('/:id/confirm',   protect, confirmAppointment);
router.patch('/:id/cancel',    protect, cancelAppointment);
router.patch('/:id/complete',  protect, completeAppointment);

module.exports = router;
