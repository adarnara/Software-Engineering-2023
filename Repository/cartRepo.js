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
    
    // returns array of cart objects
    async getUserCartHistory(email) {
        return await shoppingCart.find({email: email, purchaseTime: {"$ne": null}});
    }

    async addProductToCart(email, product_id, quantity) {
        const currCart = await shoppingCart.findOne({email: email, purchaseTime: null});
        const productToAdd = await cartProduct.create({parent_cart: currCart, product_id: product_id, quantity: quantity});
        return await productToAdd.save();
    }

    async removeProductFromCart(email, product_id) {
        const currCart = await shoppingCart.findOne({email: email, purchaseTime: null});
        return await cartProduct.findOneAndDelete({parent_cart: currCart, product_id: product_id});
    }

    async getProductsFromCart(cart_idString) {
        return await cartProduct.find({parent_cart: cart_idString});
    }

    async changeProductQuantity(email, product_id, quantity) {
        const currCart = await shoppingCart.findOne({email: email, purchaseTime: null});
        const findProduct = await cartProduct.findOne({parent_cart: currCart._id.toString(), product_id: product_id});
        findProduct.quantity = quantity;
        findProduct.save();
        return findProduct;

    }

    async getProductsFromCartObject(cart_idObject) {
        return await cartProduct.find({parent_cart: cart_idObject._id.toString()});
    }

    async getProductsFromUser(email) {
        return await shoppingCart.findOne({email: email, purchaseTime: null}).then(res => 
                cartProduct.find({parent_cart: res})
            )

    }
   


}

module.exports = new ShoppingCart();