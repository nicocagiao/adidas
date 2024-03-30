require('dotenv').config(); // This should be at the very top
const qrcode = require('qrcode-terminal');
const config = require('../config/index');
const { Client } = require('whatsapp-web.js');
const client = new Client();

async function initializeWhatsappWeb(){
    client.on('qr', (qr) => {
        qrcode.generate(qr, {small: true});
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
    });
    
    client.on('ready', () => {
        console.log('Client is ready!');
    });
    
    client.on('message', msg => {
        if (msg.body == '!ping') {
            msg.reply('pong');
        }
    });
    
    client.initialize();
}

async function sendMessage(to, message) {
    const sanitized_number = to.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
    const final_number = `${sanitized_number.substring(sanitized_number.length - 10)}`; // Add country code if needed

    const number_details = await client.getNumberId(final_number);
    
    if (number_details) {
        const sendMessageData = await client.sendMessage(number_details._serialized, message);
        return sendMessageData; // send message
    } else {
        console.log(final_number, "Mobile number is not registered");
    }
}

module.exports = {
    initializeWhatsappWeb,
    client,
    sendMessage
};