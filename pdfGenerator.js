const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Function to generate PDF receipt
function generatePDF(ngo, amount) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const receiptPath = path.join(__dirname, 'receipts', `receipt_${Date.now()}.pdf`);

        doc.pipe(fs.createWriteStream(receiptPath));

        // Add content to the PDF
        doc.fontSize(25).text(`Donation Receipt for ${ngo.ngoName}`, { align: 'center' });
        doc.text('------------------------------');
        doc.fontSize(18).text(`Thank you for donating INR ${amount}`, { align: 'left' });
        doc.text(`NGO: ${ngo.ngoName}`);
        doc.text(`Amount: INR ${amount}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text('------------------------------');
        doc.text('This receipt can be used for tax exemption purposes.');
        
        // End and save the PDF
        doc.end();

        // Wait for the file to finish writing
        doc.on('finish', () => {
            resolve(receiptPath);
        });

        doc.on('error', (error) => {
            reject(error);
        });
    });
}

module.exports = { generatePDF };
