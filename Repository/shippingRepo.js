const shoppingCart = require('../models/shoppingCart');
const cartProduct = require('../models/cartProduct');
const membersCollection = require("../models/memberModel");
const shoppingCartCollection = require("../models/shoppingCart"); // dupliicate
const cartProductCollection = require("../models/cartProduct");
const productCollection = require("../models/Product");
const usersCollection = require("../models/users.js");
const cartRepo = require("../Repository/cartRepo.js");
let shippo = require('shippo')('shippo_test_98bdae79698aa6f42363e805399343db9b796058');


class Shipping {
    async createAddressObject(name, company, street1, city, state, zip, country, phone, email) {
        return new Promise((resolve) => {
            const addressObj = shippo.address.create({
                "name": name,
                "company": company,
                "street1": street1,
                "city": city,
                "state": state,
                "zip": zip,
                "country": country,
                "phone": phone,
                "email": email,
                "validate": true
            });

            resolve(addressObj);
            return;
        });
    }

    async createShipmentObject(addressFrom, addressTo, parcel) {
        return new Promise((resolve) => {
            if (!Array.isArray(parcel) && parcel === 'object' && parcel !== null) {
                parcel = [parcel];
            } else if (Array.isArray(parcel) && parcel !== null && parcel.length > 0) {
                parcel = parcel;
            } else {
                resolve(null);
                return;
            }

            console.log("PARCELS:");
            console.log(parcel);

            shippo.shipment.create({
                "address_from": addressFrom,
                "address_to": addressTo,
                "parcels": parcel,
                "async": false
            }, function(err, shipment) {
                console.log("53");
                console.log("SUCCESS CREATING SHIPMENT");
                if (err) {
                    console.error(err);
                }
                // console.log(shipment);
                // for (let rate of shipment.rates) {
                //     // console.log(rate);
                //     // console.log("_______________________");
                //     // if (rate.attributes !== null && rate.attributes.length > 0) console.log("ATTRIBUTE: " + rate.attributes[0]);
                //     // console.log("");
                //     // console.log("");
                //     // console.log("");

                // }
                resolve(shipment);
            });
        })
    }

