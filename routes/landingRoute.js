const ProductController = require('../controller/ProductController');
const ChatbotController = require('../controller/chatbotCtrl');

module.exports = {
    'GET/': ProductController.getAllProductsForLanding,
    'POST/chatbot': async (req, res) => {
        try {
            let userInput = req.body.input;
            if (!userInput) {
                return res.status(400).json({ message: 'User input is missing.' });
            }

            const response = await ChatbotController.processUserInput(userInput);
            res.status(200).json({ response });
        } catch (error) {
            console.error('Route Handler Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
};
