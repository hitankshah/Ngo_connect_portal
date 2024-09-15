const express = require('express');
const path = require('path'); // Added path module
const authRoutes = require('./routes/auth');
const ngoRoutes = require('./routes/ngo');
const donationRoutes = require('./routes/donation');
require('dotenv').config();

const app = express();

// Parse incoming request bodies in JSON format
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/ngos', ngoRoutes);
app.use('/donation', donationRoutes);

// Serve HTML files for specific routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'firebase-otp.html'));
});
  
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'otp-auth.html'));
});
  
app.get('/donation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'phone-auth.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
