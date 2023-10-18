const ProductController = require('../controller/ProductController');

module.exports = (app) => {
    // Get all products for the landing page
    app.get('/landing', ProductController.getAllProductsForLanding);
};