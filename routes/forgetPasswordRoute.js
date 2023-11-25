const forgetPasswordController = require("../controller/forgetPasswordCtrl");

const routes = {
    'PUT/forgetPassword': (request, response) => forgetPasswordController.changePassword(request, response)
};

module.exports = routes;
