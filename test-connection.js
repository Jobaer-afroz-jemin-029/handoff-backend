const mongoose = require('mongoose');
const cloudinary = require('./cloudinaryConfig');
require('dotenv').config();

async function testConnections() {
  console.log('Testing connections...\n');

  // Test MongoDB connection
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        'mongodb+srv://jobaerafroz4:qwerty123456@cluster0.vp15qty.mongodb.net/'
    );
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }

  // Test Cloudinary connection
  try {
    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      console.log('✅ Cloudinary connected successfully');
    } else {
      console.log('❌ Cloudinary connection failed');
    }
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
  }

  // Close MongoDB connection
  await mongoose.disconnect();
  console.log('\n✅ Test completed');
}

testConnections().catch(console.error);
