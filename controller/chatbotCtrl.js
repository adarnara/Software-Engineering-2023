const { NlpManager } = require('node-nlp');
const mongoose = require('mongoose');
const Product = require('../models/Product'); // Assuming your product model is in a 'models' folder

const manager = new NlpManager({ languages: ['en'], nlu: { useNoneFeature: false }, autoSave: false });



async function loadOrTrainModel() {
    try {
        // Attempt to load a saved model
        await manager.load('./controller/Reprua.nlp');
        console.log('Existing model loaded.');
    } catch (error) {
        // Handle the error (e.g., model not found)
        console.log('No existing model found, starting fresh.');
        await trainModel();
    }
}
async function trainModel() {
    const products = await getProductsFromDB();

    // Add greetings
    addGreetings();

    // Populate questions and answers for each product
    for (const product of products) {
        processProduct(product);
    }

    console.log('Training the model...');
    manager.addAnswer('en', 'trigger_log', 'Log training progress');


    await manager.train({ log: true });
    await manager.save('./controller/Reprua.nlp');
    console.log('Model training complete.');
}

function addGreetings() {
    manager.addDocument('en', 'hello', 'greeting');
    manager.addDocument('en', 'hi', 'greeting');
    manager.addDocument('en', 'hey', 'greeting');
    manager.addDocument('en', 'hey you', 'greeting');
    manager.addDocument('en', 'yo', 'greeting');
    manager.addDocument('en', 'goodmorning', 'greeting');
    manager.addDocument('en', 'goodafternoon', 'greeting');
    manager.addDocument('en', 'good day', 'greeting');
    manager.addDocument('en', 'Hello my name is %name%', 'greeting.hello');
    manager.addDocument('en', 'Hi my name is %name%', 'greeting.hello');
    manager.addDocument('en', 'I have to go', 'greeting.bye');
    manager.addDocument('en', 'Goodbye', 'leaving');
    manager.addDocument('en', 'Bye ', 'leaving');

    // Answers
    manager.addAnswer('en', 'greeting.hello', 'Hey there!');
    manager.addAnswer('en', 'greeting.bye', 'Till next time!');
    manager.addAnswer('en', 'leaving', 'Bye!');
    manager.addAnswer('en', 'greeting', 'Hey! How may I help you today?');
    manager.addAnswer('en', 'greeting', 'Hey there. How may I help you today?');
    manager.addAnswer('en', 'greeting', 'Hi! How may I help you today?');
    manager.addAnswer('en', 'greeting', 'Yo whatsup! How may I help you today?');
    manager.addAnswer('en', 'greeting', 'Howdy, How may I help you today?');
}

async function getProductsFromDB() {
    try {
        const products = await Product.find();
        return products;
    } catch (error) {
        console.error('Error retrieving products from the database:', error);
        return [];
    }
}

function processProduct(product) {
    console.log(`Processing product: ${product.name}`);

    const { _id, name, price, stars, rating_count, feature_bullets } = product;

    if (!name || typeof name !== 'string') {
        console.error('Invalid product name:', name);
        return; // Skip this product if the name is invalid
    }

    addPriceQuestion(name, price);
    addStarsQuestion(name, stars);
    addRatingCountQuestion(name, rating_count);
    addFeatureBulletsQuestions(name, feature_bullets);
    addFullFeatureBulletsQuestions(name, feature_bullets);
    addListofAllDetailsQuestion(name, price, stars, rating_count, feature_bullets)


    if (_id.toLowerCase().includes('laptop')) {
        manager.addDocument('en', `Recommend me a laptop`, `recommend_laptop`);
        manager.addAnswer('en', 'recommend_laptop', `A recommended laptop would be ${name}. Here are some details:\n
        - Price: ${price}\n
        - Stars: ${stars}\n
        - Rating Count: ${rating_count}\n
        - Features:\n${feature_bullets.map(feature => `  - ${feature}`).join('\n')}`);
    }

    if (_id.toLowerCase().includes('tshirts')) {
        manager.addDocument('en', `Recommend me a t-shirt`, `recommend_tshirt`);
        manager.addAnswer('en', 'recommend_tshirt', `A recommended t-shirt would be ${name}. Here are some details:\n
        - Price: ${price}\n
        - Stars: ${stars}\n
        - Rating Count: ${rating_count}\n
        - Features:\n${feature_bullets.map(feature => `  - ${feature}`).join('\n')}`);
    }
    if (_id.toLowerCase().includes('books')) {
        manager.addDocument('en', `Recommend me a book`, `recommend_books`);
        manager.addAnswer('en', 'recommend_books', `A recommended book would be ${name}. Here are some details:\n
        - Price: ${price}\n
        - Stars: ${stars}\n
        - Rating Count: ${rating_count}\n
        - Features:\n${feature_bullets.map(feature => `  - ${feature}`).join('\n')}`);
    }
    if (_id.toLowerCase().includes('ipad')) {
        manager.addDocument('en', `Recommend me a ipad`, `recommend_ipad`);
        manager.addAnswer('en', 'recommend_ipad', `A recommended ipad would be ${name}. Here are some details:\n
        - Price: ${price}\n
        - Stars: ${stars}\n
        - Rating Count: ${rating_count}\n
        - Features:\n${feature_bullets.map(feature => `  - ${feature}`).join('\n')}`);
    }

}

