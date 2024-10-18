const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'ngopassword',
    database: process.env.DB_NAME || 'ngo_portal',
});

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.adminId) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin login required.' });
    }
};

// Create new admin
router.post('/create', isAdmin, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)';
        db.query(query, [username, hashedPassword], (error, results) => {
            if (error) {
                console.error('Error creating admin:', error);
                return res.status(500).json({ error: 'Error creating admin' });
            }
            res.status(201).json({ message: 'Admin created successfully' });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete admin
router.post('/delete', isAdmin, (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required.' });
    }

    const query = 'DELETE FROM admin_users WHERE username = ?';
    db.query(query, [username], (error, results) => {
        if (error) {
            console.error('Error deleting admin:', error);
            return res.status(500).json({ error: 'Error deleting admin' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.json({ message: 'Admin deleted successfully' });
    });
});

// List all admins
router.get('/list', isAdmin, (req, res) => {
    const query = 'SELECT username FROM admin_users';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching admin list:', error);
            return res.status(500).json({ error: 'Error fetching admin list' });
        }
        res.json(results);
    });
});

// List all users
router.get('/users', isAdmin, (req, res) => {
    const query = 'SELECT id, username, email, name, created_at FROM users';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching user list:', error);
            return res.status(500).json({ error: 'Error fetching user list' });
        }
        res.json(results);
    });
});

// Delete user
router.post('/deleteUser', isAdmin, (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Error deleting user' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    });
});

module.exports = router;