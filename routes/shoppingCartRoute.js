const shoppingCartController = require('../controller/shoppingCartController');
// const fs = require('fs');

let user_id;

let routes;
routes['PATCH/cart/' + user_id] = (request, response) => shoppingCartController.changeProductQuantityFromCart(request, response);
routes['GET/cart/' + user_id] = (request, response) => shoppingCartController.changeProductQuantityFromCart(request, response);
routes['POST/cart/' + user_id + '/add'] = (request, response) => shoppingCartController.changeProductQuantityFromCart(request, response);
routes['DELETE/cart/' + user_id + '/remove'] = (request, response) => shoppingCartController.changeProductQuantityFromCart(request, response);

async function addURIToRoute(id)
{
    user_id = id;
}

// const routes = {
//     'PATCH/cart/<id>': (request, response) => shoppingCartController.changeProductQuantityFromCart(request,response),
//     'GET/cart/6532fb96e94f77fda92b8bc0': (request, response) => shoppingCartController.getProducts(request,response),
//     'POST/cart/<id>/add': (request, response) => shoppingCartController.addProductToCart(request,response),
//     'DELETE/cart/remove': (request, response) => shoppingCartController.removeProductFromCart(request,response),
// };

module.exports = routes


// add to cart (POST)
// view all cart products (GET)
// change quantity of products (PATCH)
// remove from cart (DELETE)
// calculate subtotal ($) before checking out (GET)
