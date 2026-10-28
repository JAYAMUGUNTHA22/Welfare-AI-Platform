import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { Scheme } from './models/Scheme.js';
import { seedFarmerSupportSchemes } from './services/farmerSupportSeeder.js';

try {
  await connectDB();
  const summary = await seedFarmerSupportSchemes(Scheme);
  console.log(`Farmer-support seed complete: ${summary.inserted} inserted, ${summary.enriched} existing records safely enriched, ${summary.unchanged} unchanged.`);
} catch (error) {
  console.error('Farmer-support seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
