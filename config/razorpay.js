
const Razorpay = require('razorpay');
require('dotenv').config();

// Create Razorpay instance using the credentials from your environment variables
const razorpayInstance = new Razorpay({
  key_id: '',
    key_secret: ''
});

// Export the instance
module.exports = razorpayInstance;
