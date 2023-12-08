const urllib = require('urllib');
const ATLAS_USER = process.env.MONGODB_ATLAS_PUBLIC_KEY;
const ATLAS_USER_KEY = process.env.MONGODB_ATLAS_PRIVATE_KEY;

const baseUrl = 'https://cloud.mongodb.com/api/atlas/v1.0/';
const options = {
    digestAuth: `${ATLAS_USER}:${ATLAS_USER_KEY}`,
};

urllib.request(baseUrl, options, (error, data, response) => {
    if (error || response.statusCode !== 200) {
        console.error(`Error: ${error}`);
        console.error(`Status code: ${response.statusCode}`);
    } else {
        console.log(JSON.parse(data));
    }
});


