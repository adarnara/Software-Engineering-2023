const ProductController = require('../controller/ProductController');

module.exports = {
    '/landing': ProductController.getAllProductsForLanding,
    // Define other routes here
};
