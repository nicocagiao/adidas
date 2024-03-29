require('dotenv').config(); // This should be at the very top

const venom = require('venom-bot');
const config = require('../config/index');


async function initializeVenom() {
    const venomClient = await venom.create(config.venomSessionName, (base64Qr, asciiQR) => {
        // Handle the QR code for authentication
        console.log(asciiQR);
    }, (statusSession) => {
        console.log('Status Session: ', statusSession);
    }, {
        // Venom options here
    });
    console.log('Venom client initialized successfully.');
    return venomClient;
}

module.exports = {
    initializeVenom
};