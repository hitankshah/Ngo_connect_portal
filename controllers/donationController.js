const razorpayInstance = require('../config/razorpay');
const generateReceipt = require('../utils/pdfGenerator');

const createDonationOrder = async (req, res) => {
  const { amount, ngoId, currency = 'INR' } = req.body;

  const options = {
    amount: amount * 100,
    currency,
    receipt: `receipt_order_${ngoId}`,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

const generateReceiptPDF = (req, res) => {
  const donationDetails = req.body;
  const filePath = generateReceipt(donationDetails);
  res.download(filePath);
};

module.exports = { createDonationOrder, generateReceiptPDF };
