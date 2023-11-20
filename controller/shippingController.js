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



module.exports = {
    createAddress : createAddress,
    createShipment : createShipment
};
