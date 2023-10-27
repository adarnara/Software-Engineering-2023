const connectDB = require('./config/db');
const http = require('http'); 
const url = require('url');  
const fs = require('fs'); 
const PORT = process.env.PORT || 4000
const userRouter = require("./routes/userRoute");
const adminRouter = require("./routes/adminRoute");
const routes = require('./routes/Products');

connectDB();

const server = http.createServer(async (request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const path = parsedUrl.pathname;
  const method = request.method;
  const routeKey = `${method}${path}`;
  if (routes[routeKey]) {
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
    }
  };
  try {
    const userRouteHandler = userRouter[routeKey];
    const adminRouteHandler = adminRouter[routeKey];
    if (userRouteHandler) {
      userRouteHandler(request, response);
    } else if(adminRouteHandler) {
      adminRouteHandler(request,response)
    } else{
      response.writeHead(404);
      response.end('Not Found');
    }
  } catch (error) {
    console.log(error);
  }

});

server.listen(PORT, (error) => {
  if (error){
    console.log('Error Occured', error);
  } else {
    console.log(`server is running on port: ${PORT}`);
  }
});