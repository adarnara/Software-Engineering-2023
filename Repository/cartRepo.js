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
        return await shoppingCart.find({email: email, purchaseTime: {"$ne": null}});
    }

    async addProductToCart(email, product_id, quantity) {
        const currCart = await shoppingCart.findOne({email: email, purchaseTime: null});
        const productToAdd = await cartProduct.create({parent_cart: currCart, product_id: product_id, quantity: quantity});
        return await productToAdd.save();
    }

    // async getProductsFromCart(cart_id) {
    //     return await cartProduct.find({parent_cart: cart_id});
    // }

    async getProductsFromUser(email) {
        return await shoppingCart.findOne({email: email, purchaseTime: null}).then(res => 
                cartProduct.find({parent_cart: res})
            )

    }
   


}

module.exports = new ShoppingCart();