const { Client } = require('@elastic/elasticsearch');
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function copyMongoDataToElasticsearch() {
  // MongoDB Connection
  try {
    await mongoose.connect('mongodb+srv://Keny:kde32@swe2023cluster.gikvwsm.mongodb.net/Reprua?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Second connection to Mongo DB for data pipeline to Elasticsearch")
  } catch (mongoError) {
    console.error('Error connecting to MongoDB:', mongoError.message);
    return;
  }

  // Elasticsearch Connection
  const esClient = new Client({ node: 'http://localhost:9200' });

  try {
    // Check if the index already exists
    const indexExists = await esClient.indices.exists({
      index: 'products_index',
    });

    if (indexExists) {
      console.log('Index already exists. Skipping data copy.');
      return;
    }

    // Define your index mappings
    const indexMappings = {
      properties: {
        name: { type: 'text' },
        price: { type: 'text' },
        // Add other fields as needed
      },
    };

    // Create the index with mappings
    await esClient.indices.create({
      index: 'products_index',
      body: {
        mappings: indexMappings,
      },
    });

    console.log('Index created with mappings:', indexMappings);

    // Fetch data from MongoDB
    const products = await Product.find().lean();

    // Index documents into Elasticsearch
    for (const product of products) {
      // Exclude the _id field before indexing
      const { _id, ...bodyWithoutId } = product;

      await esClient.index({
        index: 'products_index',
        id: _id, // Specify the document ID here
        body: bodyWithoutId,
      });
    }

    console.log('Data copied from MongoDB to Elasticsearch successfully!');
  } catch (esError) {
    console.error('Error copying data to Elasticsearch:', esError.message);
  } finally {
    // Close connections
    await mongoose.disconnect();
    await esClient.close();
  }
}

// Call the function to copy data
module.exports = copyMongoDataToElasticsearch;
