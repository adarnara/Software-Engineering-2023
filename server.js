const connectDB = require('./config/db');
const http = require('http');
const url = require('url');
const PORT = process.env.PORT || 3000;
const userRouter = require("./routes/userRoute");
const adminRouter = require("./routes/adminRoute");
const landingRouter = require('./routes/landingRoute');
const shoppingCartRouter = require('./routes/shoppingCartRoute');

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
        const shoppingCartRouteHandler = shoppingCartRouter[routeKey];
        if (userRouteHandler) {
            userRouteHandler(request, response);
        } else if(adminRouteHandler) {
            adminRouteHandler(request,response)
        } else if(shoppingCartRouteHandler) {
            
                console.log(path);
                const user_id = path.split("/")[2];
                shoppingCartRouteHandler(request,response)
            
        }
    } catch (error) {
        console.log(error);
    }
});

// const routes = {
//     'PATCH/cart/<id>': (request, response) => shoppingCartController.changeProductQuantityFromCart(request,response),
//     'GET/cart/6532fb96e94f77fda92b8bc0': (request, response) => shoppingCartController.getProducts(request,response),
//     'POST/cart/<id>/add': (request, response) => shoppingCartController.addProductToCart(request,response),
//     'DELETE/cart/remove': (request, response) => shoppingCartController.removeProductFromCart(request,response),
// };

server.listen(PORT, (error) => {
    if (error) {
        console.log('Error Occurred', error);
    } else {
        console.log(`Server is running on ${PORT}`);
    }
});

