const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  varsityId: {
    // rename id → varsityId
    type: String,
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verificationToken: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Add admin role
  facebookId: { type: String }, // Facebook ID for chat redirection
  resetToken: String,
  resetTokenExpires: Date,
  address: [
    {
      name: String,
      mobileNo: String,
      houseNo: String,
      city: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
