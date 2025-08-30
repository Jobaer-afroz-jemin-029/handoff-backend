require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user');

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGO_URI ||
      'mongodb+srv://jobaerafroz4:qwerty123456@cluster0.vp15qty.mongodb.net/'
  )
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

async function resetAdminPassword() {
  try {
    const adminEmail = '22235103029@cse.bubt.edu.bd';
    const newPassword = 'admin123'; // New password

    console.log('🔧 Resetting admin password...\n');

    const user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('Found admin user:', user.name);
    console.log('Current role:', user.role);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password reset successful!');
    console.log('New password:', newPassword);
    console.log('Email:', adminEmail);

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the function
resetAdminPassword().catch(console.error);
