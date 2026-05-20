const express    = require('express');
const router     = express.Router();
const { protect } = require('../middleware/auth');
const { createOrder, verifyPayment, checkPaymentStatus } = require('../controllers/paymentController');

router.get('/status',        checkPaymentStatus);
router.post('/create-order', protect, createOrder);
router.post('/verify',       protect, verifyPayment);

module.exports = router;
