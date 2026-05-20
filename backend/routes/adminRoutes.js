const express    = require('express');
const router     = express.Router();
const { protect } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const {
  loginAdmin, logoutAdmin, getDashboardStats, getPendingDoctors,
  verifyDoctor, rejectDoctor, getAllUsers
} = require('../controllers/adminController');

router.post('/login',                  loginAdmin);
router.post('/logout',                 logoutAdmin);
router.get('/stats',                   protect, requireAdmin, getDashboardStats);
router.get('/doctors/pending',         protect, requireAdmin, getPendingDoctors);
router.patch('/doctors/:id/verify',    protect, requireAdmin, verifyDoctor);
router.delete('/doctors/:id/reject',   protect, requireAdmin, rejectDoctor);
router.get('/users',                   protect, requireAdmin, getAllUsers);

module.exports = router;
