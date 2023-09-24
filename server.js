const http = require('http')



const { getMovies } = require('./controllers/moviesController')

const server = http.createServer((req, res) => {
    if(req.url === '/api/movies' && req.method == 'GET'){
            getMovies(req, res)
    }
    else if (req.url.match(/\/api\/movies\/([0-9]+)/) && req.method === 'GET'){
        const id = req.url.split('/')[3]
        getMovie(req, res, id)
    }
    else{
        res.writeHead(404, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({message: 'Route To Server Not Found!'}))
    }
}
)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server Running on port ${PORT}`))


// Database
//
// use dotenv to set enviroment variables dbUsername and dbPassword
// "export dbUsername=_____" and "export dbPassword=____"
const dbUsername = process.env.dbUsername
const dbPassword = process.env.dbPassword
console.log(dbUsername)
console.log(dbPassword)





const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://" + dbUsername + ":" + dbPassword + "@swe2023cluster.gikvwsm.mongodb.net/?retryWrites=true&w=majority"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


