const fs = require('fs');
const path = require('path');

// Controller to list NGOs from the JSON file
const listNGOs = (req, res) => {
  const ngosFilePath = path.join(__dirname, '../data/ngos.json'); // Path to the JSON file
  
  fs.readFile(ngosFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to read NGO data', error: err });
    }
    
    try {
      const ngos = JSON.parse(data); // Parse the JSON file
      res.status(200).json(ngos);    // Send the NGO data in the response
    } catch (parseError) {
      res.status(500).json({ message: 'Error parsing NGO data', error: parseError });
    }
  });
};

module.exports = { listNGOs };