function addListofAllDetailsQuestion(productName, price, stars, rating_count, feature_bullets){
    if (productName && price && stars && rating_count && feature_bullets) {
        manager.addDocument('en', `What is the listing details of ${productName}?`, `product_listing_details_${productName}`);
        manager.addAnswer('en', `product_listing_details_${productName}`, `For the product: ${productName}. Here are some of the listing details:
        - Price: ${price} 
        - Stars: ${stars} 
        - Rating Count: ${rating_count} 
        - Features:\n${feature_bullets.map(feature => `  - ${feature}`).join('\n')}`);
    } else {
        manager.addDocument('en', `What is the price of ${productName}?`, 'price_not_found');
        manager.addAnswer('en', 'price_not_found', `Sorry, cannot find the price for ${productName}.`);
    }
}
function addPriceQuestion(productName, price) {
    if (price) {
        manager.addDocument('en', `What is the price of ${productName}?`, `product_price_${productName}`);
        manager.addAnswer('en', `product_price_${productName}`, `The price of ${productName} is ${price}.`);
    } else {
        manager.addDocument('en', `What is the price of ${productName}?`, 'price_not_found');
        manager.addAnswer('en', 'price_not_found', `Sorry, cannot find the price for ${productName}.`);
    }
}

function addStarsQuestion(productName, stars) {
    if (stars) {
        manager.addDocument('en', `What is the star rating of ${productName}?`, `product_stars_${productName}`);
        manager.addAnswer('en', `product_stars_${productName}`, `${productName} has a star rating of ${stars}.`);
    } else {
        manager.addDocument('en', `What is the star rating of ${productName}?`, 'stars_not_found');
        manager.addAnswer('en', 'stars_not_found', `Sorry, cannot find the star rating for ${productName}.`);
    }
}

function addRatingCountQuestion(productName, ratingCount) {
    if (ratingCount) {
        manager.addDocument('en', `How many ratings does ${productName} have?`, `product_rating_count_${productName}`);
        manager.addAnswer('en', `product_rating_count_${productName}`, `${productName} has ${ratingCount}.`);
    } else {
        manager.addDocument('en', `How many ratings does ${productName} have?`, 'rating_count_not_found');
        manager.addAnswer('en', 'rating_count_not_found', `Sorry, cannot find the rating count for ${productName}.`);
    }
}

function addFullFeatureBulletsQuestions(productName, featureBullets) {
    if (featureBullets) {
            manager.addDocument('en', `Tell me about the features of ${productName}.`, `product_feature_${productName}`);
            manager.addAnswer('en', `product_feature_${productName}`, `${productName} features:\n${featureBullets.map(feature => `  - ${feature}`).join('\n')}`);
    } else {
        manager.addDocument('en', `Tell me about the features of ${productName}.`, 'features_not_found');
        manager.addAnswer('en', 'features_not_found', `Sorry, cannot find the features for ${productName}.`);
    }
}

function addFeatureBulletsQuestions(productName, featureBullets) {
    if (featureBullets && featureBullets.length > 0) {
        for (let i = 0; i < featureBullets.length; i++) {
            manager.addDocument('en', `Tell me about the ${i + 1}th feature of ${productName}.`, `product_feature_${productName}_${i}`);
            manager.addAnswer('en', `product_feature_${productName}_${i}`, `${productName} feature ${i + 1}: ${featureBullets[i]}`);
        }
    } else {
        manager.addDocument('en', `Tell me about the features of ${productName}.`, 'features_not_found');
        manager.addAnswer('en', 'features_not_found', `Sorry, cannot find the features for ${productName}.`);
    }
}

async function processUserInput(input) {
    console.log(`Processing user input: ${input}`);
    let response = await manager.process('en', input);
    console.log('Response:', response);

    if (!response || !response.answer) {
        console.log("No answer found.");
        return "Sorry, wasn't able to answer that! Please ask another question.";
    }

    console.log(`Answer: ${response.answer}`);
    return response.answer;
}

async function main() {
    console.log('Start processing...');
    await loadOrTrainModel();
    console.log('Processing complete.');
}

main();

module.exports = {
    processUserInput,
};
