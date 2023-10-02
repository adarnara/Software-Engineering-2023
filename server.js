
const connectDB = require('./config/db');
const http = require('http'); 
const url = require('url');  
const fs = require('fs'); // for file paths 
const PORT = 3000
const ProductController = require('./controllers/productController');
connectDB()

const server = http.createServer(async (request, response)=>{
  const parsedUrl = url.parse(request.url,true);
  const path = parsedUrl.pathname; // path name of routes obtained from url i.e: '/products' , '/reviews' etc...
  if (path === '/'){
    response.writeHead(200,{ 'Content-Type': 'text/html'}); // '/' points to our landing page so index.html
    fs.readFile('/views/homePage.html', (error,data) =>{
      if(error){
        response.writeHead(404);
        response.write('Error: path not found')    // will need to create an error page if the path the user goes to is not available 
      } else {
        response.write(data)
      }
      response.end()
    })
    if (path === '/products') {
      try {
          const products = await ProductController.getAllProducts();
          fs.readFile('./views/products.html', 'utf8', (err, data) => {
              if (err) {
                  res.writeHead(500);
                  res.end('Internal server error');
                  return;
              }
              // Simple template rendering: Replace placeholder with products
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(renderedHtml);
          });
      } catch (error) {
          res.writeHead(500);
          res.end('Failed to fetch products');
      }
  } else {
      res.writeHead(404);
      res.end('Not Found');
  }
  }
  

})
server.listen(PORT, (error) =>{
  if (error){
    console.log('Error Occured', error)
  }else {
    console.log(`server is running on ${PORT}`)
  }
})