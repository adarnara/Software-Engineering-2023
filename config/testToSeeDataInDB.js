const mongoose = require('mongoose');
const Product = require('../models/Product');

require('dotenv').config({ path: '../.env' });

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

Product.find({})
    .then((products) => {
        console.log('Data retrieved from MongoDB:');
        console.log(products);

        mongoose.connection.close();
    })
    .catch((err) => {
        console.error('Error querying data:', err);
        mongoose.connection.close();
    });
