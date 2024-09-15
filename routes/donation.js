const express = require('express');
const { createDonationOrder, generateReceiptPDF } = require('../controllers/donationController');
const router = express.Router();

router.post('/create-order', createDonationOrder);
router.post('/generate-receipt', generateReceiptPDF);

module.exports = router;
