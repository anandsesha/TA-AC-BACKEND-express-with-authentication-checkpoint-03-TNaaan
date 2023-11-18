const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: 'anand@gmail.com',
    pass: '12qwaszx',
  },
});

// Function to send a verification email
const sendVerificationEmail = (to, verificationToken) => {
  const mailOptions = {
    from: 'anandseshadri16@gmail.com',
    to: to,
    subject: 'Expense Tracker App Account Verification',
    text: `Click the following link to verify your account: http://localhost:3000/verify/${verificationToken}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};

module.exports = {
  sendVerificationEmail,
};
