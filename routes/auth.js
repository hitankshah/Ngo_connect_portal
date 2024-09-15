const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// In-memory store for OTPs
const otpStore = {}; // Use a database or a caching system in production

// Function to generate OTP
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

// Route to send OTP
router.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
        return res.status(400).send('Phone number is required');
    }

    const otp = generateOTP();
    
    // Save OTP to in-memory store
    otpStore[phoneNumber] = otp;

    // Send OTP via SMS or email (example commented out)
    // await sendOtpToPhone(phoneNumber, otp);

    res.send('OTP sent');
});

// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).send('Phone number and OTP are required');
    }

    // Retrieve OTP from in-memory store
    const storedOtp = otpStore[phoneNumber];

    if (otp === storedOtp) {
        // OTP is valid
        delete otpStore[phoneNumber]; // Clean up OTP after successful verification
        res.send('OTP verified successfully');
    } else {
        // OTP is invalid
        res.status(400).send('Invalid OTP');
    }
});

module.exports = router;
