
//modules to start up server 
const dotenv = require('dotenv')
dotenv.config()
const http = require('http'); 
const url = require('url');  
const fs = require('fs'); // for file paths 
const PORT = 3000
const mongoose = require('mongoose')

const connectionParams ={
  useNewUrlParser: true, //connection parameter1
  useUnifiedTopology: true // connection parameter2

}
mongoose.connect(process.env.MONGO_URI, connectionParams).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

const server = http.createServer((request, response)=>{
  const parsedUrl = url.parse(request.url,true);
  const path = parsedUrl.pathname; // path name of routes obtained from url i.e: '/products' , '/reviews' etc...

  if (path === '/'){
    response.writeHead(200,{ 'Content-Type': 'text/html'}); // '/' points to our landing page so index.html
    fs.readFile('index.html', (error,data) =>{
      if(error){
        response.writeHead(404);
        response.write('Error: path not found')    // will need to create an error page if the path the user goes to is not available 
      } else {
        response.write(data)
      }
      response.end()
    })
  }

})
server.listen(PORT, (error) =>{
  if (error){
    console.log('Error Occured', error)
  }else {
    console.log(`server is running on ${PORT}`)
  }
})