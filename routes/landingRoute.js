const ProductController = require('../controller/ProductController');
const ShoppingCartController = require('../controller/shoppingCartController');

module.exports = module.exports = {
    'GET/' : ProductController.getAllProductsForLanding,
    'GET/search': ProductController.getExactProduct,
    'GET/search/category': ProductController.getProductsByCategory
    //other routes can be added when needed. for example finding products under a seller.
};