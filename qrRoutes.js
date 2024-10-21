const express = require('express');
const qrcode = require('qrcode');
const path = require('path');
const { generatePDF } = require('./pdfGenerator.js'); 
const router = express.Router();

// Array of NGO bank details
const ngos = [
  { id: 1, upiID: 'narayanseva@sbi', ngoName: 'Narayan Seva' },
  { id: 2, upiID: '8383933493@okbizaxis', ngoName: 'battleforblindness' },
  { id: 3, upiID: 'mswipe.cankides@kotak', ngoName: 'cankidsindia' },
  { id: 4, upiID: 'humabpeople@icici', ngoName: 'humana-india' },
  { id: 5, upiID: '9849590233@hdfcbank', ngoName: 'Helping Hearts for the needy' },
  { id: 6, upiID: 'QR918277529316-0322@unionbankofindia', ngoName: 'indiagivesfoundation' },
  { id: 7, upiID: 'natio96119208@barodampay', ngoName: 'National Association for the Blind' },
  { id: 8, upiID: 'SEVALAYA.08@CMSIDFC', ngoName: 'sevalaya' },
  { id: 9, upiID: 'shikshafoundation@icici', ngoName: 'shikshafoundation' },
  { id: 10, upiID: 'tratrfoundation.62344909@hdfcbank', ngoName: 'tratr' },
  { id: 11, upiID: 'VATSALYA1@icici', ngoName: 'Vatsalya Societies' },
  { id: 12, upiID: 'hitankjain@oksbi', ngoName: 'hitankshah' }
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
  