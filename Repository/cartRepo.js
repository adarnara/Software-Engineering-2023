const shoppingCart = require('../models/shoppingCart');
const cartProduct = require('../models/cartProduct');
const membersCollection = require("../models/memberModel");
const shoppingCartCollection = require("../models/shoppingCart"); // dupliicate
const cartProductCollection = require("../models/cartProduct");
const productCollection = require("../models/Product");
const usersCollection = require("../models/users.js");

class ShoppingCart {
    async getUserCurrentCart(email) {
        return await shoppingCart.findOne({email: email, purchaseTime: null});
    };

    async createEmptyCart(email) {
        const newCart = shoppingCart({email: email});
        const savedCart = await newCart.save();
        return savedCart;
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

    async getCurrProduct(product_id, currCart_id) {
        return new Promise(async (resolve) => {
            const currProduct = await cartProductCollection.findOne({
                product_id: product_id,
                parent_cart: currCart_id.toString(),
            });
            resolve(currProduct);
            return;
        });
    }

    async setProductQuantity(product_id, currCart_id, newQuantity) {
        return new Promise(async (resolve) => {
            const updatedProduct = await cartProductCollection.findOneAndUpdate(
                { product_id: product_id, parent_cart: currCart_id.toString() },
                { $set: { quantity: newQuantity } },
                { new: true }
            );
            resolve(updatedProduct);
            return;
        });
    }

    async updateProductsAndPriceInCurrCart(currCart_id, newProductList, newPrice) {
        return new Promise(async (resolve) => {
            await shoppingCartCollection.findOneAndUpdate(
                { _id: currCart_id.toString(), purchaseTime: null },
                { $set: { 
                  products: newProductList,
                  totalPrice: newPrice
                 }},
                { new: true }
            );
            resolve();
            return;            
        });
    }

    async getCurrCart(email) {
        return new Promise(async (resolve) => {
            const currMemberCart = await shoppingCartCollection.findOne({
                email: email,
                purchaseTime: null
            });
            resolve(currMemberCart);
            return;
        });
    }

    async pushProductToCart(currCart_id, newProduct, newPrice) {
        return new Promise(async (resolve) => {
            await shoppingCartCollection.updateOne(
                { _id: currCart_id.toString(), purchaseTime: null },
                { $push: { products: newProduct },
                  $set: {
                    totalPrice: newPrice
                }
              }
              );
            resolve();
            return;
        });
    }

    async getMember(currUser) {
        return new Promise(async (resolve) => {
            console.log(currUser.toString());
            const currMember = await membersCollection.findOne({
                _id: currUser.toString(),
              });
            resolve(currMember);
            return;
        });
    }

    async deleteProductFromCart(product_id, currCart_id) {
        return new Promise(async (resolve) => {
            const removedCartProduct = await cartProductCollection.findOneAndDelete({
                product_id: product_id, parent_cart: currCart_id.toString() 
             });
            resolve(removedCartProduct);
            return;
        });
    }
   


}

module.exports = new ShoppingCart();