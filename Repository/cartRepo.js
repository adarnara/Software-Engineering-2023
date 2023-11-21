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

    async addProductToCartWithProductObject(email, product) {
        console.log('*********************************');
        console.log(product);
        console.log("")
        const currCart = await shoppingCartCollection.findOne({email: email, purchaseTime: null});
        const productToAdd = await cartProductCollection.create({parent_cart: currCart, product_id: product.product_id, quantity: product.quantity, shipping_price: product.shipping_price, from: product.from, to: product.to, date_shipped: product.date_shipped, date_arrival: product.date_arrival, shipping_id: product.shipping_id});
        console.log("new product:");
        console.log(productToAdd);
        return await productToAdd.save();
    }

    async pushProductToDeleted(currCart_id, product_id) {
        return new Promise(async (resolve) => {
            const updateRes = await shoppingCartCollection.updateOne(
                { _id: currCart_id.toString(), purchaseTime: null },
                { $push: { deletedProducts: product_id }
              }
              );
            resolve(updateRes);
            return;
        });
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

    async setProductShippingAddresses(product_id, currCart_id, newFrom, newTo) {
        return new Promise(async (resolve) => {
            const updatedProduct = await cartProductCollection.findOneAndUpdate(
                { product_id: product_id, parent_cart: currCart_id.toString() },
                { $set: { from: newFrom,
                          to: newTo } },
                { new: true }
            );
            resolve(updatedProduct);
            return;
        });
    }

    async updateProductsAndPriceInCurrCart(currCart_id, newProductList, newPrice) {
        return new Promise(async (resolve) => {
            const updatedProduct = await shoppingCartCollection.findOneAndUpdate(
                { _id: currCart_id.toString(), purchaseTime: null },
                { $set: { 
                  products: newProductList,
                  totalPrice: newPrice
                 }},
                { new: true }
            );
            resolve(updatedProduct);
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
            const updateRes = await shoppingCartCollection.updateOne(
                { _id: currCart_id.toString(), purchaseTime: null },
                { $push: { products: newProduct },
                  $set: {
                    totalPrice: newPrice
                }
              }
              );
            resolve(updateRes);
            return;
        });
    }

    async getMember(currUser) {
        return new Promise(async (resolve) => {
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
    async updateDeletedList(currCart_id, newProductList) {
        return new Promise(async (resolve) => {
            const updatedProduct = await shoppingCartCollection.findOneAndUpdate(
                { _id: currCart_id.toString(), purchaseTime: null },
                { $set: { 
                  deletedProducts: newProductList
                 }},
                { new: true }
            );
            resolve(updatedProduct);
            return;            
        });
    }
   


}

module.exports = new ShoppingCart();