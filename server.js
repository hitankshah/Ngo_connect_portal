const express = require("express");
const path = require("path");
const session = require("express-session");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const ngoRoutes = require("./ngoRoutes");
const profileRoutes = require("./profileRoutes");
const qrRoutes = require('./qrRoutes');
require('dotenv').config(); 

const app = express();

// MySQL database connection
const db = mysql.createConnection({
    host: 'db',
    user: 'root',
    password: process.env.DB_PASSWORD || 'ngopassword', // Use environment variable
    database: 'ngo_portal',
});

// Middleware for session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Use environment variable
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Retry connecting to MySQL
const connectWithRetry = () => {
    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL, retrying in 5 seconds:', err);
            setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
        } else {
            console.log('Connected to MySQL...');
            startServer(); // Start the server after successful connection
        }
    });
};

// Function to hash passwords
const hashPassword = async (password) => {
    const saltRounds = 10; 
    return await bcrypt.hash(password, saltRounds);
};

// Function to insert a new user into the database
const insertUser = async (username, email, phone_number, passwordHash, name) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO users (username, email, phone_number, password_hash, name) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [username, email, phone_number, passwordHash, name], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

// Function to start the server
const startServer = () => {
    // Middleware for serving static files
    app.use(express.static('public'));
    app.use(express.static('admin'));

    // Middleware for parsing URL-encoded data
    app.use(express.urlencoded({ extended: true }));

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
        const logoutUrl = `https://ngoconnect.kinde.com/v2/logout?client_id=${process.env.CLIENT_ID}&returnTo=http://localhost:3000`; // Use environment variable
        req.session.destroy();
        res.redirect(logoutUrl);
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


    app.post('/register', async (req, res) => {
        const { name, username, email, phone_number, password } = req.body;

        if (!name || !username || !email || !phone_number || !password) {
            return res.status(400).send('All fields are required.');
        }

        try {
            const passwordHash = await hashPassword(password); 
            await insertUser(username, email, phone_number, passwordHash, name); 
            res.status(201).send('User registered successfully');
        } catch (error) {
            console.error('Error inserting user:', error);
            res.status(500).send('Error registering user');
        }
    });

    // Use the NGO, QR, and profile routes
    app.use(ngoRoutes);
    app.use(qrRoutes);
    app.use(profileRoutes);

    const PORT = process.env.PORT || 3000; // Use environment variable for the port
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};


// Start connection retry
connectWithRetry();
