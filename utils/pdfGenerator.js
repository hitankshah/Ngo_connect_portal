const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generatePDF(ngo, amount) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const pdfPath = path.join(__dirname, `receipts/${ngo.id}-receipt.pdf`);

        doc.pipe(fs.createWriteStream(pdfPath));
        
        doc.fontSize(25).text("80G Donation Receipt", { align: "center" });
        doc.moveDown();
        doc.fontSize(16).text(`NGO Name: ${ngo.name}`);
        doc.text(`Amount: ₹${amount}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text("Thank you for your generous donation!");
        
        doc.end();
        
        doc.on('finish', () => {
            resolve(pdfPath);
        });
        doc.on('error', reject);
    });
}

module.exports = { generatePDF };
