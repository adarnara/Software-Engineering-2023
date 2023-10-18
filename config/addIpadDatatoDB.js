const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config({ path: '../.env' });

// Connect to MongoDB using Mongoose
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Wait for the connection to open
mongoose.connection.on('open', async () => {
    try {
        const data = fs.readFileSync('../data/ipad.json', 'utf8');
        const jsonData = JSON.parse(data);

        await Product.create(jsonData);
        console.log('Data from ipad.json inserted into MongoDB');
    } catch (error) {
        console.error('Error processing ipad.json:', error);
    } finally {
        // Close the MongoDB connection when all operations are done
        mongoose.connection.close();
    }
});
