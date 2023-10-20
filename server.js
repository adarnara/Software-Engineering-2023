const connectDB = require('./config/db');
const http = require('http'); 
const url = require('url');  
const fs = require('fs'); 
const PORT = process.env.PORT || 4000
const userRouter = require("./routes/userRoute");
const adminRouter = require("./routes/adminRoute");

connectDB();

const server = http.createServer(async (request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const path = parsedUrl.pathname;
  const method = request.method;
try{
  if (path === '/' && method === "GET") {
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
  }
  else if (method === "POST" && path === '/member/login') {
    userRouter.login(request, response);
  }
  else if (method === "POST" && path === '/member/register') {
    userRouter.register(path,request,response);
  }
  else if( method === "POST" && path ==='/seller/login'){
    userRouter.login(request, response);
  } 
  else if (method === "GET" && path === '/users') {
    userRouter.allUsers(request, response);
  }
  else if (method === "GET" && path === '/admins') {
    adminRouter.allAdmins(request, response);
  }
  else if (method === "POST"&& path ==='/seller/register'){
    userRouter.register(path,request, response);
  }
  else if(method === "POST" && path === '/admin/register'){
    adminRouter.adminRegister(request,response)
  }
  else if(method === "POST" && path === '/admin/login'){
    adminRouter.adminLogin(request,response)
  }
   else {
    response.writeHead(404);
    response.end('Not Found');
  }
}catch(error){
  console.log(error); //
}
});

server.listen(PORT, (error) => {
  if (error){
    console.log('Error Occured', error);
  } else {
    console.log(`server is running on port: ${PORT}`);
  }
});