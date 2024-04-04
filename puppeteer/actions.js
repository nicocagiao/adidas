const { baseURL, query, batchSize, whatsappNumber, telegramID} = require('../config/index');
const { saveToDatabase } = require('../database/helpers');
const { db, getProductById } = require('../database');
// const { sendWhatsappMessage } = require('../whatsapp-web/index');
const { sendTelegramMessage } = require('../telegram/index');


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
        let filteredItems = {};
        if(data.raw.itemList.items){
            filteredItems = data.raw.itemList.items.map(item => ({
                link: item.link,
                displayName: item.displayName,
                productId: item.productId,
                price: item.price,
                salePrice: item.salePrice,
                salePercentage: item.salePercentage,
                imageUrl: item.image.src
            }));
        }     

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
        // console.log(`Total items for ${queryItem}: ${totalItemsForQuery}`);
        
        for (let i = batchSize; i < totalItemsForQuery; i += batchSize) {
            let filteredItems = [];
            filteredItems = await fetchData(browser, queryItem, i);

         //Ver si cambió el precio
        if(filteredItems){
            for (const item of filteredItems.items) {
                getProductById(item.productId).then(row => {
                    if (row && row.salePrice < item.salePrice) {
                        console.log(`Sale price changed for product ID ${item.productId}. New price: ${item.salePrice}`);
                        sendTelegramMessage(`${telegramID}`, `🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥\nEste producto acaba de cambiar de precio!:\n${item.displayName}\nPrecio anterior: $ ${row.salePrice}\nPrecio nuevo: $ ${item.salePrice}\n${item.salePercentage} de descuento!!!\nhttps://www.adidas.com.ar${item.link}`)
                        // sendWhatsappMessage(`${whatsappNumber}`, `Este producto acaba de cambiar de precio!:\n${item.displayName}.\nPrecio nuevo: ${item.salePrice}.\n% de descuento: ${item.salePercentage}.\n${item.link}`);
                    }
                }).catch(err => {
                    console.error('Error querying database:', err);
                });
            }
        }
       
        }
    }
}

module.exports = {
    fetchData,
    startFetchingData
};
