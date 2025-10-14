require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 8000;

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ Error: EMAIL_USER and EMAIL_PASS must be set in environment variables');
  console.error('Ensure EMAIL_USER is your Gmail address and EMAIL_PASS is your Gmail App Password');
  process.exit(1);
}

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 60000,
  socketTimeout: 60000,
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Gmail transporter verification failed:', error.message);
    return;
  }
  console.log('✅ Gmail transporter is ready');
});

// Endpoint to trigger email
app.get('/send-email', async (req, res) => {
  const toEmail = '22235103029@cse.bubt.edu.bd';
  const verificationToken = 'test-token-123';
  const verificationUrl = `https://handoff-backend.onrender.com/verify/${verificationToken}`;

  const mailOptions = {
    from: `"HandOff Team" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your HandOff account',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="color: #333;">Welcome to HandOff!</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${verificationUrl}" 
           style="display:inline-block; padding: 10px 20px; color:white; background-color:#1a73e8; text-decoration:none; border-radius:5px;">
           Verify Email
        </a>
        <p style="margin-top: 20px;">If you did not create an account, ignore this email.</p>
        <p>Thanks,<br>HandOff Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to', toEmail, 'Message ID:', info.messageId);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Check EMAIL_USER and EMAIL_PASS.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timeout. Check network or consider using OAuth2 or another email service.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('DNS error. Check internet connection or DNS settings.');
    }
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
