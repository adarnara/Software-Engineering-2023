const connectDB = require('./config/db');
const http = require('http');
const url = require('url');
const fs = require('fs');
const PORT = 3000;
const routes = require('./routes/Products');

connectDB();

const server = http.createServer(async (request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;
    const method = request.method;

    if (routes[path] && routes[path][method]) {
        const routeHandler = routes[path][method];
        const req = { query: parsedUrl.query };
        const res = {
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(data) {
                response.writeHead(this.statusCode, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(data));
            },
        };

        try {
            await routeHandler(req, res);
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    } else if (path === '/') {
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

