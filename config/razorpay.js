
const Razorpay = require('razorpay');
require('dotenv').config();

// Create Razorpay instance using the credentials from your environment variables
const razorpayInstance = new Razorpay({
  key_id: 'rzp_test_pgVeQf1vqzbAno',
    key_secret: 'nncnytmwlDbkY4kuwLuu1jmQ'
});

// Export the instance
module.exports = razorpayInstance;
