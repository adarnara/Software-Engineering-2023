const shoppingCartController = require('../controller/shoppingCartController');
// const fs = require('fs');
const routes = {
 

    'GET/': (request, response) => shoppingCartController.addProductToCart(request,response),
    'POST/': (request, response) => shoppingCartController.addProductToCart(request,response),
    'PATCH/': (request, response) => shoppingCartController.changeProductQuantity(request,response),
    'DELETE/': (request, response) => shoppingCartController.removeProductFromCart(request,response),
};

module.exports = routes


// add to cart (POST)
// view all cart products (GET)
// change quantity of products (PATCH)
// remove from cart (DELETE)
// calculate subtotal ($) before checking out (GET)
