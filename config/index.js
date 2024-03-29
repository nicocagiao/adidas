require('dotenv').config();

module.exports = {
    baseURL: process.env.BASE_URL,
    query: process.env.QUERY.split(','),
    batchSize: parseInt(process.env.BATCH_SIZE, 10),
    totalItems: parseInt(process.env.TOTAL_ITEMS, 10),
    databaseFile: process.env.DATABASE_FILE,
    venomSessionName: process.env.VENOM_SESSION_NAME,
    whatsappNumber: process.env.WHATSAPP_NUMBER,
    puppeteerUserAgent: process.env.PUPPETEER_USER_AGENT,
    serverPort: parseInt(process.env.SERVER_PORT, 10),
    // ... other configurations
};