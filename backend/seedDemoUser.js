import 'dotenv/config';
import { connectDB } from './config/db.js';
import { Citizen } from './models/Citizen.js';

const seedDemoUser = async () => {
  try {
    await connectDB();

    const existing = await Citizen.findOne({ email: 'demo@welfareai.in' }).select('+password');
    if (existing) {
      if (!(await existing.comparePassword('Demo@1234'))) {
        existing.password = 'Demo@1234';
        await existing.save();
        console.log('✅ Demo account password restored.');
      }
      console.log('✅ Demo user already exists — email: demo@welfareai.in | password: Demo@1234');
      process.exit(0);
    }

    const demo = await Citizen.create({
      fullName:       'Demo User',
      email:          'demo@welfareai.in',
      mobile:         '9876543210',
      password:       'Demo@1234',
      state:          'Tamil Nadu',
      age:            30,
      occupation:     'Salaried Employee',
      income:         '₹2.5-5 lakh',
      annualIncomeINR: 350000,
      socialCategory: 'General',
      language:       'English',
      aadharNumber:   '123456789012',
      rationCard:     'TN-DEMO-001',
    });

    console.log('✅ Demo user created!');
    console.log('   Email:    demo@welfareai.in');
    console.log('   Password: Demo@1234');
    console.log('   ID:', demo._id);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding demo user:', err.message);
    process.exit(1);
  }
};

seedDemoUser();
