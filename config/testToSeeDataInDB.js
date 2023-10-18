const mongoose = require('mongoose');
const Product = require('../models/Product'); // Import your Mongoose model

require('dotenv').config({ path: '../.env' });

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Query the data from the collection associated with the Product model
Product.find({})
    .then((products) => {
        // Log the retrieved data
        console.log('Data retrieved from MongoDB:');
        console.log(products);

        // Close the MongoDB connection
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error('Error querying data:', err);
        mongoose.connection.close();
    });
