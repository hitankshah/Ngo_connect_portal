const express = require('express');

const router = express.Router();

function getUser(req) {
    // Assuming user information is stored in the session
    return req.session.user || {}; // Return empty object if user is not found
}

router.get('/profile', (req, res) => {
  const user = getUser(req); // Get the user information
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Profile</title>
        <link rel="stylesheet" href="css/style.css"> <!-- Link to your CSS -->
    </head>
    <body>
        <header>
            <nav>
                <a href="/">Home</a>
                <a href="/logout">Logout</a>
            </nav>
        </header>
        <main class="profile-container">
            <h1>User Profile</h1>
            <div class="profile-info">
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <!-- Add more user info as needed -->
            </div>
            <a href="/">Go Back</a>
        </main>
        <footer>
            <p>&copy; ${new Date().getFullYear()} Your Application Name</p>
        </footer>
    </body>
    </html>
  `);
});

module.exports = router;



