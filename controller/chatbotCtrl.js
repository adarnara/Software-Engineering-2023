const { NlpManager } = require('node-nlp');
const manager = new NlpManager({ languages: ['en'] });

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


