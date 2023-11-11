const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config({ path: '../.env' });

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('open', async () => {
    try {
        const data = fs.readFileSync('../data/tshits.json', 'utf8');
        const jsonData = JSON.parse(data);
        let nextCustomId = 1;

        for (let i = 0; i < jsonData.length; i++) {
            const customId = `tshirts${nextCustomId}`;
            const productData = jsonData[i];

            if (
                typeof productData.price === 'string' &&
                productData.price.match(/^\$\d+(\.\d+)?$/) &&
                typeof productData.stars === 'string' &&
                productData.stars.trim() !== ''
            ) {
                await Product.createWithCustomId(customId, productData);
                nextCustomId++;
            } else {
                console.log('Skipping object');
            }
        }

        console.log('Proper data from ipad.json inserted into MongoDB');
    } catch (error) {
        console.error('Error while processing ipad.json:', error);
    } finally {
        mongoose.connection.close();
    }
});

// add property for quantity of items
