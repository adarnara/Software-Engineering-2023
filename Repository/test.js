const ProductRepository = require('./ProductRepo');

const testQuery = 'apple';

// Call the search function and log the results
ProductRepository.searchProductsByName(testQuery)
    .then((results) => {
        console.log('Search Results:', results);
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });