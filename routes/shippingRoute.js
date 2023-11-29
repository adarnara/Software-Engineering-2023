const shippingController = require('../controller/shippingController');
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
    'POST/shipping/address': (request, response) => shippingController.createAddress(request, response),
    'POST/shipping/shipment': (request, response) => shippingController.createShipment(request, response),
};

module.exports = routes


// add to cart (POST)
// view all cart products (GET)
// change quantity of products (PATCH)
// remove from cart (DELETE)
// calculate subtotal ($) before checking out (GET)


// 