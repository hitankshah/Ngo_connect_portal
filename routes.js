const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../db'); 
const router = express.Router();

// Function to find a user by username or email
const findUser = async (usernameOrEmail) => {
    const sql = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const results = await query(sql, [usernameOrEmail, usernameOrEmail]);
    return results.length > 0 ? results[0] : null;
};

// Function to register a new user
async function registerUser(username, name, email, phone_number, password) {
    const hashedPassword = await bcrypt.hash(password, 10); 
    const sql = 'INSERT INTO users (username, name, email, phone_number, password) VALUES (?, ?, ?, ?, ?)';
    await query(sql, [username, name, email, phone_number, hashedPassword]);
}

// Registration route
router.post('/register', async (req, res) => {
    const { username, name, email, phone_number, password, confirmPassword } = req.body;

    // Input validation
    if (!username || !name || !email || !phone_number || !password || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }

    try {
        // Check if user already exists
        const existingUser = await findUser(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists.' });
        }

        await registerUser(username, name, email, phone_number, password);
        res.status(201).json({ message: 'Registration successful! Please log in.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'An error occurred during registration.' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: 'Username or email and password are required.' });
    }

    try {
        const user = await findUser(usernameOrEmail);

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Store user info in session
        req.session.userId = user.id;
        req.session.username = user.username;

        res.status(200).json({ message: 'Login successful.' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;