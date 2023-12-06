const Product = require("../models/Product");

class SearchRepository {
    async searchByNameOrProduct(searchText, page, pageSize) {
        const skipCount = (page - 1) * pageSize;

        // Convert pageSize to a numeric value
        const numericPageSize = parseInt(pageSize, 10);

        // Use the $search stage for text search on 'name' and 'category'
        const products = await Product.aggregate([
            {
                $search: {
                    index: 'default', // Replace with your actual index name
                    text: {
                        query: searchText,
                        path: ["name", "category"],
                        fuzzy: {
                            maxEdits: 2,
                            prefixLength: 2,
                            maxExpansions: 10,
                        },
                    },
                },
            },
            { $addFields: { searchScore: { $meta: 'searchScore' } } },
            // Sort based on the newly added 'searchScore' field
            { $sort: { searchScore: 1 } },
            // Skip and limit based on pagination
            { $skip: skipCount },
            { $limit: numericPageSize }, // Ensure numeric value for $limit
        ]);

        if (!products) {
            throw new Error('No products found');
        }

        return products;
    }

    async searchAutoComplete(searchText) {
        // Use the $search stage for autocomplete
        const products = await Product.aggregate([
            {
                $search: {
                    index: 'autocomplete',
                    autocomplete: {
                        query: searchText,
                        path: "name",
                        tokenOrder: "sequential",
                    },
                },
            },
            { $limit: 5 }, // Limit the result set to the desired number of autocomplete suggestions
            {
                $project: {
                    _id: 0,
                    name: 1,
                    // Include other fields you want in the result
                },
            },
        ]);

        if (!products) {
            throw new Error('No products found');
        }

        return products;
    }

}

module.exports = new SearchRepository;
