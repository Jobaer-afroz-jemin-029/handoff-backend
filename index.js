const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios'); // Added for HTTP requests to Vercel
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGO_URI ||
      'mongodb+srv://jobaerafroz4:qwerty123456@cluster0.vp15qty.mongodb.net/'
  )
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ Error connecting to MongoDB:', err));

// User Model
const User = require('./models/user');

// Import product routes
const productRoutes = require('./routes/product');

// Send Verification Email Function (calls Vercel endpoint)
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const vercelEndpoint = 'https://send-mail-swart.vercel.app/api/sendemail'; // Replace with your Vercel endpoint
    const response = await axios.post(
      vercelEndpoint,
      {
        email,
        verificationToken,
      },
      {
        headers: {
          'x-api-key': process.env.API_KEY, // Secure API key
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      console.log('✅ Verification email sent to', email);
      return true;
    } else {
      console.error('❌ Failed to send verification email:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending email via Vercel:', error.message);
    return false;
  }
};

// Send Reset Password Email via Vercel
const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const vercelEndpoint = 'https://send-mail-swart.vercel.app/api/sendreset';
    const response = await axios.post(
      vercelEndpoint,
      {
        email,
        resetToken,
      },
      {
        headers: {
          'x-api-key': process.env.API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    if (response.status === 200) {
      console.log('✅ Reset email sent to', email);
      return true;
    } else {
      console.error('❌ Failed to send reset email:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending reset email via Vercel:', error.message);
    return false;
  }
};

// =================== Registration Route ===================
app.post('/register', async (req, res) => {
  try {
    const { varsityId, fullName, email, password } = req.body;

    // Validate required fields
    if (!varsityId || !fullName || !email || !password) {
      return res.status(400).json({
        message:
          'All fields (varsityId, fullName, email, password) are required',
      });
    }

    // Validate BUBT email
    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+\.bubt\.edu\.bd$/)) {
      return res
        .status(400)
        .json({ message: 'Please use a valid BUBT email address' });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      varsityId,
      name: fullName,
      email,
      password: hashedPassword,
      verificationToken: crypto.randomBytes(20).toString('hex'),
      verified: false,
    });

    // Save user to MongoDB
    await newUser.save();

    // Send verification email via Vercel
    const emailSent = await sendVerificationEmail(
      newUser.email,
      newUser.verificationToken
    );
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: 'Failed to send verification email' });
    }

    res.status(201).json({
      message:
        'Registration successful! Please check your email for verification',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res
      .status(500)
      .json({ message: 'Registration failed', error: error.message });
  }
});

// Email Verification Route
app.get('/verify/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).json({ message: 'Invalid verification token' });
    }

    // Update user verification status
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification failed:', error);
    res
      .status(500)
      .json({ message: 'Email verification failed', error: error.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+\.bubt\.edu\.bd$/)) {
      console.log('Invalid BUBT email:', email);
      return res
        .status(400)
        .json({ message: 'Please use a valid BUBT email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found, verified:', user.verified);
    if (!user.verified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        isVerified: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    res.json({
      token,
      isVerified: true,
      user: { 
        varsityId: user.varsityId, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        facebookId: user.facebookId 
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// =================== User Profile Routes ===================

// Update user profile (including Facebook ID)
app.patch('/api/user/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update Facebook ID if provided
    if (req.body.facebookId !== undefined) {
      user.facebookId = req.body.facebookId;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        varsityId: user.varsityId,
        name: user.name,
        email: user.email,
        role: user.role,
        facebookId: user.facebookId,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// Get user by varsityId (to fetch seller's Facebook ID)
app.get('/api/user/varsity/:varsityId', async (req, res) => {
  try {
    console.log('Fetching user by varsityId:', req.params.varsityId);
    const user = await User.findOne({ varsityId: req.params.varsityId });
    
    if (!user) {
      console.log('User not found for varsityId:', req.params.varsityId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', { varsityId: user.varsityId, name: user.name, hasFacebookId: !!user.facebookId });
    res.json({
      varsityId: user.varsityId,
      name: user.name,
      facebookId: user.facebookId,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// =================== Password Reset Routes ===================

// Request password reset
app.post('/api/password/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether the email exists
      return res.status(200).json({ message: 'If an account exists, a reset email has been sent' });
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const emailSent = await sendResetPasswordEmail(user.email, resetToken);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    res.json({ message: 'If an account exists, a reset email has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request', error: error.message });
  }
});

// Reset password
app.post('/api/password/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// =================== Product Routes ===================
app.use('/api/products', productRoutes);

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
