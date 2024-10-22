const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');
const mysql = require('mysql2/promise');


// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'ngopassword',
    database: process.env.DB_NAME || 'ngo_portal',
};


// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Route to handle form submission and add the NGO to the database
router.post('/add-ngo', async (req, res) => {
    const { ngoName, ngoDescription, ngoWork, ngoAddress, ngoCharityId, ngoPanNumber, ngoUPIID } = req.body;

    if (!ngoName || !ngoUPIID) {
        return res.status(400).json({ message: 'NGO name and UPI ID are required.' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO ngos (name, description, work, address, charity_id, pan_number, upi_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [ngoName, ngoDescription, ngoWork, ngoAddress, ngoCharityId, ngoPanNumber, ngoUPIID]
        );

        res.status(201).json({ 
            message: 'NGO added successfully',
            ngoId: result.insertId
        });
    } catch (error) {
        console.error('Error adding NGO:', error);
        res.status(500).json({ message: 'Error adding NGO to database' });
    }
});

// Route to display NGO details and form to enter donation amount
router.get('/ngo/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM ngos WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).send('NGO not found');
        }

        const ngo = rows[0];

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Donate to ${ngo.name}</title>
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <h1>Donate to ${ngo.name}</h1>
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">NGO Details</h5>
                            <p class="card-text"><strong>Description:</strong> ${ngo.description}</p>
                            <p class="card-text"><strong>Work:</strong> ${ngo.work}</p>
                            <p class="card-text"><strong>Address:</strong> ${ngo.address}</p>
                        </div>
                    </div>
                    <form action="/generate-qr/${ngo.id}" method="POST">
                        <div class="form-group">
                            <label for="amount">Enter Amount (INR): </label>
                            <input type="number" id="amount" name="amount" class="form-control" min="1" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Generate QR Code</button>
                    </form>
                </div>
                <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error fetching NGO details:', error);
        res.status(500).send('Error fetching NGO details');
    }
});

// Route to handle form submission and generate QR code for UPI payment
router.post('/generate-qr/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM ngos WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).send('NGO not found');
        }

        const ngo = rows[0];
        const amount = req.body.amount;
        const qrData = `upi://pay?pa=${ngo.upi_id}&pn=${ngo.name}&am=${amount}&cu=INR`;

        qrcode.toDataURL(qrData, function (err, url) {
            if (err) {
                console.error(`Error generating QR code for ${ngo.name}`, err);
                return res.status(500).send('Error generating QR code');
            }

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>QR Code for ${ngo.name}</title>
                    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    <div class="container mt-5">
                        <h1>Donation Receipt for ${ngo.name}</h1>
                        <p>Thank you for donating INR ${amount} to ${ngo.name}.</p>
                        <div class="card mb-4">
                            <div class="card-body text-center">
                                <h2>Scan the QR Code to Complete the Payment</h2>
                                <img src="${url}" alt="QR Code" class="img-fluid mb-3">
                                <p class="h4">Amount: INR ${amount}</p>
                                <h3>Or click the link below to pay:</h3>
                                <a href="${qrData}" class="btn btn-success btn-lg mb-3">Pay INR ${amount} to ${ngo.name} via UPI</a>
                                <br>
                                <a href="/ngo/${ngo.id}" class="btn btn-secondary">Go Back</a>
                            </div>
                        </div>
                    </div>
                    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
                    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
                    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                </body>
                </html>
            `);
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).send('Error generating QR code');
    }
});

// Route to display all NGOs
router.get('/ngodetails', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM ngos ORDER BY name');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>NGO Details</title>
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <h1>List of NGOs</h1>
                    <div class="row">
                        ${rows.map(ngo => `
                            <div class="col-md-6 mb-4">
                                <div class="card">
                                    <div class="card-body">
                                        <h5 class="card-title">${ngo.name}</h5>
                                        <p class="card-text">${ngo.description}</p>
                                        <p class="card-text"><small class="text-muted">UPI ID: ${ngo.upi_id}</small></p>
                                        <a href="/ngo/${ngo.id}" class="btn btn-primary">Donate</a>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error fetching NGOs:', error);
        res.status(500).send('Error fetching NGO list');
    }
});

module.exports = router;