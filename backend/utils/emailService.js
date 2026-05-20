const nodemailer = require('nodemailer');

let transporter = null;

const isEmailConfigured = process.env.EMAIL_USER && 
                          process.env.EMAIL_USER !== 'yourgmail@gmail.com' &&
                          process.env.EMAIL_PASS;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('✅ Email service initialized.');
} else {
  console.warn('⚠️ Email credentials not configured. Email features will be disabled.');
}

const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.warn('Email not sent (not configured):', subject, '→', to);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"MediCare Portal" <${process.env.EMAIL_USER}>`,
      to, subject, html
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

module.exports = sendEmail;
