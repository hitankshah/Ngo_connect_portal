const express = require('express');
const qrcode = require('qrcode');
const path = require('path');
const { generatePDF } = require('./pdfGenerator.js'); // Import your PDF generation logic
const router = express.Router();

// Array of NGO bank details
const ngos = [
  { id: 1, upiID: 'narayanseva@sbi', ngoName: 'Narayan Seva' },
  { id: 2, upiID: 'ngo2@hdfc', ngoName: 'NGO Two' },
  // Add more NGOs as needed
];

// Handle form submission and generate the QR code with the dynamic amount
router.post('/generate-qr/:id', async (req, res) => {
  const ngo = ngos.find(n => n.id === parseInt(req.params.id));
  if (!ngo) {
    return res.status(404).send('NGO not found');
  }

  const amount = req.body.amount;
  const qrData = `upi://pay?pa=${ngo.upiID}&pn=${ngo.ngoName}&am=${amount}&cu=INR`;

  // Generate QR code
  try {
    const qrCodeUrl = await qrcode.toDataURL(qrData);

    // Send the receipt with NGO name and amount
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QR Code for ${ngo.ngoName}</title>
        <link rel="stylesheet" href="/style2.css">
      </head>
      <body>
        <div class="receipt-container">
          <h1>Donation Receipt for ${ngo.ngoName}</h1>
          <p>Thank you for donating INR ${amount} to ${ngo.ngoName}.</p>
          <h2>Scan the QR Code to Complete the Payment</h2>
          <img src="${qrCodeUrl}" alt="QR Code">
          <p>Amount: INR ${amount}</p>
          <a href="/ngo/${ngo.id}">Go Back</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(`Error generating QR code for ${ngo.ngoName}`, error);
    res.status(500).send('Error generating QR code');
  }
});

// Serve the PDF receipts
router.get('/receipts/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'receipts', req.params.filename);
  res.sendFile(filePath);
});

// Export the router
module.exports = router;
