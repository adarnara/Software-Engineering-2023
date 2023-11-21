const mongoose = require("mongoose");
const shoppingCart = require("../models/shoppingCart");
const connectDB = require("../config/db");
const membersCollection = require("../models/memberModel");
const shoppingCartCollection = require("../models/shoppingCart"); // dupliicate
const cartProductCollection = require("../models/cartProduct");
const productCollection = require("../models/Product");
const usersCollection = require("../models/users.js");

const cartRepo = require("../Repository/cartRepo.js");
const productRepo = require("../Repository/ProductRepo.js");
const shippingRepo = require("../Repository/shippingRepo.js");

const url = require("url");
const { request } = require("http");
const { parse } = require("path");

const parseProductPrice = /\$([\d.]+)/;

async function createAddress(req, res) {
    return new Promise(async (resolve) => {
        // const parsedUrl = url.parse(req.url, true);
        // const queryParams = parsedUrl.query;
        if (req.method !== "POST") {
        let resMsg =
            "Method Not Allowed: Please use POST to add address.";
          let resCode = 405;
          let resType = "text/plain";
          res.writeHead(resCode, { "Content-Type": resType });
          res.end(resMsg);
          resolve(resMsg);
          return;
        }

        let resMsg = "";
        let resCode, resType;
        let requestBody = "";
        let parsedRequestBody;

        try {
            await req.on("data", (chunk) => {
                requestBody += chunk;
            });
            parsedRequestBody = JSON.parse(requestBody);
        } catch (e) {
            console.log(e);
            resolve(e);
            return;
        }

        const name = parsedRequestBody['name'];
        const company = parsedRequestBody['company'];
        const street1 = parsedRequestBody['street1'];
        const city = parsedRequestBody['city'];
        const state = parsedRequestBody['state'];
        const zip = parsedRequestBody['zip'];
        const country = parsedRequestBody['country'];
        const phone = parsedRequestBody['phone'];
        const email = parsedRequestBody['email'];

        const addressObj = await shippingRepo.createAddressObject(name, company, street1, city, state, zip, country, phone, email);
        resCode = 200;
        resMsg = JSON.stringify(addressObj);
        resType = "application/json";
        res.writeHead(resCode, { "Content-Type": resType });
        res.end(resMsg);
        resolve(resMsg);
        return;
    });
}

async function createShipment(req, res) {
    return new Promise(async (resolve) => {
        if (req.method !== "POST") {
            let resMsg =
                "Method Not Allowed: Please use POST to add address.";
              let resCode = 405;
              let resType = "text/plain";
              res.writeHead(resCode, { "Content-Type": resType });
              res.end(resMsg);
              resolve(resMsg);
              return;
        }

        let resMsg = "";
        let resCode, resType;
        let requestBody = "";
        let parsedRequestBody;

        try {
            await req.on("data", (chunk) => {
                requestBody += chunk;
            });
            parsedRequestBody = JSON.parse(requestBody);
        } catch (e) {
            console.log(e);
            resolve(e);
            return;
        }

        // console.log(typeof parsedRequestBody['address_from']);
        addressFrom = parsedRequestBody['address_from'];
        addressTo = parsedRequestBody['address_to'];
        parcel = parsedRequestBody['parcel'];
        
        const shipmentObj = await shippingRepo.createShipmentObject(addressFrom, addressTo, parcel);
        resCode = 200;
        resMsg = JSON.stringify(shipmentObj);
        resType = "application/json";
        res.writeHead(resCode, { "Content-Type": resType });
        res.end(resMsg);
        resolve(resMsg);
        return;
    });
}

