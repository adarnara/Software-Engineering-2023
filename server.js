const connectDB = require('./config/db');
const http = require('http'); 
const url = require('url');  
const fs = require('fs'); 
const PORT = process.env.PORT || 4000
const authRouter = require("./routes/authRoute");

connectDB();

const server = http.createServer(async (request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const path = parsedUrl.pathname;
  const method = request.method;

  if (method === "POST" && path === '/register') {
    authRouter.register(request, response);
  }
  else if (method === "POST" && path === '/login') {
    authRouter.login(request, response);
  }
  else if (path === '/' && method === "GET") {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    fs.readFile('./views/homePage.html', (error, data) => {
      if (error) {
        response.writeHead(404);
        response.write('Error: path not found');
        response.end();
      } else {
        response.write(data);
        response.end();
      }
    });
  } else {
    response.writeHead(404);
    response.end('Not Found');
  }
});

server.listen(PORT, (error) => {
  if (error){
    console.log('Error Occured', error);
  } else {
    console.log(`server is running on port: ${PORT}`);
  }
});