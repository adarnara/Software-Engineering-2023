const userController = require('../controller/userCtrl');

const routes = {
    'POST/member/login': (request,response) => userController.login('/member/login',request,response),
    'POST/member/register': (request,response) => userController.register('/member/register',request,response),
    'POST/seller/login': (request,response) => userController.login('/seller/login',request,response),
    'GET/users': userController.allUsers,
    'POST/seller/register': (request,response) => userController.register('/seller/register',request,response),
    'PUT/updateUser/:id': (request,response) => userController.updateUser(request,response), 
    'DELETE/user/:id': (request,response) => userController.removeUser(request,response),
    'GET/user/:id':  (request,response) => userController.getAUser(request,response),
  
    'GET/token': userController.getUserByToken,
};

module.exports = routes
