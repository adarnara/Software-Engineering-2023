const ProductRepository = require('../Repository/ProductRepo');
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' }); // replace with your Elasticsearch server URL
const natural = require('natural');
const mongoose = require('mongoose');
const Product = require('../models/Product');

class ProductController {

  async getAllProductsForLanding(req, res) {
    try {
      const products = await ProductRepository.getAll();

      // Shuffle the products using Fisher-Yates algorithm
      const shuffledProducts = shuffle(products);

      // Keep 20 randomly chosen items from the shuffled array
      const sectionSize = 7;
      const sectionOfShuffledProducts = getRandomItems(shuffledProducts, sectionSize);

      res.status(200).json(sectionOfShuffledProducts);
    } catch (error) {
      console.error('Error in getAllProductsForLanding:', error);
      res.status(500).json({ message: "Failed to fetch products for the landing page." });
    }
  }


  async getExactProduct(req,res) {
    try {
      const productId = req.query.productId;
      const product = await ProductRepository.getProductById(productId);
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch specified product.' });
    }
  }

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
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(hits));
      } else {
        // If no hits are found, send an error response
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No matching products found.' }));
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error.' }));
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const category = req.query.name;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 5;
      const products = await ProductRepository.getProductsByCategory(category, page, pageSize);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch category.' });
    }
  }

  async getLargestCategoryId(req, res) {
    try{
      const category = req.query.category;
      if (!category) {
        return res.status(400).json({ message: 'Category parameter is required.' });
      }
      ProductRepository.getLargestCategoryId(category)
      .then(largestId => res.status(200).json(largestId))
      .catch(error => {
        console.error(`Error fetching category ID: ${error.message}`);
        res.status(500).json({ message: 'Internal server error.' });
      });

      res.status(200).json(largestId);
    } catch (error) {
      console.error(`Error in getLargestCategoryId: ${error.message}`);
      console.error(error.stack);
      res.status(500).json({ message: 'Failed to fetch largest id in category.' });
    }
  }
}

module.exports = new ProductController();

// Fisher-Yates shuffle algorithm
function shuffle(arr) {
  var i = arr.length, j, temp;
  while (--i > 0) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
  return arr;
}

// Function to get 20 randomly chosen items from an array
function getRandomItems(arr, count) {
  if (arr.length <= count) {
    return arr;
  }

  const shuffled = arr.slice(); //create a copy to avoid memory errors
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
