const ProductController = require('../controller/ProductController');
const ChatbotController = require('../controller/chatbotCtrl');
const ShoppingCartController = require('../controller/shoppingCartController');

module.exports = {
    'GET/': ProductController.getAllProductsForLanding,
    'POST/chatbot': async (req, res) => {
        try {
            let userInput = req.body.input;
            if (!userInput) {
                return res.status(400).json({ message: 'User input is missing.' });
            }

            // Process user input using the chatbot controller
            const response = await ChatbotController.processUserInput(userInput);

            // Send the response back to the client
            res.status(200).json({ response });
        } catch (error) {
            console.error('Route Handler Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    'GET/search': ProductController.getExactProduct,
    'GET/search/category': ProductController.getProductsByCategory,
    'GET/search/categoryLargest': ProductController.getLargestCategoryId,
};
