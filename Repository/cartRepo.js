const shoppingCart = require('../models/shoppingCart');
const cartProduct = require('../models/cartProduct');


class ShoppingCart {
    async getUserCurrentCart(email) {
        return await shoppingCart.findOne({email: email, purchaseTime: null});
    };

    async createEmptyCart(email) {
        const newCart = shoppingCart({email: email});
        return await newCart.save();
    }
    
    async getUserCartHistory(email) {
        return await shoppingCart.find({email: email, purchaseTime: !null});
    }
}

module.exports = new ShoppingCart();