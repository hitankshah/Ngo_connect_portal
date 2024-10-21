const express = require("express");
const path = require("path");
const session = require("express-session");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const ngoRoutes = require("./ngoRoutes");
const profileRoutes = require("./profileRoutes");
const qrRoutes = require('./qrRoutes');
require('dotenv').config();
const adminRoutes = require('./adminRoutes');

const app = express();

// MySQL database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'ngopassword',
    database: process.env.DB_NAME || 'ngo_portal',
});

// Function to find a user by username or email
const findUser = async (usernameOrEmail) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
        db.query(query, [usernameOrEmail, usernameOrEmail], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results[0]); // Return the first matched user
        });
    });
};

// Function to find an admin by username
const findAdmin = async (usernameOrEmail) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM admin_users WHERE username = ? OR email = ?';
        db.query(query, [usernameOrEmail, usernameOrEmail], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return reject(error);
            }
            console.log('Admin search results:', results);
            resolve(results[0]); // Return the first matched admin
        });
    });
};


// Middleware for parsing JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
    }
}));

// Retry connecting to MySQL
const connectWithRetry = () => {
    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL, retrying in 5 seconds:', err);
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log('Connected to MySQL...');
            startServer();
        }
    });
};

// Function to hash passwords
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Function to check if user exists
const userExists = async (usernameOrEmail) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
        db.query(query, [usernameOrEmail, usernameOrEmail], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.length > 0);
        });
    });
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

    app.use('/admin', adminRoutes);

    // Serve static HTML files for login, registration, and password management
    app.get('/admin', (req, res) => {
        res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
    });

    app.get('/adminlogin', (req, res) => {
        res.sendFile(path.join(__dirname, 'admin', 'adminLogin.html'));
    });

    app.get('/dashboard', (req, res) => {
        res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
    });

    app.get('/user_management', (req, res) => {
        res.sendFile(path.join(__dirname, 'admin', 'user_management.html'));
    });

    // Public routes
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

    // Update the registration route
    app.post('/register', async (req, res) => {
        const { name, username, email, phone_number, password } = req.body;

        if (!name || !username || !email || !phone_number || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        try {
            const exists = await userExists(username);
            if (exists) {
                return res.status(409).json({ error: 'User already exists with this username or email.' });
            }

            const passwordHash = await hashPassword(password);
            await insertUser(username, email, phone_number, passwordHash, name);
            res.status(201).json({ message: 'User registered successfully', redirect: '/login' });
        } catch (error) {
            console.error('Error inserting user:', error);
            res.status(500).json({ error: 'Error registering user' });
        }
    });

    // Update the login route
    app.post('/login', async (req, res) => {
        const { usernameOrEmail, password } = req.body;

        if (!usernameOrEmail || !password) {
            return res.status(400).json({ error: 'Username or email and password are required.' });
        }

        try {
            const user = await findUser(usernameOrEmail);

            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }

            // Store user info in session
            req.session.userId = user.id;
            req.session.username = user.username;

            res.status(200).json({ message: 'Login successful', redirect: '/index.html' });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    // Admin login route
    app.post('/admin/login', async (req, res) => {
        const { username, password } = req.body;
        console.log('Login attempt:', { username, password: '****' });
    
        if (!username || !password) {
            return res.status(400).json({ error: 'Username/email and password are required.' });
        }
    
        try {
            const admin = await findAdmin(username);
            console.log('Admin found:', admin ? 'Yes' : 'No');
    
            if (!admin) {
                return res.status(401).json({ error: 'Invalid username/email or password.' });
            }
    
            let isMatch;
            if (admin.password_hash.startsWith('$2b$') || admin.password_hash.startsWith('$2a$')) {
                // If the password is hashed, use bcrypt to compare
                isMatch = await bcrypt.compare(password, admin.password_hash);
            } else {
                // If the password is not hashed, compare directly
                isMatch = (password === admin.password_hash);
            }
            console.log('Password match:', isMatch);
            
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid username/email or password.' });
            }
    
            // Store admin info in session
            req.session.adminId = admin.id;
            req.session.adminUsername = admin.username;
            console.log('Admin session created:', { adminId: admin.id, adminUsername: admin.username });
    
            res.status(200).json({ message: 'Admin login successful', redirect: '/dashboard.html' });
        } catch (error) {
            console.error('Error during admin login:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    // Add a route to check if user is logged in
    app.get('/api/user', (req, res) => {
        if (req.session.userId) {
            res.json({ loggedIn: true, username: req.session.username });
        } else {
            res.json({ loggedIn: false });
        }
    });

    // Add a route to check if admin is logged in
    app.get('/api/admin', (req, res) => {
        if (req.session.adminId) {
            res.json({ loggedIn: true, username: req.session.adminUsername });
        } else {
            res.json({ loggedIn: false });
        }
    });

    // Update the logout route
    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ error: 'Error logging out' });
            }
            res.json({ message: 'Logged out successfully', redirect: '/index.html' });
        });
    });
