const Razorpay    = require('razorpay');
const crypto      = require('crypto');
const Appointment = require('../models/Appointment');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError     = require('../utils/AppError');

const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID &&
                              process.env.RAZORPAY_KEY_ID !== 'rzp_test_xxxxxxxx' &&
                              process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;
if (isRazorpayConfigured) {
  razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay initialized.');
} else {
  console.warn('⚠️ Razorpay keys not configured. Payment features will be disabled.');
}

// Step 1 — create Razorpay order
const createOrder = asyncWrapper(async (req, res) => {
  if (!razorpay) throw new AppError('Payment service not configured', 503);

  const { appointmentId } = req.body;
  const appointment = await Appointment.findById(appointmentId)
    .populate('doctorId', 'consultationFee name');
  if (!appointment) throw new AppError('Appointment not found', 404);

  const fee = parseFloat(appointment.doctorId.consultationFee) || 500;
  const amount = fee * 100; // paise

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt:  `receipt_${appointmentId}`,
  });

  res.json({
    success: true, order, key: process.env.RAZORPAY_KEY_ID, amount,
    doctorName: appointment.doctorId.name
  });
});

// Step 2 — verify payment signature
const verifyPayment = asyncWrapper(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body).digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new AppError('Payment verification failed', 400);
  }

  await Appointment.findByIdAndUpdate(appointmentId, {
    paymentStatus:     'paid',
    razorpayOrderId:   razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  });

  res.json({ success: true, message: 'Payment verified' });
});

// Check if Razorpay is available
const checkPaymentStatus = (req, res) => {
  res.json({ success: true, enabled: isRazorpayConfigured });
};

module.exports = { createOrder, verifyPayment, checkPaymentStatus };
