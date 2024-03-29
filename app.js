require('dotenv').config();

const cron = require('node-cron');
const { initializeBrowser } = require('./puppeteer');
const { initializeVenom } = require('./venom');
const { startFetchingData } = require('./puppeteer/actions');
const { db } = require('./database');

async function sendWhatsAppMessage(product) {
    try {
        const message = `Este producto tiene un nuevo precio! ${product.link}. Descuento: ${product.salePercentage}. Nuevo Precio: ${product.salePrice}`;
        await venomClient.sendText(process.env.WHATSAPP_NUMBER, message); // Send message to WhatsApp number
        console.log('WhatsApp message sent successfully.');
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
    process.on('exit', () => {
        venomClient.close();
    });
}


(async () => {
    const browser = await initializeBrowser();
    // const venomClient = await initializeVenom();
    // await startFetchingData(browser, venomClient, db);
    await startFetchingData(browser, db); //without venom client to test. La línea de arriba es la que va cuando todo funciona bien.

    process.on('exit', () => {
        if (venomClient) {
            venomClient.close();
            console.log('Venom client closed.');
        }
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

