const connectDB = require('./config/db');
const http = require('http');
const url = require('url');
const fs = require('fs');
const PORT = 3000;
const ProductController = require('./controller/ProductController'); // Import the ProductController

connectDB();

const server = http.createServer(async (request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;

    if (path === '/') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        fs.readFile('./views/homePage.html', (error, data) => {
            if (error) {
                response.writeHead(404);
                response.write('Error: path not found');
            } else {
                response.write(data);
            }
            response.end();
        });
    } else if (path === '/landing') {
        try {
            const shuffledProducts = await ProductController.getAllProductsForLanding();

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(shuffledProducts));
        } catch (error) {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: "Failed to fetch products for the landing page." }));
        }
    } else {
        response.writeHead(404);
        response.end('Not Found');
    }
});

server.listen(PORT, (error) => {
    if (error) {
        console.log('Error Occurred', error);
    } else {
        console.log(`Server is running on ${PORT}`);
    }
});

