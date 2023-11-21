const shippingController = require('../controller/shippingController');
const shoppingCartController = require('../controller/shoppingCartController');
// const fs = require('fs');

// let user_id;

// let routes;
// routes['PATCH/cart/' + user_id] = (request, response) => shoppingCartController.changeProductQuantityFromCart(request, response);
// routes['GET/cart/' + user_id] = (request, response) => shoppingCartController.changeProductQuantityFromCart(request, response);
// routes['POST/cart/' + user_id + '/add'] = (request, response) => shoppingCartController.changeProductQuantityFromCart(request, response);
// routes['DELETE/cart/' + user_id + '/remove'] = (request, response) => shoppingCartController.changeProductQuantityFromCart(request, response);

async function addURIToRoute(id)
{
    user_id = id;
}

const routes = {
    'PATCH/cart': (request, response) => shoppingCartController.changeProductQuantityFromCart(request,response),
    'GET/cart': (request, response) => shoppingCartController.getProducts(request,response),
    'POST/cart/add': (request, response) => shoppingCartController.addProductToCart(request,response),
    'DELETE/cart/remove': (request, response) => shoppingCartController.removeProductFromCart(request,response),
    'GET/cartHistory': (request, response) => shoppingCartController.getCartHistory(request,response),
    'PATCH/cart/ship': (request, response) => shippingController.calculateTotalCostEachProduct(request, response)
};

module.exports = routes


// add to cart (POST)
// view all cart products (GET)
// change quantity of products (PATCH)
// remove from cart (DELETE)
// calculate subtotal ($) before checking out (GET)
