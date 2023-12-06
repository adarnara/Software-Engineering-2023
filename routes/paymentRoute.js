const PaymentController = require("../controller/PaymentController");

module.exports = {
    'POST/checkout' : PaymentController.getStripePaymentRedirect,
    'GET/checkout2' : PaymentController.getStripePaymentRedirectdb
};