// Add NGO route
app.post('/add-ngo', (req, res) => {
    const { name, description, work, address, charity_id, pan_number, upi_id } = req.body;

    // Validate required fields
    if (!name || !description || !work || !address || !charity_id || !pan_number || !upi_id) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = 'INSERT INTO ngos (name, description, work, address, charity_id, pan_number, upi_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [name, description, work, address, charity_id, pan_number, upi_id];

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error inserting NGO: ', error);
            return res.status(500).json({ error: 'Failed to add NGO' });
        }
        res.json({ message: 'NGO added successfully' });
    });
});

// Fetch all NGOs
app.get('/admin/ngos', (req, res) => {
    const sql = 'SELECT * FROM ngos';
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching NGOs:', error);
            return res.status(500).json({ error: 'Failed to fetch NGOs' });
        }
        res.json(results);
    });
});
// Delete an NGO
app.post('/admin/deleteNgo', (req, res) => {
    const { ngoId } = req.body;

    // Ensure ngoId is provided
    if (!ngoId) {
        return res.status(400).json({ error: 'NGO ID is required' });
    }

    const sql = 'DELETE FROM ngos WHERE id = ?';
    db.query(sql, [ngoId], (error, results) => {
        if (error) {
            console.error('Error deleting NGO:', error);
            return res.status(500).json({ error: 'Failed to delete NGO' });
        }
        // Check if any row was affected
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'NGO not found' });
        }
        res.json({ success: true });
    });
});

// Fetch a single NGO by ID
app.get('/admin/ngos/:id', (req, res) => {
    const ngoId = req.params.id;
    
    if (!ngoId) {
        return res.status(400).json({ error: 'NGO ID is required' });
    }

    const sql = 'SELECT * FROM ngos WHERE id = ?';
    db.query(sql, [ngoId], (error, results) => {
        if (error) {
            console.error('Error fetching NGO:', error);
            return res.status(500).json({ error: 'Failed to fetch NGO details' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'NGO not found' });
        }
        
        res.json(results[0]);
    });
});

// Update NGO details
app.post('/admin/updateNgo', (req, res) => {
    const { 
        id, 
        name, 
        description, 
        work, 
        address, 
        charity_id, 
        pan_number, 
        upi_id 
    } = req.body;

    // Validate required fields
    if (!id || !name || !description || !work || !address || !charity_id || !pan_number || !upi_id) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `
        UPDATE ngos 
        SET name = ?, 
            description = ?, 
            work = ?, 
            address = ?, 
            charity_id = ?, 
            pan_number = ?, 
            upi_id = ? 
        WHERE id = ?
    `;

    const values = [
        name,
        description,
        work,
        address,
        charity_id,
        pan_number,
        upi_id,
        id
    ];

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error updating NGO:', error);
            return res.status(500).json({ error: 'Failed to update NGO' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'NGO not found' });
        }

        res.json({ 
            message: 'NGO updated successfully',
            ngoId: id
        });
    });
});
//hit and trail
app.post('/api/admin/addNgo', (req, res) => {
    const { name, description, work, address, charity_id, pan_number, upi_id } = req.body;

    if (!name || !description || !work || !address || !charity_id || !pan_number || !upi_id) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // SQL query to insert the new NGO into the database
    const query = `
        INSERT INTO ngos (name, description, work, address, charity_id, pan_number, upi_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [name, description, work, address, charity_id, pan_number, upi_id], (error, results) => {
        if (error) {
            console.error('Error inserting NGO:', error);
            return res.status(500).json({ error: 'Failed to add NGO' });
        }
        res.status(201).json({ message: 'NGO added successfully' });
    });
});


// Add middleware to check admin authentication
const checkAdminAuth = (req, res, next) => {
    if (!req.session.adminId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

    // Use the NGO, QR, and profile routes
    app.use(ngoRoutes);
    app.use(qrRoutes);
    app.use(profileRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });let ngos = [];

};

// Start connection retry
connectWithRetry();