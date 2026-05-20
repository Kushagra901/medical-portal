require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin    = require('../models/Admin');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const existing = await Admin.findOne({ email: 'admin@medicare.com' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
  } else {
    await Admin.create({ name: 'Clinic Admin', email: 'admin@medicare.com', password: 'Admin@123' });
    console.log('✅ Admin created: admin@medicare.com / Admin@123');
  }
  process.exit();
}).catch(err => {
  console.error('DB connection error:', err);
  process.exit(1);
});
