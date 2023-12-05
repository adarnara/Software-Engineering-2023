const SellerController = require('../controller/sellerController');

module.exports = {
    'GET/seller': SellerController.getAllSellersProducts,
    'POST/seller/create': SellerController.createSellerProduct,
    'PUT/seller/update': SellerController.updateSellerProduct,
    'DELETE/seller/delete': SellerController.deleteSellerProduct,
};