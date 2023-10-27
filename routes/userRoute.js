const userController = require('../controller/userCtrl');
const fs = require('fs');
const routes = {
  'POST/member/login': (request,response) => userController.login('/member/login',request,response),
  'POST/member/register': (request,response) => userController.register('/member/register',request,response),
  'POST/seller/login': (request,response) => userController.login('/seller/login',request,response),
  'GET/users': userController.allUsers,
  'POST/seller/register': (request,response) => userController.register('/seller/register',request,response),

};

module.exports = routes
