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

async function makeAdmin() {
  try {
    // Replace this with your actual email address
    const adminEmail = '22235103029@cse.bubt.edu.bd'; // Your email

    console.log('Looking for user with email:', adminEmail);

    const user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.log('❌ User not found with email:', adminEmail);
      console.log('Please check your email address or register first');

      // Show all users in the database
      const allUsers = await User.find({}, 'email name role');
      console.log('\nAll users in database:');
      allUsers.forEach((u) =>
        console.log(`- ${u.email} (${u.name}) - Role: ${u.role}`)
      );
      return;
    }

    // Update user to admin
    user.role = 'admin';
    await user.save();

    console.log('✅ Successfully made admin!');
    console.log('User:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Varsity ID:', user.varsityId);
  } catch (error) {
    console.error('❌ Error making admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the function
makeAdmin().catch(console.error);
