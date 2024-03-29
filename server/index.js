const express = require('express');
const { db } = require('../database');
const app = express();
require('dotenv').config();

const port = process.env.SERVER_PORT;

app.get('/api', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ products: rows });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
