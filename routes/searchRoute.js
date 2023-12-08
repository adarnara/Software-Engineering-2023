const SearchController = require('../controller/searchController');

module.exports = {
    'GET/search': async (req, res) => {
        try {
            const { searchText, page, pageSize } = req.params;

            if (!searchText) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Search text parameter is missing.' }));
                return;
            }

            // Call the searchByNameOrProduct controller function with the query input
            await SearchController.searchByNameOrProduct(req, res);

        } catch (error) {
            console.error('Route Handler Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    },
    'GET/autocomplete': async (req, res) => {
        try {
            const { searchText } = req.params;

            if (!searchText) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Search text parameter is missing.' }));
                return;
            }

            // Call the searchByNameOrProduct controller function with the query input
            await SearchController.searchAutoComplete(req, res);

        } catch (error) {
            console.error('Route Handler Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    },
    'GET/exactName': async (req, res) => {
        try {
            const { searchText } = req.params;

            if (!searchText) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Search text parameter is missing.' }));
                return;
            }

            // Call the searchByName controller function with the query input
            await SearchController.searchByExactName(req, res);

        } catch (error) {
            console.error('Route Handler Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    },
};