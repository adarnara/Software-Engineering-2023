const { Client } = require('@elastic/elasticsearch');

// Create an Elasticsearch client
const client = new Client({ node: 'http://localhost:9200' }); // replace with your Elasticsearch server URL

async function searchProducts(query) {
    try {
        // Define the match search query
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

        console.log('Elasticsearch Response:', response);

        return response.hits.hits || [];
    } catch (error) {
        console.error('Error during Elasticsearch search:', error);
        throw error;
    }
}

// Example usage
const query = 'aple '; // replace with your desired query
searchProducts(query)
    .then((results) => {
        console.log('Matching Products:');
        results.forEach((hit, index) => {
            console.log(`Product ${index + 1}:`, hit._source); // Assuming "_source" contains the document data
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
