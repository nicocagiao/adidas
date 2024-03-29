const sqlite3 = require('sqlite3').verbose();
const { databaseFile } = require('../config/index');

const db = new sqlite3.Database(databaseFile);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        link TEXT,
        display_name TEXT,
        product_id TEXT UNIQUE,
        price REAL,
        sale_price REAL,
        salePercentage REAL,
        image_url TEXT
    )`);
});

function getProductById(productId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM products WHERE product_id = ?`, [productId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

module.exports = {
    db,
    getProductById
};
