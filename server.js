const connectDB = require('./config/db');
const http = require('http');
const url = require('url');
const PORT = process.env.PORT || 3000;
const userRouter = require('./routes/userRoute');
const adminRouter = require('./routes/adminRoute');
const routes = require('./routes/landingRoute');

connectDB();

const server = http.createServer(async (request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;
    const method = request.method;

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
        // Respond to preflight requests
        response.writeHead(200);
        response.end();
        return;
    }

    const routeKey = `${method}${path}`;
    if (routes[routeKey]) {
        const routeHandler = routes[routeKey];
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

        if (method === 'POST') {
            let body = '';
            request.on('data', (chunk) => {
                body += chunk;
            });

            request.on('end', async () => {
                try {
                    if (body) {
                        req.body = JSON.parse(body);
                    }
                    await routeHandler(req, res);
                } catch (error) {
                    console.error('Route Handler Error:', error);
                    res.status(500).json({ message: 'Internal Server Error' });
                }
            });
        } else if (method === 'GET') {
            try {
                await routeHandler(req, res);
            } catch (error) {
                console.error('Route Handler Error:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    }


    try {
        const userRouteHandler = userRouter[routeKey];
        const adminRouteHandler = adminRouter[routeKey];
        if (userRouteHandler) {
            userRouteHandler(request, response);
        } else if (adminRouteHandler) {
            adminRouteHandler(request, response);
        }
    } catch (error) {
        console.error('Request Handling Error:', error);
    }
});

server.listen(PORT, (error) => {
    if (error) {
        console.error('Server Error:', error);
    } else {
        console.log(`Server is running on ${PORT}`);
    }
});
