// index.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ Error connecting to MongoDB:', err));

// User Model
const User = require('./models/user');

// Product Routes
const productRoutes = require('./routes/product');
app.use('/api/products', productRoutes);

// =================== Brevo Email Setup ===================
const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const sender = {
      email: 'jobaerafroz4@gmail.com', // Verified email
      name: 'HandOff Team',
    };

    const receivers = [{ email }];

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2e86de;">Welcome to HandOff!</h2>
        <p>Hello,</p>
        <p>Please verify your email by clicking the button below:</p>
        <a href="https://handoff-backend.onrender.com/verify/${verificationToken}" 
           style="display: inline-block; padding: 10px 20px; margin: 10px 0; 
                  background-color: #2e86de; color: #fff; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>If the button doesn’t work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">https://handoff-backend.onrender.com/verify/${verificationToken}</p>
        <p>Thank you,<br><strong>HandOff Team</strong></p>
      </div>
    `;

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: 'Verify your HandOff account',
      htmlContent,
    });

    console.log('✅ Verification email sent to', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending email with Brevo:', error.response?.body || error.message);
    return false;
  }
};

// =================== Registration Route ===================
app.post('/register', async (req, res) => {
  try {
    const { varsityId, fullName, email, password } = req.body;

    if (!varsityId || !fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+\.bubt\.edu\.bd$/)) {
      return res.status(400).json({ message: 'Please use a valid BUBT email address' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const newUser = new User({
      varsityId,
      name: fullName,
      email,
      password: hashedPassword,
      verificationToken,
      verified: false,
    });

    await newUser.save();

    const emailSent = await sendVerificationEmail(email, verificationToken);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email for verification',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// =================== Email Verification Route ===================
app.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).json({ message: 'Invalid verification token' });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Email verification failed', error: error.message });
  }
});

// =================== Login Route ===================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+\.bubt\.edu\.bd$/)) {
      return res.status(400).json({ message: 'Please use a valid BUBT email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: {
        varsityId: user.varsityId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
