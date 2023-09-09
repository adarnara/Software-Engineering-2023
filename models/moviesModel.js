const movies = require('../data/movies')

function findAll(){
    return new Promise((resolve, reject) => {
        resolve(movies)

    })
}

module.exports = {
    findAll
}