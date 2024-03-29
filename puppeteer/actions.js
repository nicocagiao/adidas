const { baseURL, query, batchSize } = require('../config/index');
const { saveToDatabase } = require('../database/helpers'); // Assuming you have a helper file for database operations

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
