const express = require('express');
const router  = express.Router();
const { forgotPassword, resetPassword } = require('../controllers/authController');
const { refreshTokens } = require('../controllers/refreshController');

router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);
router.post('/refresh',         refreshTokens);

module.exports = router;
