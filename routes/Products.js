const ProductController = require('../controller/ProductController');

module.exports = module.exports = {
    '/landing': {
        GET: ProductController.getAllProductsForLanding
    },
};
