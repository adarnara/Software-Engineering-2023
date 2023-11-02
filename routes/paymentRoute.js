const PaymentController = require("../controller/PaymentController");

module.exports = {
    'POST/payment' : PaymentController.getStripePaymentRedirect
};
