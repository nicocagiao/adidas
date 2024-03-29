const puppeteer = require('puppeteer');
const cron = require('node-cron');
const venom = require('venom-bot'); // Import Venom
const config = require('./config');
const { db, getProductById } = require('./database');

// Function to send a WhatsApp message

let venomClient;
async function initializeVenom() {
    try {
        venomClient = await venom.create('sessionName', (base64Qr, asciiQR) => {
            // Handle the QR code for authentication
            console.log(asciiQR);
        }, (statusSession) => {
            console.log('Status Session: ', statusSession);
        }, {
            // Venom options here
        });
        console.log('Venom client initialized successfully.');
    } catch (error) {
        console.error('Error initializing venom-bot:', error);
    }
}

async function sendWhatsAppMessage(product) {
    try {
        const message = `Este producto tiene un nuevo precio! ${product.link}. Descuento: ${product.salePercentage}. Nuevo Precio: ${product.salePrice}`;
        await venomClient.sendText('whatsapp:+5491160170178', message); // Send message to WhatsApp number
        console.log('WhatsApp message sent successfully.');
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
    process.on('exit', () => {
        venomClient.close();
    });
}

async function saveToDatabase(items) {
    try {
        // Update the SQL statement to include the salePercentage column
        const stmt = db.prepare(`INSERT OR IGNORE INTO products (link, display_name, product_id, price, sale_price, salePercentage, image_url)
                                VALUES (?, ?, ?, ?, ?, ?, ?)`);

        items.forEach(item => {
            const fullLink = `https://www.adidas.com.ar/${item.link}`;            
            const salePercentage = item.salePercentage ? parseFloat(item.salePercentage.replace('%', '')) : 0;
        
            stmt.run([fullLink, item.displayName, item.productId, item.price, item.salePrice, salePercentage, item.imageUrl]);
        });

        stmt.finalize();
        console.log('Items saved to the database.');

        // Check for changes in sale price
        for (const item of items) {
            getProductById(item.productId).then(row => {
                if (row && row.sale_price !== item.salePrice) {
                    console.log(`Sale price changed for product ID ${item.productId}. New price: ${item.salePrice}`);
                    sendWhatsAppMessage(item); // Send WhatsApp message for price change
                }
            }).catch(err => {
                console.error('Error querying database:', err);
            });
        }
    } catch (error) {
        console.error('Error saving items to the database:', error);
    }
}

let browser;

async function initializeBrowser() {
    browser = await puppeteer.launch({ args: ['--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"'] });
};

async function fetchData(queryItem, start) {
    if (!browser) {
        console.error('Browser instance is not initialized');
        return;
    }
    const page = await browser.newPage();

    try {
        const url = `${config.baseURL}?query=${queryItem}&start=${start}`;
        await page.goto(url, { waitUntil: 'networkidle0' });

        const data = await page.evaluate(() => JSON.parse(document.body.innerText));

        const filteredItems = data.raw.itemList.items.map(item => ({
            link: item.link,
            displayName: item.displayName,
            productId: item.productId,
            price: item.price,
            salePrice: item.salePrice,
            salePercentage: item.salePercentage,
            imageUrl: item.image.src
        }));

        await saveToDatabase(filteredItems);
        // Return the total number of items and the filtered items
        return {
            totalCount: data.raw.itemList.count,
            items: filteredItems
        };
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        await page.close();
    }
    process.on('exit', () => {
        browser.close();
    });
}

// Function to fetch data for each query item
async function startFetchingData() {
    console.log('Running fetchData function immediately...');
    for (let queryIndex = 0; queryIndex < config.query.length; queryIndex++) {
        const queryItem = config.query[queryIndex];
        console.log('Fetching data for:', queryItem);
        
        // Fetch the first batch of data to get the total number of items for this query
        const firstBatchData = await fetchData(queryItem, 0);
        const totalItemsForQuery = firstBatchData.totalCount; // Assuming totalCount is the property that holds the total items
        
        console.log(`Total items for ${queryItem}: ${totalItemsForQuery}`);
        
        // Now fetch the rest of the data in batches based on the totalItemsForQuery
        for (let i = config.batchSize; i < totalItemsForQuery; i += config.batchSize) {
            await fetchData(queryItem, i);
        }
    }
}

// Initialize the browser, then fetch data
(async () => {
    await initializeBrowser();
    await startFetchingData();
    await initializeVenom();
})();

process.on('exit', () => {
    if (venomClient) {
        venomClient.close();
        console.log('Venom client closed.');
    }
});

// Properly handle process exit for Puppeteer browser
process.on('exit', () => {
    if (browser) {
        browser.close();
        console.log('Browser closed.');
    }
});

// Schedule the fetchData function to run every hour
cron.schedule('0 * * * *', async () => {
    console.log('Running fetchData function every hour...');
    for (let queryIndex = 0; queryIndex < config.query.length; queryIndex++) {
        const queryItem = config.query[queryIndex];
        console.log('Fetching data for:', queryItem);
        
        // Fetch the first batch of data to get the total number of items
        const totalItems = await fetchData(queryItem, 0);
        
        // Now fetch the rest of the data in batches
        for (let i = config.batchSize; i < totalItems; i += config.batchSize) {
            await fetchData(queryItem, i);
        }
    }
});