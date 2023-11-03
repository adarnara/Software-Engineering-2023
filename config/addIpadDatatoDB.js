const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
// const dataJSONs = require('../data/*');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('open', async () => {
    try {
        const jsonFiles = ['books.json', 'laptop.json', 'tshirts.json', 'ipad.json'];
        for (const jsonFile of jsonFiles) {
            console.log(`../data/${jsonFile}\n\n\n\n\n\n\n`);
            const data = fs.readFileSync(`../data/${jsonFile}`, 'utf8');
            const jsonData = JSON.parse(data);

            let nextCustomId = 1;

            for (let i = 0; i < jsonData.length; i++) {
                const category = jsonFile.split('.')[0];
                const customId = `${category}${nextCustomId}`;
                const productData = jsonData[i];

                if (
                    typeof productData.price === 'string' &&
                    productData.price.match(/^\$\d+(\.\d+)?$/) &&
                    typeof productData.stars === 'string' &&
                    productData.stars.trim() !== ''
                ){
                    await Product.createWithCustomId(customId, productData);
                    nextCustomId++;
                } else {
                    console.log('Skipping object');
                }
            }
        }

        console.log('Proper data from JSON files inserted into MongoDB');
    } catch (error) {
        console.error('Error while processing JSON files:', error);
    } finally {
        mongoose.connection.close();
    }
});



