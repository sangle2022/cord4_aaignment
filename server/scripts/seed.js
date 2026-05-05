import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';

const users = [
  { email: 'ops@demo.com', password: 'ops123', role: 'OPS' },
  { email: 'finance@demo.com', password: 'fin123', role: 'FINANCE' },
];

async function seed() {
  await connectDatabase();
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.findOneAndUpdate(
      { email: u.email },
      { email: u.email, passwordHash, role: u.role },
      { upsert: true, new: true }
    );
    console.log(`Seeded user ${u.email} (${u.role})`);
  }
  await mongoose.disconnect();
  console.log('Seed completed.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
