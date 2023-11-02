const connectDB = require('./config/db');
const http = require('http');
const url = require('url');
const PORT = process.env.PORT || 3000;
const userRouter = require("./routes/userRoute");
const adminRouter = require("./routes/adminRoute");
const landingRouter = require('./routes/landingRoute');
const paymentRouter = require('./routes/paymentRoute');

connectDB();

const server = http.createServer(async (request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;
    const method = request.method;

    // Set the CORS headers to allow all origins (you can restrict it as needed)
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Add the necessary HTTP methods you want to support
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Add the necessary headers

    // TODO make all the routers consistent with each other
    if (request.method === 'OPTIONS') {
        // Respond to preflight requests
        response.writeHead(200);
        response.end();
        return;
    }

    const routeKey = `${method}${path}`;
    if (landingRouter[routeKey]) {
        const routeHandler = landingRouter[routeKey];
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
    }
    try {
        const userRouteHandler = userRouter[routeKey];
        const adminRouteHandler = adminRouter[routeKey];
        const paymentRouteHandler = paymentRouter[routeKey];
        if (userRouteHandler) {
            userRouteHandler(request, response);
        } else if(adminRouteHandler) {
            adminRouteHandler(request, response);
        } else if(paymentRouteHandler){
            paymentRouteHandler(request, response);
        } else {
            // Might as well return something than
            // let the client get stuck fetching
            if(!landingRouter[routeKey]){
                response.writeHead(404);
                response.end("Could not find resource!");
            }
        }
    } catch (error) {
        console.log(error);
    }
});

server.listen(PORT, (error) => {
    if (error) {
        console.log('Error Occurred', error);
    } else {
        console.log(`Server is running on ${PORT}`);
    }
});

