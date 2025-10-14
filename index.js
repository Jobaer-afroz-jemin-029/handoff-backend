require('dotenv').config();
const nodemailer = require('nodemailer');

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ Error: EMAIL_USER and EMAIL_PASS must be set in .env file');
  console.error('Ensure EMAIL_USER is your Gmail address and EMAIL_PASS is your Gmail App Password');
  process.exit(1);
}

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '22235103029@cse.bubt.edu.bd'
    pass: 'ntxjimhiqnsvipkn', // Gmail App Password
  },
});

// Function to send verification email
async function sendVerificationEmail() {
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
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Check EMAIL_USER and EMAIL_PASS in .env. Ensure EMAIL_PASS is a Gmail App Password, not your regular password.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('Network error. Check your internet connection or Gmail SMTP settings.');
    }
  }
}

// Execute the function
sendVerificationEmail();
