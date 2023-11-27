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
const { parseJwtHeader } = require("../middlewares/authmiddleware.js");

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
            requestBody = await handleData(req);
            console.log("REQUEST BODY !!!!!");
            console.log(requestBody);
            parsedRequestBody = JSON.parse(requestBody);
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
        resCode = 201;
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
            requestBody = await handleData(req);
            console.log("REQUEST BODY !!!!!");
            console.log(requestBody);
            parsedRequestBody = JSON.parse(requestBody);
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
        resCode = 201;
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
        if (req.method !== "POST") {
            let resMsg = 
                "Method Not Allowed: Please use POST to calculate shipping costs.";
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

        // if (Object.keys(queryParams).length != 1) {
        //     resCode = 400;
        //     resMsg =
        //       "Bad Request: Please Ensure only one query param for user_id is specified";
        //     resType = "text/plain";
        //     res.writeHead(resCode, { "Content-Type": resType });
        //     res.end(resMsg);
        //     resolve(resMsg);
        //     return;
        // }
        // if (!("user_id" in queryParams)) {
        //     resCode = 400;
        //     resType = "text/plain";
        //     resMsg = "Bad Request: Single query param must have the key 'user_id'";
        //     res.writeHead(resCode, { "Content-Type": resType });
        //     res.end(resMsg);
        //     resolve(resMsg);
        //     return;
        // }
        // const user_id = queryParams["user_id"];

        try {
            requestBody = await handleData(req);
            console.log("REQUEST BODY !!!!!");
            console.log(requestBody);
            parsedRequestBody = JSON.parse(requestBody);
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
            "name": "Michael Mogilevsky",
            "company": "Reprua",
            "street1": "604 Bartholomew Rd",
            "city": "Piscataway",
            "state": "NJ",
            "zip": "08854",
            "country": "US",
            "phone:": "+1 123 456 7890",
            "email": "softwareEngineeringF23@gmail.com"
        };
        const addressTo = parsedRequestBody.address_to;
        const parcels = parsedRequestBody.parcels;

        const user_id = await getID(req, res);
        const currMember = await cartRepo.getMember(user_id);
        // const email = addressTo.email;  // how to check email is valid, since it comes from form?
        const email = currMember.email;

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

            const addressToObject = await shippingRepo.createAddressObject(addressTo.name, addressTo.company, addressTo.street1, addressTo.city, addressTo.state, addressTo.zip, addressTo.country, addressTo.phone, addressTo.email);
            if (!(addressToObject.validation_results.is_valid)) {
                resCode = 422;
                resType = "application/json";
                resMsg = JSON.stringify(addressToObject.validation_results);
                res.writeHead(resCode, { "Content-Type": resType });
                res.end(resMsg);
                resolve(resMsg);
                return;
            }

            const addressFromObject = await shippingRepo.createAddressObject(addressFrom.name, addressFrom.company, addressFrom.street1, addressFrom.city, addressFrom.state, addressFrom.zip, addressFrom.country, addressFrom.phone, addressFrom.email);
            if (!(addressFromObject.validation_results.is_valid)) {
                resCode = 422;
                resType = "application/json";
                resMsg = JSON.stringify(addressFromObject.validation_results);
                res.writeHead(resCode, { "Content-Type": resType });
                res.end(resMsg);
                resolve(resMsg);
                return;
            }

            const productShipments = await shippingRepo.getCartProductsShippingInfo(email, addressToObject, addressFromObject, parcels);
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
            resCode = 202;
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


async function setCartProductShippingInfo(req, res) {
    return new Promise(async (resolve) => {
        if (req.method !== "PATCH") {
            let resMsg = 
                "Method Not Allowed: Please use PATCH to update cart product shipping info.";
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
            requestBody = await handleData(req);
            console.log("REQUEST BODY !!!!!");
            console.log(requestBody);
            parsedRequestBody = JSON.parse(requestBody);
        } catch (err) {
            console.error(err);
            return;
        }

        const addressFrom = {
            // ... from env? one address for warehouse?
            "name": "Michael Mogilevsky",
            "company": "Reprua",
            "street1": "604 Bartholomew Rd",
            "city": "Piscataway",
            "state": "NJ",
            "zip": "08854",
            "country": "US",
            "phone:": "+1 123 456 7890",
            "email": "softwareEngineeringF23@gmail.com"
        };

        try {
            let updatedProducts = [];
            console.log(parsedRequestBody);
            let email;
            let currMemberCart;
            const user_id = await getID(req, res);
            const currMember = await cartRepo.getMember(user_id);
            currMemberCart = await cartRepo.getCurrCart(currMember.email);

            for (const product_id in parsedRequestBody) {
                const chosenRate = parsedRequestBody[product_id].chosen_rate;
                const addressTo = parsedRequestBody[product_id].to;
                const fastestRate = parsedRequestBody[product_id].fastest_rate;
                const bestValueRate = parsedRequestBody[product_id].best_value_rate;
                const cheapestRate = parsedRequestBody[product_id].cheapest_rate;

                // email = addressTo.email;          // maybe change later?
                email = currMember.email;

                // currMemberCart = await cartRepo.getCurrCart(email);
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

                // set the correct shipping price of the cartProduct
                let ratePrice = 0;
                if (chosenRate === "fastest") {
                    await shippingRepo.updateCartProductShippingRate(email, currMemberCart._id, product_id, fastestRate);
                } else if (chosenRate === "best_value") {
                    await shippingRepo.updateCartProductShippingRate(email, currMemberCart._id, product_id, bestValueRate);
                } else if (chosenRate === "cheapest") {
                    await shippingRepo.updateCartProductShippingRate(email, currMemberCart._id, product_id, cheapestRate);
                }

                // set from and to address
                const updatedProduct = await shippingRepo.updateCartProductAddresses(email, currMemberCart._id, product_id, addressTo, addressFrom);
                updatedProducts.push(updatedProduct);
            }

            // console.log(productShipmentInfo);
            resCode = 200;
            resType = "application/json";
            resMsg = JSON.stringify({
                "email": email,
                "cart_id": currMemberCart._id,
                "updated_cart_products": updatedProducts
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
function handleData(req) {
    return new Promise((resolve, reject) => {
      let requestBody = '';
      req.on("data", function (chunk) {
        requestBody += chunk;
        console.log("ooga");
      });
      req.on("end", function () {
        resolve(requestBody);
      });
      req.on("error", function (error) {
        reject(error);
      });
    });
  }
async function setCartProductTransaction(req, res) {
    return new Promise(async (resolve) => {
        if (req.method !== "PATCH") {
            let resMsg = 
                "Method Not Allowed: Please use PATCH to update cart product transaction.";
            let resCode = 405;
            let resType = "text/plain";
            res.writeHead(resCode, { "Content-Type": resType });
            res.end(resMsg);
            resolve(resMsg);
            return;
        }

        console.log("==========================");
        console.log(req);

        let resMsg = "";
        let resCode, resType;
        let requestBody = "";
        let parsedRequestBody;

        try {
            
            requestBody = await handleData(req);
            console.log("REQUEST BODY !!!!!");
            console.log(requestBody);
            parsedRequestBody = JSON.parse(requestBody);
            console.log("$#$()*@#$)(*#@$)(*#@$)(*#$@()*#@$)(@#*$)(#$*@)(@#$*)(#$@");
            console.log();

        } catch (err) {
            console.error(err);
            return;
        }

        try {

            console.log("1: " + "    " + JSON.stringify(requestBody));
            parsedRequestBody = JSON.parse(requestBody);

            const user_id = await getID(req, res);
            const currMember = await cartRepo.getMember(user_id);
            const email = currMember.email;
            const currMemberCart = await cartRepo.getCurrCart(email);
            const cartID = currMemberCart._id;

            // const email = parsedRequestBody.email;
            // const cartID = parsedRequestBody.cart_id;
            let lastTransactionTime = null;

            let transactionProducts = [];
            for (const product of parsedRequestBody.updated_cart_products) {
                const productID = product.product_id;
                const shipRate = product.shipping_rate;
                const transactionObject = await shippingRepo.createTransactionObject(shipRate, "PDF", false);
                lastTransactionTime = transactionObject.object_updated;
                const updatedCartProduct = await shippingRepo.updateCartProductTransaction(email, cartID, productID, transactionObject);
                transactionProducts.push(updatedCartProduct);
                // set transaction property of current cart product
            }
            console.log(lastTransactionTime);
            console.log(typeof lastTransactionTime);
            const updatedShoppingCart = await shippingRepo.purchaseCart(email, cartID, lastTransactionTime);
            console.log(parsedRequestBody);
            resCode = 202;
            resType = "application/json";
            resMsg = null;
            // make new empty shopping cart
            await cartRepo.createEmptyCart(email).then((res) => {
                console.log(res);
                resMsg = JSON.stringify({
                    "purchased_cart": updatedShoppingCart,
                    "empty_cart": res
                });
            })
            // console.log(productShipmentInfo);
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

async function getID(req, res)
{
  return new Promise(async (resolve) => {
    let userData = parseJwtHeader(req, res);
    if (userData) resolve(userData["id"]);
    else resolve(null);
    resolve(userData['id']);
  })
}



module.exports = {
    createAddress : createAddress,
    createShipment : createShipment,
    calculateTotalCostEachProduct : calculateTotalCostEachProduct,
    setCartProductShippingInfo : setCartProductShippingInfo,
    setCartProductTransaction : setCartProductTransaction,
};
