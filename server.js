const express = require('express');
const app = express();
const port = 3000; // You can choose any available port

// Import the database module and other necessary modules
const { db } = require('./database');

// Set up the '/api' route to return database results as JSON
app.get('/api', (req, res) => {
  // Query the database to get all products
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      // If there's an error, send a 500 status code and the error message
      res.status(500).json({ error: err.message });
      return;
    }
    // Send the rows as JSON
    res.json({ products: rows });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
