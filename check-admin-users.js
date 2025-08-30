require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGO_URI ||
      'mongodb+srv://jobaerafroz4:qwerty123456@cluster0.vp15qty.mongodb.net/'
  )
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking all users and their roles...\n');

    const allUsers = await User.find({}, 'email name role varsityId verified');
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in the database');
      return;
    }

    console.log(`📊 Total users: ${allUsers.length}\n`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Varsity ID: ${user.varsityId}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Verified: ${user.verified ? '✅ Yes' : '❌ No'}`);
      console.log('');
    });

    const adminUsers = allUsers.filter(user => user.role === 'admin');
    console.log(`👑 Admin users: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      });
    } else {
      console.log('   No admin users found');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the function
checkAdminUsers().catch(console.error);
