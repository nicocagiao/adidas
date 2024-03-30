require('dotenv').config();

const cron = require('node-cron');
const { initializeBrowser } = require('./puppeteer');
const { initializeWhatsappWeb, sendMessage, client }  = require('./whatsapp-web');
const { startFetchingData } = require('./puppeteer/actions');
const { db, getProductById } = require('./database');

(async () => {
    await initializeWhatsappWeb(); // Initialize the WhatsApp Web client

    // Wait for the client to be ready before sending a message
    client.on('ready', async () => {
        // Send a test message
        try {
            const testNumber = process.env.WHATSAPP_NUMBER; // Replace with the actual number including country code
            const testMessage = 'This is a test message from whatsapp-web.js';
            const messageSent = await sendMessage(testNumber, testMessage);
            console.log('Test message sent:', messageSent);
        } catch (error) {
            console.error('Error sending test message:', error);
        }
    });
})();


(async () => {
    const browser = await initializeBrowser();
     await startFetchingData(browser, db);

    process.on('exit', () => {
        if (browser) {
            browser.close();
            console.log('Browser closed.');
        }
    });

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
})();

require('./server');

