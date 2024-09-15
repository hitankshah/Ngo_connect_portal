const express = require('express');
const crypto = require('crypto');
const { verifyOTP } = require('../controllers/authController'); // Import the verifyOTP controller
const router = express.Router();

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
    
    // Save OTP to database or cache for verification
    // Send OTP via SMS or email
    // Example: await sendOtpToPhone(phoneNumber, otp);

    res.send('OTP sent');
});

// Route to verify OTP
router.post('/verify-otp', verifyOTP);

module.exports = router;
