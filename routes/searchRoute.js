const SearchController = require('../controller/SearchController');

module.exports = {
    'GET/search': async (req, res) => {
        try {
            const { searchText, page, pageSize } = req.params;

            if (!searchText) {
                return res.status(400).json({ message: 'Search text parameter is missing.' });
            }

            // Call the searchByNameOrProduct controller function with the query input
            await SearchController.searchByNameOrProduct(req, res);

        } catch (error) {
            console.error('Route Handler Error:', error);
            // Ensure that res is a proper response object
            if (res.status && res.json) {
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                console.error('Invalid response object in search route handler');
            }
        }
    },
    'GET/autocomplete': async (req, res) => {
        try {
            const { searchText } = req.params;

            if (!searchText) {
                return res.status(400).json({ message: 'Search text parameter is missing.' });
            }


            // Call the searchByNameOrProduct controller function with the query input
            await SearchController.searchAutoComplete(req, res);

        } catch (error) {
            console.error('Route Handler Error:', error);
            // Ensure that res is a proper response object
            if (res.status && res.json) {
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                console.error('Invalid response object in search route handler');
            }
        }
    }
};
