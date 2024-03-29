// const { queryList } = require('./getQuery')

module.exports = {
    baseURL: 'https://www.adidas.com.ar/api/plp/content-engine',
    query: ['calzado', 'zapatillas', 'ropa', 'accesorios', 'botines', 'rompevientos', 'conjuntos', 'ojotas', 'argentina', 'river_plate','boca_juniors','futbol','running','basquet','training','novedades','black_friday','outlet','hotsale','cyber_monday','originals','ultraboost','stan_smith', 'adicolor', 'superstar', 'forum', 'black_and_white'],
    batchSize: 48,
    totalItems: 2500,
    databaseFile: 'products.db'
};
