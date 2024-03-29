const puppeteer = require('puppeteer');
const { puppeteerUserAgent } = require('../config/index');

async function initializeBrowser() {
    const browser = await puppeteer.launch({ args: [`--user-agent="${puppeteerUserAgent}"`] });
    return browser;
}

module.exports = {
    initializeBrowser
};
