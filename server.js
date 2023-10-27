const connectDB = require('./config/db');
const http = require('http');
const url = require('url');
const PORT = process.env.PORT || 3000;
const routes = require('./routes/Products');

connectDB();

const server = http.createServer(async (request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;
    const method = request.method;

    // Set the CORS headers to allow all origins (you can restrict it as needed)
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Add the necessary HTTP methods you want to support
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Add the necessary headers

    if (request.method === 'OPTIONS') {
        // Respond to preflight requests
        response.writeHead(200);
        response.end();
        return;
    }

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

