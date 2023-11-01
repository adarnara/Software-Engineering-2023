const shoppingCartController = require('../controller/shoppingCartController');
// const fs = require('fs');
const routes = {
    'PATCH/cart': (request, response) => shoppingCartController.changeProductQuantityFromCart(request,response),
    'GET/cart': (request, response) => shoppingCartController.getProducts(request,response),
    'POST/cart/add': (request, response) => shoppingCartController.addProductToCart(request,response),
    'DELETE/cart/remove': (request, response) => shoppingCartController.removeProductFromCart(request,response),
};

module.exports = routes


// add to cart (POST)
// view all cart products (GET)
// change quantity of products (PATCH)
// remove from cart (DELETE)
// calculate subtotal ($) before checking out (GET)
