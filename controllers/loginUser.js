const bcrypt = require('bcrypt'); // Make sure bcrypt is installed and imported
const { query } = require('../db'); // Adjust the path to your db.js

async function loginUser(email, password) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [user] = await query(sql, [email]); 

    if (user) {
        const match = await bcrypt.compare(password, user.password); // Compare hashed password
        if (match) {
            console.log('Login successful');
            // You can create a session here
        } else {
            console.log('Invalid password');
        }
    } else {
        console.log('User not found');
    }
}

module.exports = { loginUser }; // Export the function for use in routes
