const searchRepository = require('../Repository/searchRepo');
const mongoose = require('mongoose');
const Product = require('../models/Product');
class SearchController {

    // originally for elastic search but switched over to MongoDB Atlas Search
    /*
    async searchProducts(query, res) {
        try {
            // Define the match search query with fuzziness
            const response = await client.search({
                index: 'products_index',
                body: {
                    query: {
                        match: {
                            // Use the match query with fuzziness to search for similar terms in the "name" field
                            "name": {
                                query: query,
                                fuzziness: 'AUTO', // You can adjust the fuzziness level, e.g., '1', '2', etc.
                            },
                        },
                    },
                },
            });

            // Log the complete Elasticsearch response
            console.log('Elasticsearch Response:', response);

            // Extract and return the hits (matching documents)
            const hits = response.hits.hits || [];

            if (hits.length > 0) {
                // If hits are found, send a 200 response
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(hits));
            } else {
                // If no hits are found, send an error response
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'No matching products found.'}));
            }
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Internal server error.'}));
        }
    }
     */

    async searchByNameOrProduct(req, res) {
        try {
            const { searchText, field, page, pageSize } = req.params;
            //console.log(searchText);

            const results = await searchRepository.searchByNameOrProduct(searchText, field, page, pageSize);

            // Send JSON response
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        } catch (error) {
            console.error('Error searching by name or product:', error);

            // Send error response
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }

    async searchAutoComplete(req, res) {
        try {
            const { searchText } = req.params;
            const results = await searchRepository.searchAutoComplete(searchText);

            // Send JSON response
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        } catch (error) {
            console.error('Error searching autocomplete:', error);

            // Send error response
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }
}


module.exports = new SearchController();
