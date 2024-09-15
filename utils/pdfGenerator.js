const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateReceipt(donationDetails) {
  const doc = new PDFDocument();
  const filePath = `./receipts/receipt_${donationDetails.donationId}.pdf`;

  doc.pipe(fs.createWriteStream(filePath));

  doc
    .fontSize(25)
    .text('Donation Receipt', 100, 80)
    .fontSize(15)
    .text(`Thank you for your donation to ${donationDetails.ngoName}`, 100, 150)
    .fontSize(12)
    .text(`Amount: ${donationDetails.amount}`, 100, 200)
    .text(`Donation ID: ${donationDetails.donationId}`, 100, 250)
    .text('This donation is eligible for tax deduction under section 80G.', 100, 300);

  doc.end();
  return filePath;
}

module.exports = generateReceipt;
