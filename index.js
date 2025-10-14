const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // Added for Gmail email sending
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

// Gmail Transporter Setup (using Nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address (e.g., jobaerafroz4@gmail.com)
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// Send Verification Email Function (switched to Gmail/Nodemailer)
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const verificationUrl = `https://handoff-backend.onrender.com/verify/${verificationToken}`;

    const mailOptions = {
      from: `"HandOff Team" <${process.env.EMAIL_USER}>`, // Uses your Gmail as sender
      to: email,
      subject: 'Verify your HandOff account',
      html: `
        <p>Hello,</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">
          Verify Email
        </a>
        <p>Thank you,<br>HandOff Team</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to', email, info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email with Gmail:', error.message);
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

    // Send verification email via Gmail
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
      user: { varsityId: user.varsityId, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Product Routes
app.use('/api/products', productRoutes);

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
