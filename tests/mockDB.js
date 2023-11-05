// const mongoose = require('mongoose');
// const {MongoMemoryServer} = require('mongodb-memory-server');

// module.exports.connect = async() => {
//     globalThis.mongod = await MongoMemoryServer.create(); // make this global so that mongod.stop() works

//     const uri = mongod.getUri();
//     const mongooseOpts = {
//         useNewUrlParser: true,
//         useUnifiedTopology: true, 
//     }
//     await mongoose.connect(uri, mongooseOpts);
//     console.log("connected to virtual DB")
// }

// module.exports.closeDatabase = async() => {
//     await mongoose.connection.dropDatabase();
//     await mongoose.connection.close();
//     await mongod.stop();
// }

// module.exports.clearDatabase = async() => {
//     const collections = mongoose.connection.collections;
//     for (const key in collections) {
//         const collection = collections[key];
//         await collection.deleteMany();

//     }

// }