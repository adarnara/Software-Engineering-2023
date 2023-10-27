const adminController = require('../controller/adminCtrl');
const adminRoutes = {
 
  'POST/admin/login': (request,response) => adminController.adminLogin(request,response),
  'POST/admin/register': (request,response) => adminController.adminRegister(request,response),
  'GET/admins': adminController.allAdmins,
};

module.exports = adminRoutes


