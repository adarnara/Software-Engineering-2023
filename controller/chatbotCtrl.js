const { NlpManager } = require('node-nlp');
const manager = new NlpManager({ languages: ['en'], nlu: { log: false }  });

manager.addDocument('en', 'hello', 'greeting');
manager.addDocument('en', 'hi', 'greeting');
manager.addDocument('en', 'hey', 'greeting');
manager.addDocument('en', 'hey you', 'greeting');
manager.addDocument('en', 'yo', 'greeting');
manager.addDocument('en', 'goodmorning', 'greeting');
manager.addDocument('en', 'goodafternoon', 'greeting');
manager.addDocument('en', 'good day', 'greeting');

// answers
manager.addAnswer('en', 'greeting', 'Hey! How may I help you today?');
manager.addAnswer('en', 'greeting', 'Hey there. How may I help you today?');
manager.addAnswer('en', 'greeting', 'Hi! How may I help you today?');
manager.addAnswer('en', 'greeting', 'Yo whatsup! How may I help you today?');
manager.addAnswer('en', 'greeting', 'Howdy, How may I help you today?');

manager.addDocument('en', 'What is the price of a MacBook Pro?', 'product_price_macbook');
manager.addDocument('en', 'How much does an iPad cost?', 'product_price_ipad');
manager.addDocument('en', 'Can you tell me the price of a new laptop?', 'product_price_laptop');
manager.addDocument('en', 'What is the average price of a T-shirt?', 'product_price_shirts');
manager.addDocument('en', 'Tell me the cost of a popular book.', 'product_price_book');

// answers for product price
manager.addAnswer('en', 'product_price_macbook', 'The price of a MacBook Pro starts at $1,299.');
manager.addAnswer('en', 'product_price_ipad', 'An iPad\'s price varies, but the base model starts at $329.');
manager.addAnswer('en', 'product_price_laptop', 'The cost of a new laptop can range from $500 to $2,000.');
manager.addAnswer('en', 'product_price_shirts', 'On average, a T-shirt costs around $15 to $30.');
manager.addAnswer('en', 'product_price_book', 'The cost of a popular book can range from $10 to $20.');

// additional questions about products
manager.addDocument('en', 'Tell me about the latest MacBook features.', 'product_info_macbook');
manager.addDocument('en', 'What are the specifications of the newest iPad?', 'product_info_ipad');
manager.addDocument('en', 'Which laptops are good for gaming?', 'product_info_laptop');
manager.addDocument('en', 'Recommend a classic book to read.', 'product_info_book');
manager.addDocument('en', 'What are some trendy T-shirt designs?', 'product_info_tshirt');

// answers for product info
manager.addAnswer('en', 'product_info_macbook', 'The latest MacBook features a faster processor and improved battery life.');
manager.addAnswer('en', 'product_info_ipad', 'The newest iPad has a Retina display and support for the Apple Pencil.');
manager.addAnswer('en', 'product_info_laptop', 'Gaming laptops often come with high-end graphics cards and fast processors.');
manager.addAnswer('en', 'product_info_book', 'I recommend reading "To Kill a Mockingbird" by Harper Lee.');
manager.addAnswer('en', 'product_info_tshirt', 'Trendy T-shirt designs include graphic prints and vintage-inspired patterns.');

manager.addDocument('en', 'Tell me about the MacBook Pro 13-inch.', 'product_info_macbook');
manager.addDocument('en', 'What is the storage capacity of the MacBook Air?', 'product_info_macbook');
manager.addDocument('en', 'How does the new MacBook compare to the previous version?', 'product_info_macbook');

// Answers for MacBook info
manager.addAnswer('en', 'product_info_macbook', 'The MacBook Pro 13-inch features the latest M1 chip for improved performance.');
manager.addAnswer('en', 'product_info_macbook', 'The MacBook Air comes with storage options ranging from 256GB to 2TB.');
manager.addAnswer('en', 'product_info_macbook', 'The new MacBook boasts better battery life and faster processing compared to the previous version.');

// Additional questions about iPad
manager.addDocument('en', 'Tell me about the iPad Pro 2023.', 'product_info_ipad');
manager.addDocument('en', 'What are the color options for the iPad Mini?', 'product_info_ipad');
manager.addDocument('en', 'How does the iPad Pro differ from the standard iPad?', 'product_info_ipad');

// Answers for iPad info
manager.addAnswer('en', 'product_info_ipad', 'The iPad Pro 2023 comes with a Liquid Retina XDR display for stunning visuals.');
manager.addAnswer('en', 'product_info_ipad', 'The iPad Mini offers color choices such as Space Gray, Pink, Purple, and more.');
manager.addAnswer('en', 'product_info_ipad', 'The iPad Pro is more powerful, with additional features like the Apple Pencil support.');

// Additional questions about laptops
manager.addDocument('en', 'What are the top gaming laptops in 2023?', 'product_info_laptop');
manager.addDocument('en', 'Tell me about the latest Dell XPS laptop.', 'product_info_laptop');
manager.addDocument('en', 'What is the battery life of the ASUS ROG laptop?', 'product_info_laptop');

// Answers for laptop info
manager.addAnswer('en', 'product_info_laptop', 'The top gaming laptops in 2023 include models from ASUS, MSI, and Razer.');
manager.addAnswer('en', 'product_info_laptop', 'The latest Dell XPS laptop offers a stunning InfinityEdge display and powerful performance.');
manager.addAnswer('en', 'product_info_laptop', 'The ASUS ROG laptop provides up to 8 hours of battery life for on-the-go gaming.');

// Additional questions about T-shirts
manager.addDocument('en', 'Where can I find eco-friendly T-shirt options?', 'product_info_tshirt');
manager.addDocument('en', 'Tell me about custom printed T-shirts.', 'product_info_tshirt');
manager.addDocument('en', 'What are the popular T-shirt brands in 2023?', 'product_info_tshirt');

// Answers for T-shirt info
manager.addAnswer('en', 'product_info_tshirt', 'You can find eco-friendly T-shirt options at stores like Patagonia and H&M.');
manager.addAnswer('en', 'product_info_tshirt', 'Custom printed T-shirts allow you to design your own unique shirts with personalized graphics.');
manager.addAnswer('en', 'product_info_tshirt', 'Popular T-shirt brands in 2023 include Nike, Adidas, and Supreme.');

manager.addDocument('en', 'Tell me about the author of "The Great Gatsby."', 'product_info_book');
manager.addDocument('en', 'What\'s the genre of the "Harry Potter" series?', 'product_info_book');
manager.addDocument('en', 'Recommend a mystery novel for me.', 'product_info_book');
manager.addDocument('en', 'What is the average price of a hardcover book?', 'product_price_book');

// Answers for book info
manager.addAnswer('en', 'product_info_book', 'The author of "The Great Gatsby" is F. Scott Fitzgerald.');
manager.addAnswer('en', 'product_info_book', 'The "Harry Potter" series falls under the fantasy genre.');
manager.addAnswer('en', 'product_info_book', 'I recommend reading "Gone Girl" by Gillian Flynn, a popular mystery novel.');
manager.addAnswer('en', 'product_info_book', 'The average price of a hardcover book is typically around $25 to $30.');

// train model
manager.train().then(() => {
    manager.save();
});

async function processUserInput(input) {
    let response = await manager.process('en', input);
    console.log(response);
    return response.answer;
}



module.exports = {
    processUserInput,
};


