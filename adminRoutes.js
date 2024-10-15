const express = require("express");
const router = express.Router();
const db = require("./db"); // Import your database connection

// Route to get all NGOs
router.get('/ngos', async (req, res) => {
    try {
        const [ngos] = await db.query('SELECT * FROM ngos');
        res.json(ngos);
    } catch (error) {
        console.error('Error fetching NGOs:', error);
        res.status(500).send('Internal server error');
    }
});

// Route to add a new NGO
router.post('/ngos', async (req, res) => {
    const { name, description, address, contact } = req.body;

    if (!name || !description || !address || !contact) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const query = 'INSERT INTO ngos (name, description, address, contact) VALUES (?, ?, ?, ?)';
        await db.query(query, [name, description, address, contact]);
        res.status(201).send('NGO added successfully');
    } catch (error) {
        console.error('Error adding NGO:', error);
        res.status(500).send('Error adding NGO');
    }
});

module.exports = router;
