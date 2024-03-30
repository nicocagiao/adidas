const { baseURL, query, batchSize, whatsappNumber} = require('../config/index');
const { saveToDatabase } = require('../database/helpers');
const { db, getProductById } = require('../database');
const { sendMessage } = require('../whatsapp-web/index')


async function fetchData(browser, queryItem, start) {
    if (!browser) {
        console.error('Browser instance is not initialized');
        return;
    }
    const page = await browser.newPage();

    try {
        const url = `${baseURL}?query=${queryItem}&start=${start}`;
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

       // Check for changes in sale price
    //    for (const item of filteredItems) {
    //     getProductById(item.productId).then(row => {
    //         if (row && row.salePrice !== item.salePrice) {
    //             console.log(`Sale price changed for product ID ${item.productId}. New price: ${item.salePrice}`);
    //             sendMessage(`${whatsappNumber}`, `Sale price changed for product ID ${item.productId}. New price: ${item.salePrice}`);
    //         }
    //     }).catch(err => {
    //         console.error('Error querying database:', err);
    //     });
    // }
        return {
            totalCount: data.raw.itemList.count,
            items: filteredItems
        };
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        await page.close();
    }
}

async function startFetchingData(browser) {
    for (let queryIndex = 0; queryIndex < query.length; queryIndex++) {
        const queryItem = query[queryIndex];
        console.log('Fetching data for:', queryItem);
        const firstBatchData = await fetchData(browser, queryItem, 0);
        if (!firstBatchData) continue;
        
        const totalItemsForQuery = firstBatchData.totalCount;
        console.log(`Total items for ${queryItem}: ${totalItemsForQuery}`);
        
        for (let i = batchSize; i < totalItemsForQuery; i += batchSize) {
            await fetchData(browser, queryItem, i);
        }
    }
}

module.exports = {
    fetchData,
    startFetchingData
};
