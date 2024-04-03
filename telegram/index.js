
require('dotenv').config();
const config = require('../config/index');
const TelegramBot = require('node-telegram-bot-api');

const token = config.telegramAPI;
const bot = new TelegramBot(token, {polling: true});

async function sendTelegramMessage (number, message){
    try {
        await bot.sendMessage(number, message);
} catch (error) {
    console.log(error);
}
}

module.exports= {
    sendTelegramMessage
}
