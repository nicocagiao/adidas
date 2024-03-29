const { db } = require('.');

async function saveToDatabase(items) {
    try {
        const stmt = db.prepare(`INSERT OR IGNORE INTO products (link, display_name, product_id, price, sale_price, salePercentage, image_url)
                                VALUES (?, ?, ?, ?, ?, ?, ?)`);
        
        for (const item of items) {
            const fullLink = `https://www.adidas.com.ar/${item.link}`;
            const salePercentage = item.salePercentage ? parseFloat(item.salePercentage.replace('%', '')) : 0;
            stmt.run([fullLink, item.displayName, item.productId, item.price, item.salePrice, salePercentage, item.imageUrl]);
        }
        
        stmt.finalize();
        console.log('Items saved to the database.');

        // Check for changes in sale price
        for (const item of items) {
            const row = await getProductById(item.productId);
            if (row && row.sale_price !== item.salePrice) {
                console.log(`Sale price changed for product ID ${item.productId}. New price: ${item.salePrice}`);
                sendWhatsAppMessage(item); // Send WhatsApp message for price change
            }
        }
    } catch (error) {
        console.error('Error saving items to the database:', error);
    }
}

async function getProductById(productId) {
    // Your implementation to get a product by ID from the database
}

function sendWhatsAppMessage(item) {
    // Your implementation to send a WhatsApp message
}

module.exports = {
    saveToDatabase
};
