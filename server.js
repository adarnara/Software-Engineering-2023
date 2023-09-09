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

