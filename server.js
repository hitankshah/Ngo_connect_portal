const express = require("express");
const path = require("path");
const session = require("express-session");
const mysql = require("mysql2"); 
const ngoRoutes = require("./ngoRoutes");
const profileRoutes = require("./profileRoutes");
const qrRoutes = require('./qrRoutes');

const app = express();

const db = mysql.createConnection({
    host: 'localhost', 
    user: '', 
    password: 'ngopassword',
    database: 'ngo_portal'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL...');
});

// Middleware for serving static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Session middleware
app.use(session({
    secret: 'your-secret-key', // Change to a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
    app.get('/register', (req, res) => {
      res.sendFile(path.join(__dirname, 'public','register.html'));
    });

// Serve static HTML files for login, registration, and password management
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/update-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'update-password.html'));
});

// Logout route
app.get('/logout', (req, res) => {
    const logoutUrl = `https://ngoconnect.kinde.com/v2/logout?client_id=${config.clientId}&returnTo=http://localhost:3000`;
    req.session.destroy(); // Clear session
    res.redirect(logoutUrl); // Redirect to logout URL
});

// Serve receipts page
app.get("/receipts", (req, res) => {
    res.sendFile(path.join(__dirname, 'receipts', 'receipts.html'));
});

// API to get receipt data
app.get('/api/receipt-data', (req, res) => {
    if (req.session.receiptData) {
        res.json(req.session.receiptData);
    } else {
        res.status(404).send('Receipt data not found.');
    }
});

// Use the NGO, QR, and profile routes
app.use(ngoRoutes);
app.use(qrRoutes); // Add the QR routes
app.use(profileRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