    async createTransactionObject(rate, labelFileType, isAsync) {
        return new Promise(async (resolve) => {
            const transactionObject = await shippo.transaction.create({
                "rate": rate.object_id,
                "label_file_type": labelFileType,
                "async": isAsync
            }, function(err, transaction) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("TRANSACTION COMPLETE");
                    console.log(transaction);
                }
            });

            resolve(transactionObject);
            return;
        });
    }

    async getCartProductsShippingInfo(email, addressTo, addressFrom, parcels) {
        return new Promise(async (resolve) => {
            const currCart = await cartRepo.getCurrCart(email);
            let shippingObjects = [];
            const fromStr = addressFrom.street1 + ", " + addressFrom.city + ", " + addressFrom.state + ", " + addressFrom.zip;
            const toStr = addressTo.street1 + ", " + addressTo.city + ", " + addressTo.state + ", " + addressTo.zip;

            for (let product of currCart.products) {
                const shipObj = await this.createShipmentObject(addressFrom, addressTo, parcels);
                shippingObjects.push([product.product_id, shipObj, product._id.toString()]);

                // const updatedProduct = await cartRepo.setProductShippingAddresses(product.product_id, currCart._id, fromStr, toStr);

                // await shoppingCartCollection.findById(currCart._id.toString())
                //     .then(cart => {
                //         const indexToUpdate = cart.products.findIndex(someProduct => {
                //             const someProductID = someProduct.product_id;
                //             return someProductID === product.product_id;
                //         });

                //         cart.products[indexToUpdate].set(updatedProduct);

                //         return cart.save();
                // });
                // console.log("UPDATED:");
                // console.log(updated);
                // await cartRepo.deleteProductFromCart(product.product_id, currCart._id);
                // await cartRepo.addProductToCartWithProductObject(email, updated);
                // await cartProductCollection.findOneAndUpdate(
                //     { _id: product._id.toString() },
                //     { $set: {
                //         from: fromStr,
                //         to: toStr
                //     }},
                //     { new: true }
                // );
                console.log("DONE UPDATE");
                
            }

            resolve(shippingObjects);
            return;
        });
    }

    async updateCartProductAddresses(email, currCartID, productID, addressTo, addressFrom) {
        return new Promise(async (resolve) => {
            // const currCart = await cartRepo.getCurrCart(email);
            // const fromStr = addressFrom.street1 + ", " + addressFrom.city + ", " + addressFrom.state + ", " + addressFrom.zip;
            // const toStr = addressTo.street1 + ", " + addressTo.city + ", " + addressTo.state + ", " + addressTo.zip;

            const updatedProduct = await cartRepo.setProductShippingAddresses(productID, currCartID, addressFrom, addressTo);

            await shoppingCartCollection.findById(currCartID.toString())
                .then(cart => {
                    const indexToUpdate = cart.products.findIndex(someProduct => {
                        const someProductID = someProduct.product_id;
                        return someProductID === productID;
                    });

                    cart.products[indexToUpdate].set(updatedProduct);

                    return cart.save();
            });
            console.log("UPDATED:");
            console.log(updatedProduct);
            await cartRepo.deleteProductFromCart(productID, currCartID);
            await cartRepo.addProductToCartWithProductObject(email, updatedProduct);
            await cartProductCollection.findOneAndUpdate(
                { parent_cart: currCartID.toString(), product_id: productID },
                { $set: {
                    from: addressFrom,
                    to: addressTo
                }},
                { new: true }
            );
            console.log("DONE UPDATE");
            resolve(updatedProduct);
            return;
        });
    }

    async updateCartProductShippingRate(email, currCartID, productID, shipRate) {
        return new Promise(async (resolve) => {
            console.log("OOOOOOOOOOOOOOOOOOOOOGA BOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOGA");
            // const currCart = await cartRepo.getCurrCart(email);
            // const fromStr = addressFrom.street1 + ", " + addressFrom.city + ", " + addressFrom.state + ", " + addressFrom.zip;
            // const toStr = addressTo.street1 + ", " + addressTo.city + ", " + addressTo.state + ", " + addressTo.zip;

            const updatedProduct = await cartRepo.setProductShippingRate(productID, currCartID, shipRate);

            await shoppingCartCollection.findById(currCartID.toString())
                .then(cart => {
                    const indexToUpdate = cart.products.findIndex(someProduct => {
                        const someProductID = someProduct.product_id;
                        return someProductID === productID;
                    });

                    cart.products[indexToUpdate].set(updatedProduct);

                    return cart.save();
            });
            console.log("UPDATED:");
            console.log(updatedProduct);
            await cartRepo.deleteProductFromCart(productID, currCartID);
            await cartRepo.addProductToCartWithProductObject(email, updatedProduct);
            


            const foundShipRate = await cartProductCollection.findOneAndUpdate(
                { parent_cart: currCartID.toString(), product_id: productID },
                { $set: {
                    shipping_rate: shipRate
                }},
                { new: true }
            );

            resolve(updatedProduct);
            return;
        });
    }
    
    async updateCartProductTransaction(email, currCartID, productID, transactionObj, shipRate) {
        return new Promise(async (resolve) => {
            // const currCart = await cartRepo.getCurrCart(email);
            // const fromStr = addressFrom.street1 + ", " + addressFrom.city + ", " + addressFrom.state + ", " + addressFrom.zip;
            // const toStr = addressTo.street1 + ", " + addressTo.city + ", " + addressTo.state + ", " + addressTo.zip;

            const updatedProduct = await cartRepo.setProductTransaction(productID, currCartID, transactionObj);

            console.log("UPDATED PR:");
            console.log(updatedProduct + "\n\n\n\n");


            await shoppingCartCollection.findById(currCartID.toString())
                .then(cart => {
                    const indexToUpdate = cart.products.findIndex(someProduct => {
                        const someProductID = someProduct.product_id;
                        return someProductID === productID;
                    });
                    updatedProduct.shipping_rate = shipRate;
                    cart.products[indexToUpdate].set(updatedProduct);

                    return cart.save();
            });
            console.log("UPDATED:");
            console.log(updatedProduct);
            await cartRepo.deleteProductFromCart(productID, currCartID);
            await cartRepo.addProductToCartWithProductObject(email, updatedProduct);
            await cartProductCollection.findOneAndUpdate(
                { parent_cart: currCartID.toString() },
                { $set: {
                    transaction: transactionObj,
                    shipping_rate: shipRate
                }},
                { new: true }
            );


            const currCart = await cartRepo.getCurrCart(email);
            console.log("***EMAIL = " + email);
            console.log("CURR CART = " + JSON.stringify(currCart));
            let currTotalPrice = currCart.totalPrice;
            console.log("Curr total price = " + currTotalPrice);
            console.log("ship price = " + shipRate.amount);
            const newCartTotalPrice = (parseFloat(currTotalPrice) + parseFloat(shipRate.amount)).toFixed(2);
            console.log("NEW PRICE !!!");
            console.log(newCartTotalPrice);
            const updatedCart = await shoppingCartCollection.findOneAndUpdate(
                { _id: currCartID.toString() },
                { $set: {
                    totalPrice: newCartTotalPrice
                } },
                { new: true }
            )

            console.log("UPDATED CART:");
            console.log(JSON.stringify(updatedCart));

            console.log("DONE UPDATE");
            resolve(updatedProduct);
            return;
        });
    }

    async purchaseCart(email, currCartID, transactionTime) {
        return new Promise(async (resolve) => {
            // const currCart = await cartRepo.getCurrCart(email);
            // const fromStr = addressFrom.street1 + ", " + addressFrom.city + ", " + addressFrom.state + ", " + addressFrom.zip;
            // const toStr = addressTo.street1 + ", " + addressTo.city + ", " + addressTo.state + ", " + addressTo.zip;
            const updatedCart = await shoppingCartCollection.findOneAndUpdate(
                { _id: currCartID.toString() },
                { $set: { purchaseTime: transactionTime } },
                { new: true }
            );
            resolve(updatedCart);
            return;

            console.log("UPDATED:");
            console.log(updatedProduct);
            await cartRepo.deleteProductFromCart(productID, currCartID);
            await cartRepo.addProductToCartWithProductObject(email, updatedProduct);
            await cartProductCollection.findOneAndUpdate(
                { parent_cart: currCartID.toString() },
                { $set: {
                    transaction: transactionObj
                }},
                { new: true }
            );
            console.log("DONE UPDATE");
            resolve(updatedProduct);
            return;
        });
    }
}







module.exports = new Shipping();


/*
            // Add shipping rate to cart's total price
            const currCart = await cartRepo.getCurrCart(email);
            console.log("***EMAIL = " + email);
            console.log("CURR CART = " + JSON.stringify(currCart));
            let currTotalPrice = currCart.totalPrice;
            console.log("Curr total price = " + currTotalPrice);
            console.log("ship price = " + shipRate.amount);
            const newCartTotalPrice = (parseFloat(currTotalPrice) + parseFloat(shipRate.amount)).toFixed(2);
            console.log("NEW PRICE !!!");
            console.log(newCartTotalPrice);
            const updatedCart = await shoppingCartCollection.findOneAndUpdate(
                { _id: currCartID.toString() },
                { $set: {
                    totalPrice: newCartTotalPrice
                } },
                { new: true }
            )




*/