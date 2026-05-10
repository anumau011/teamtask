require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDatabase = require('../config/database');
const { User } = require('../models');

async function seedAdmin() {
  try {
    await connectDatabase();

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const name = process.env.SEED_ADMIN_NAME || 'Admin User';
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@taskteam.local';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin'
    });

    console.log(`Seeded admin user: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
