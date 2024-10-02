const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../db'); 
const router = express.Router();

async function registerUser(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10); 
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    await query(sql, [username, email, hashedPassword]); e
}

router.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match.');
    }

    try {
        await registerUser(username, email, password);
        res.redirect('/login?message=Registration successful! Please log in.'); // Redirect with success message
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during registration.');
    }
});

module.exports = router;
