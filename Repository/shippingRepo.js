const shoppingCart = require('../models/shoppingCart');
const cartProduct = require('../models/cartProduct');
const membersCollection = require("../models/memberModel");
const shoppingCartCollection = require("../models/shoppingCart"); // dupliicate
const cartProductCollection = require("../models/cartProduct");
const productCollection = require("../models/Product");
const usersCollection = require("../models/users.js");
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
            shippo.shipment.create({
                "address_from": addressFrom,
                "address_to": addressTo,
                "parcels": [parcel],
                "async": false
            }, function(err, shipment) {
                console.log("SUCCESS CREATING SHIPMENT");
                console.log(shipment);
                resolve(shipment);
            });
        })
    }
}

module.exports = new Shipping();