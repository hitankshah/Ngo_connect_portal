// const express = require("express");
// const path = require("path");
// const session = require("express-session");
// const { setupKinde } = require("@kinde-oss/kinde-node-express");
// const ngoRoutes = require("./ngoRoutes");
// const profileRoutes = require("./profileRoutes");
// const app = express();

// // Kinde configuration
// const config = {
//   clientId: "33385d9de1de4943925d6f28e8989767",
//   issuerBaseUrl: "https://ngoconnect.kinde.com",
//   siteUrl: "http://localhost:3000",
//   secret: "9tsNzjqVTcUj2J11r4b8swRhxL0ziBlOjHlxLygH7JrZGCDrNi",
//   redirectUrl: "http://localhost:3000/kinde_callback",
//   postLogoutRedirectUrl: "http://localhost:3000",
//   unAuthorisedUrl: "http://localhost:3000/unauthorised",
//   grantType: "AUTHORIZATION_CODE"
// };

// setupKinde(config, app);

// // Session configuration
// app.use(session({
//   secret: 'your-session-secret',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // Set to true if using HTTPS
// }));

// app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));

// // Serve static HTML files
// app.get('/login', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public'));
// });

// app.get('/register', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public'));
// });


// // Logout route
// app.get('/logout', (req, res) => {
//   const logoutUrl = `https://ngoconnect.kinde.com/v2/logout?client_id=${config.clientId}&returnTo=http://localhost:3000`;
//   req.session.destroy(); // Clear session
//   res.redirect(logoutUrl);
// });


// app.use("/receipts", express.static(path.join(__dirname, 'receipts')));

// // Use the NGO and profile routes
// app.use(ngoRoutes);
// app.use(profileRoutes);

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

const express = require('express');
const path = require('path');
const session = require('express-session');
const { setupKinde } = require('@kinde-oss/kinde-node-express');
const ngoRoutes = require('./ngoRoutes');
const qrRoutes = require('./qrRoutes'); // Updated to include qrroutes
const profileRoutes = require('./profileRoutes');
const app = express();

// Kinde configuration
const config = {
  clientId: '33385d9de1de4943925d6f28e8989767',
  issuerBaseUrl: 'https://ngoconnect.kinde.com',
  siteUrl: 'http://localhost:3000',
  secret: '9tsNzjqVTcUj2J11r4b8swRhxL0ziBlOjHlxLygH7JrZGCDrNi',
  redirectUrl: 'http://localhost:3000/kinde_callback',
  postLogoutRedirectUrl: 'http://localhost:3000',
  unAuthorisedUrl: 'http://localhost:3000/unauthorised',
  grantType: 'AUTHORIZATION_CODE'
};

setupKinde(config, app);

// Session configuration
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Serve static HTML files
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public'));
});

// Logout route
app.get('/logout', (req, res) => {
  const logoutUrl = `https://ngoconnect.kinde.com/v2/logout?client_id=${config.clientId}&returnTo=http://localhost:3000`;
  req.session.destroy(); // Clear session
  res.redirect(logoutUrl);
});

app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// Use the NGO and profile routes
app.use(ngoRoutes);
app.use(qrRoutes);  // Add the QR routes
app.use(profileRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
