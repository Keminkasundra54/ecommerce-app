require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    const name = process.env.ADMIN_NAME || 'Admin';
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required in .env');

    let admin = await User.findOne({ email });
    if (admin) {
      admin.name = name;
      admin.role = 'admin';
      if (password) admin.password = password; // will hash in pre-save
      await admin.save();
      console.log('✅ Admin updated:', email);
    } else {
      admin = await User.create({ name, email, password, role: 'admin' });
      console.log('✅ Admin created:', email);
    }
  } catch (err) {
    console.error('❌ Seed admin failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();