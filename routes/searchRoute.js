const ProductController = require('../controller/ProductController');
const ChatbotController = require('../controller/chatbotCtrl');
const ShoppingCartController = require('../controller/shoppingCartController');

module.exports = {
    'GET/search/:query': async (req, res) => {
        try {
            const query = req.params.query;

            if (!query) {
                return res.status(400).json({ message: 'Query parameter is missing.' });
            }

            // Call the searchProducts controller function with the query input
            await ProductController.searchProducts(query, res);

        } catch (error) {
            console.error('Route Handler Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    'GET/search/category': ProductController.getProductsByCategory,
};
