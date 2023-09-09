const Movies = require('../models/moviesModel')

async function getMovies(req, res){
    try{
        const movies = await Movies.findAll()
        res.writeHead(200, {'Content-Type': 'application/json' })
        res.end(JSON.stringify(movies))
    } 
    catch (error) {
        console.log(error)
    }
}

module.exports = {
    getMovies
}
