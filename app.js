require('dotenv').config();
const cron = require('node-cron');
const { initializeBrowser } = require('./puppeteer');
const { initializeWhatsappWeb, client } = require('./whatsapp-web');
const { startFetchingData } = require('./puppeteer/actions');
const config = require('./config/index');

(async () => {
    await initializeWhatsappWeb();
    client.on('ready', async () => {
        console.log("WhatsApp client is ready");
        const browser = await initializeBrowser();
        await startFetchingData(browser)

        // cron job
        cron.schedule('0 * * * *', async () => {
            console.log('Running fetchData function every hour...');
            for (let queryIndex = 0; queryIndex < config.query.length; queryIndex++) {
                const queryItem = config.query[queryIndex];
                // console.log('Fetching data for:', queryItem);
                
                const totalItems = await startFetchingData(browser); 
            }
        });
    });

    // Handle the browser closing on process exit
    process.on('exit', () => {
        if (browser) {
            browser.close();
            console.log('Browser closed.');
        }
    });
})();

require('./server');