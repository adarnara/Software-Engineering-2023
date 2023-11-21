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
                "email": email
            });

            resolve(addressObj);
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
                console.log("SUCCESS CREATING SHIPMENT");
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

    async createTransactionObject(shipmentObj) {
        return new Promise((resolve) => {
            const rate = shipmentObj
        });
    }

    async getCartProductsShippingInfoAndUpdateToAddress(email, addressTo, addressFrom, parcels) {
        return new Promise(async (resolve) => {
            const currCart = await cartRepo.getCurrCart(email);
            let shippingObjects = [];
            const fromStr = addressFrom.street1 + ", " + addressFrom.city + ", " + addressFrom.state + ", " + addressFrom.zip;
            const toStr = addressTo.street1 + ", " + addressTo.city + ", " + addressTo.state + ", " + addressTo.zip;

            for (let product of currCart.products) {
                const shipObj = await this.createShipmentObject(addressFrom, addressTo, parcels);
                shippingObjects.push([product.product_id, shipObj, product._id.toString()]);

                const updatedProduct = await cartRepo.setProductShippingAddresses(product.product_id, currCart._id, fromStr, toStr);

                await shoppingCartCollection.findById(currCart._id.toString())
                    .then(cart => {
                        const indexToUpdate = cart.products.findIndex(someProduct => {
                            const someProductID = someProduct.product_id;
                            return someProductID === product.product_id;
                        });

                        cart.products[indexToUpdate].set(updatedProduct);

                        return cart.save();
                    });
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
}

module.exports = new Shipping();