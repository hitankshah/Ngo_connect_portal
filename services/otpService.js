const crypto = require('crypto');

// Function to generate OTP
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

// Function to send OTP (implement with an SMS or email service)
async function sendOtpToPhone(phoneNumber, otp) {
    // Implement sending OTP via SMS or email
}

module.exports = { generateOTP, sendOtpToPhone };
