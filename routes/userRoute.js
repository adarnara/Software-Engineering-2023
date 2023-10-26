const userController = require('../controller/userCtrl');

const routes = {
  'GET/': (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    fs.readFile('../views/homePage.html', (error, data) => {
      if (error) {
        response.writeHead(404);
        response.write('Error: path not found');
        response.end();
      } else {
        response.write(data);
        response.end();
      }
    });
  },
  'POST/member/login': (request,response) => userController.login('/member/login',request,response),
  'POST/member/register': (request,response) => userController.register('/member/register',request,response),
  'POST/seller/login': (request,response) => userController.login('/seller/login',request,response),
  'GET/users': userController.allUsers,
  'POST/seller/register': (request,response) => userController.register('/seller/register',request,response),

};

module.exports = routes
