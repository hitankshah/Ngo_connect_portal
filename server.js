   const express = require("express");
    const path = require("path");
    const session = require("express-session");
    const ngoRoutes = require("./ngoRoutes");
    const profileRoutes = require("./profileRoutes");
    const qrRoutes = require('./qrRoutes'); // Updated to include qrroutes

    const app = express();


    app.use(express.static('public'));
    app.use(express.urlencoded({ extended: true }));

    // Serve static HTML files
    app.get('/login', (req, res) => {
      res.sendFile(path.join(__dirname, 'public','login.html'));
    });

    app.get('/register', (req, res) => {
      res.sendFile(path.join(__dirname, 'public','register.html'));
    });


    // Logout route
    app.get('/logout', (req, res) => {
      const logoutUrl = `https://ngoconnect.kinde.com/v2/logout?client_id=${config.clientId}&returnTo=http://localhost:3000`;
      req.session.destroy(); // Clear session
      res.redirect(logoutUrl);
    });


    app.get("/receipts", (req, res) => {
      res.sendFile(path.join(__dirname, 'receipts', 'receipts.html'));
    });


    app.get('/api/receipt-data', (req, res) => {
      if (req.session.receiptData) {
          res.json(req.session.receiptData);
      } else {
          res.status(404).send('Receipt data not found.');
      }
  });
  
    
    // Use the NGO and profile routes
    app.use(ngoRoutes);
    app.use(qrRoutes);  // Add the QR routes


    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
