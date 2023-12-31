const connectDB = require('./config/db');
const http = require('http');
const url = require('url');
const PORT = process.env.PORT || 3000;
const userRouter = require("./routes/userRoute");
const adminRouter = require("./routes/adminRoute");
const shoppingCartRouter = require('./routes/shoppingCartRoute');
const sellerRouter = require('./routes/sellerRoute');
const shippingRouter = require('./routes/shippingRoute');
const routes = require('./routes/landingRoute');
const landingRouter = require('./routes/landingRoute');

const profileRouter = require('./routes/profileRoute');
const forgetPasswordRouter = require("./routes/forgetPasswordRoute");
const fs = require('fs');
const path_m = require('path');

const paymentRouter = require("./routes/paymentRoute");

const ticketsRouter = require("./routes/ticketsRoute");

const searchRouter = require("./routes/searchRoute");



connectDB();



const server = http.createServer(async (request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;
    const method = request.method;
    // console.log(`Incoming request: ${request.method} ${request.url}`);

    // Set the CORS headers to allow all origins
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
        response.writeHead(200);
        response.end();
        return;
    }

    // Iterate over landingRouter for dynamic routes
    for (const dynamicRoute in searchRouter) {
        const dynamicRoutePath = dynamicRoute.split('/')[1]; // Get the dynamic part of the route
        if (path.startsWith(`/${dynamicRoutePath}`)) {
            const params = parsedUrl.query;
            request.params = params;
            try {
                await searchRouter[dynamicRoute](request, response);
                return;
            } catch (error) {
                console.error('Route Handler Error:', error);
                response.writeHead(500);
                response.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }
        }
    }


    //handling dynamic routes like /user/{id}
    for (const route in userRouter) {
        const methodPart = route.match(/^[A-Z]+/)[0]; // Match the HTTP method part
        const pathPart = route.substring(methodPart.length); // Get the path part

        if (methodPart !== method) continue;

        const params = matchDynamicRoute(pathPart, path);
        if (params) {
            // Found a matching dynamic route
            request.params = params;
            try {
                await userRouter[route](request, response);
                return;
            } catch (error) {
                console.error('Route Handler Error:', error);
                response.writeHead(500);
                response.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }
        }
    }

    // handling dynamic routes like /profile/updateProfile/{userId}
    for (const route in profileRouter) {
        const methodPart = route.match(/^[A-Z]+/)[0]; // Match the HTTP method part
        const pathPart = route.substring(methodPart.length); // Get the path part

        if (methodPart !== method) continue;

        const params = matchDynamicRoute(pathPart, path);
        if (params) {
            // Found a matching dynamic route
            request.params = params;
            try {
                await profileRouter[route](request, response);
                return;
            } catch (error) {
                console.error('Route Handler Error:', error);
                response.writeHead(500);
                response.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }
        }
    }

    for (const route in forgetPasswordRouter) {
        const methodPart = route.match(/^[A-Z]+/)[0];
        const pathPart = route.substring(methodPart.length);

        if (methodPart !== method) continue;

        const params = matchDynamicRoute(pathPart, path);
        if (params) {
            request.params = params;

            // Manually parse the JSON body
            let body = '';
            request.on('data', (chunk) => {
                body += chunk;
            });

            request.on('end', async () => {
                try {
                    if (body) {
                        request.body = JSON.parse(body);
                    }

                    const forgetPasswordRouteHandler = forgetPasswordRouter[route];
                    if (forgetPasswordRouteHandler) {
                        forgetPasswordRouteHandler(request, response);
                    } else {
                        response.writeHead(404);
                        response.end("Could not find resource!");
                    }
                } catch (error) {
                    console.error('Route Handler Error:', error);
                    response.writeHead(500);
                    response.end(JSON.stringify({ message: 'Internal Server Error' }));
                }
            });
            return;
        }
    }

    const routeKey = `${method}${path}`;
    if (routes[routeKey]) {
        const routeHandler = routes[routeKey];
        const req = {
            method: method,
            url: request.url,
            query: parsedUrl.query,
            body: {}, // Initialize an empty body object
        };
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
        } else {
            // Fallback if no route is matched
            response.writeHead(404);
            response.end("Could not find resource!");
        }
    }

    try {
        const userRouteHandler = userRouter[routeKey];
        const adminRouteHandler = adminRouter[routeKey];
        const paymentRouteHandler = paymentRouter[routeKey];
        const shoppingCartRouteHandler = shoppingCartRouter[routeKey];
        const ticketsRouteHandler = ticketsRouter[routeKey];
        const shippingRouteHandler = shippingRouter[routeKey];
        const sellerRouteHandler = sellerRouter[routeKey];

        if (userRouteHandler) {
            userRouteHandler(request, response);
        } else if (adminRouteHandler) {
            adminRouteHandler(request, response);
        } else if (paymentRouteHandler) {
            paymentRouteHandler(request, response);
        } else if (shoppingCartRouteHandler) {
            shoppingCartRouteHandler(request, response);
        } else if(ticketsRouteHandler){
            console.log('Ticket router is working.')
            ticketsRouteHandler(request, response);
        } else if (shippingRouteHandler) {
            shippingRouteHandler(request, response);
        } else if (sellerRouteHandler){
            sellerRouteHandler(request, response);
        } else {
            if (!landingRouter[routeKey]) {
                response.writeHead(404);
                response.end("Could not find resource!");
            }
        }
    } catch (error) {
        console.error('Request Handling Error:', error);
    }
});


// splitting : to get the id.
function matchDynamicRoute(routePattern, path) {
    const routeParts = routePattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (routeParts.length > pathParts.length) return null;

    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
            params[routeParts[i].substring(1)] = pathParts[i];
        } else if (routeParts[i] !== pathParts[i]) {
            return null;
        }
    }
    return params;
}

server.listen(PORT, (error) => {
    if (error) {
        console.log('Error Occurred', error);
    } else {
        console.log(`Server is running on ${PORT}`);
    }
});

module.exports = server;
