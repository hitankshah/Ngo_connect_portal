const express = require('express');
const qrcode = require('qrcode');
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
  { id: 11, upiID: 'VATSALYA1@icici', ngoName: 'Vatsalya Societies' }
];

// Home route to list all NGOs with links to their donation pages
router.get('/ngodetails', (req, res) => {
  const ngoLinks = ngos.map(ngo => `<li><a href="/ngo/${ngo.id}">${ngo.ngoName}</a></li>`).join('');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NGO QR Code Payment</title>
    </head>
    <body>
      <h1>Select an NGO to Donate</h1>
      <ul>${ngoLinks}</ul>
    </body>
    </html>
  `);
});

// Serve a form to input the amount and generate the QR code for the selected NGO
router.get('/ngo/:id', (req, res) => {
  const ngo = ngos.find(n => n.id === parseInt(req.params.id));
  if (!ngo) {
    return res.status(404).send('NGO not found');
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Donate to ${ngo.ngoName}</title>
    </head>
    <body>
      <h1>Donate to ${ngo.ngoName}</h1>
      <form action="/generate-qr/${ngo.id}" method="POST">
        <label for="amount">Enter Amount (INR): </label>
        <input type="number" id="amount" name="amount" min="1" required>
        <button type="submit">Generate QR Code</button>
      </form>
    </body>
    </html>
  `);
});

// Handle form submission and generate the QR code with the dynamic amount
router.post('/generate-qr/:id', (req, res) => {
  const ngo = ngos.find(n => n.id === parseInt(req.params.id));
  if (!ngo) {
    return res.status(404).send('NGO not found');
  }

  const amount = req.body.amount;
  const qrData = `upi://pay?pa=${ngo.upiID}&pn=${ngo.ngoName}&am=${amount}&cu=INR`;

  // Generate QR code
  qrcode.toDataURL(qrData, function (err, url) {
    if (err) {
      console.error(`Error generating QR code for ${ngo.ngoName}`, err);
      return res.status(500).send('Error generating QR code');
    }

    // Send the receipt with NGO name and amount
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QR Code for ${ngo.ngoName}</title>
      </head>
      <body>
        <h1>Donation Receipt for ${ngo.ngoName}</h1>
        <p>Thank you for donating INR ${amount} to ${ngo.ngoName}.</p>
        <h2>Scan the QR Code to Complete the Payment</h2>
        <img src="${url}" alt="QR Code">
        <p>Amount: INR ${amount}</p>
        <a href="/ngo/${ngo.id}">Go Back</a>
      </body>
      </html>
    `);
  });
});

module.exports = router;