async function calculateTotalCostEachProduct(req, res) {
    return new Promise(async (resolve) => {
        if (req.method !== "PATCH") {
            let resMsg = 
                "Method Not Allowed: Please use PATCH to calculate shipping costs.";
            let resCode = 405;
            let resType = "text/plain";
            res.writeHead(resCode, { "Content-Type": resType });
            res.end(resMsg);
            resolve(resMsg);
            return;
        }

        let resMsg = "";
        let resCode, resType;
        let requestBody = "";
        let parsedRequestBody;

        const parsedUrl = url.parse(req.url, true);
        const queryParams = parsedUrl.query;

        if (Object.keys(queryParams).length != 1) {
            resCode = 400;
            resMsg =
              "Bad Request: Please Ensure only one query param for user_id is specified";
            resType = "text/plain";
            res.writeHead(resCode, { "Content-Type": resType });
            res.end(resMsg);
            resolve(resMsg);
            return;
        }
        if (!("user_id" in queryParams)) {
            resCode = 400;
            resType = "text/plain";
            resMsg = "Bad Request: Single query param must have the key 'user_id'";
            res.writeHead(resCode, { "Content-Type": resType });
            res.end(resMsg);
            resolve(resMsg);
            return;
        }
        const user_id = queryParams["user_id"];

        try {
            await req.on("data", (chunk) => {
                requestBody += chunk;
            });
            parsedRequestBody = JSON.parse(requestBody);
        } catch (err) {
            console.error(err);
            return;
        }

        //         query param: ?user_id=<user_id>
        // {
        //     "address_to": {
        //                 "name": name,
        //                 "company": company,
        //                 "street1": street1,
        //                 "city": city,
        //                 "state": state,
        //                 "zip": zip,
        //                 "country": country,
        //                 "phone": phone,
        //                 "email": email
        //             },
        //     "parcels": {

        //         ...
        //     }
        // }

        const addressFrom = {
            // ... from env? one address for warehouse?
            "name": "Shawn Ippotle",
            "street1": "215 Clayton St.",
            "city": "San Francisco",
            "state": "CA",
            "zip": "94117",
            "country": "US"
        };
        const addressTo = parsedRequestBody.address_to;
        const parcels = parsedRequestBody.parcels;
        const email = addressTo.email;  // how to check email is valid, since it comes from form?

        try {
            const currMemberCart = await cartRepo.getCurrCart(email);
            if (!currMemberCart) {
                resCode = 401;
                resType = "text/plain";
                resMsg =
                  "Unauthorized Access: Email <" +
                  email +
                  "> is not currently registered!";
                res.writeHead(resCode, { "Content-Type": resType });
                res.end(resMsg);
                resolve(resMsg);
                return;
            }

            const productShipments = await shippingRepo.getCartProductsShippingInfoAndUpdateToAddress(email, addressTo, addressFrom, parcels);
            console.log("217");
            // console.log(productShipments);

            let productShipmentInfo = [];

            // go through shipment for each product in cart
            for (let shipmentArr of productShipments) {
                // let expRegRate = {
                //     "express_rate": null,
                //     "regular_rate": null,
                //     "currency": "USD"
                // }
                // // go through each rate, find FASTEST and CHEAPEST
                // for (let rate of shipment.rates) {
                //     if (rate.attributes !== null && rate.attributes.length > 0) {
                //         if (rate.attributes[0] === 'FASTEST') expRegRate.express_rate = rate.amount;
                //         else if (rate.attributes[0] === 'CHEAPEST') expRegRate.regular_rate = rate.amount;
                //     }
                // }
                productShipmentInfo.push({
                    "ID": shipmentArr[2],
                    "product_id": shipmentArr[0],
                    "product_shipping_info": shipmentArr[1]
                });
            }
            // console.log(productShipmentInfo);
            resCode = 200;
            resType = "application/json";
            resMsg = JSON.stringify({
                "address_from": addressFrom,
                "address_to": addressTo,
                "shipments": productShipmentInfo
            });
            res.writeHead(resCode, { "Content-Type": resType });
            res.end(resMsg);
            console.log("Shipment Info Updated.");
            resolve(resMsg);
        } catch (err) {
            console.error(err);
            return;
        }
    });
}



module.exports = {
    createAddress : createAddress,
    createShipment : createShipment,
    calculateTotalCostEachProduct : calculateTotalCostEachProduct
};
