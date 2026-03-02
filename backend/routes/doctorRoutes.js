const express = require('express');
const { 
  registerDoctor, 
  loginDoctor, 
  getMe,
  updateDoctor 
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.get('/me', protect, getMe);
router.put('/:id', protect, updateDoctor);

module.exports = router;