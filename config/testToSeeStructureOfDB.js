const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

const uri = process.env.MONGO_URI;

async function checkDatabaseStructure() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();

        const database = client.db();
        const collections = await database.listCollections().toArray();

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;

            if (!collectionName.startsWith('system.')) {
                const collection = database.collection(collectionName);
                const sampleDocument = await collection.findOne();
                console.log(`Collection: ${collectionName}`);
                if (sampleDocument) {
                    console.log('Structure of a document:');
                    console.log(JSON.stringify(sampleDocument, null, 2));
                } else {
                    console.log('Collection is empty.');
                }
                console.log('-------------------');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

checkDatabaseStructure();
