const mongoose = require("mongoose");
const shoppingCart = require("../models/shoppingCart");
const connectDB = require("../config/db");
const membersCollection = require("../models/memberModel");
const shoppingCartCollection = require("../models/shoppingCart"); // dupliicate
const cartProductCollection = require("../models/cartProduct");
const productCollection = require("../models/Product");
const usersCollection = require("../models/users.js");
const userRepo = require("../Repository/userRepo.js");

const cartRepo = require("../Repository/cartRepo.js");
const productRepo = require("../Repository/ProductRepo.js");

const url = require("url");
const { request } = require("http");
const { parse } = require("path");
const { parseJwtHeader } = require("../middlewares/authmiddleware.js");

const parseProductPrice = /\$([\d.]+)/;


async function getID(req, res)
{
  return new Promise(async (resolve) => {
    let userData = parseJwtHeader(req, res);
    if (userData) resolve(userData["id"]);
    else resolve(null);
    resolve(userData['id']);
  })
}
async function changeProductQuantityFromCatalog(
  parsedRequestBody,
  res,
  currCart
) {
  return new Promise(async (resolve) => {
    try {
      const currProduct = await cartRepo.getCurrProduct(
        parsedRequestBody.product_id,
        currCart._id
      );
      const newQuantity = parsedRequestBody.quantity + currProduct.quantity;
      const updatedProduct = await cartRepo.setProductQuantity(
        parsedRequestBody.product_id,
        currCart._id,
        newQuantity
      );

      const newProductList = [];
      for (const product of currCart.products) {
        if (product.product_id === updatedProduct.product_id) {
          newProductList.push(updatedProduct);
        } else {
          newProductList.push(product);
        }
      }

      // get current price of product and update totalPrice of cart as well
      const productInfo = await productRepo.getProductById(
        parsedRequestBody.product_id
      );

      let productPrice = productInfo.price;
      productPrice = parseFloat(productPrice.match(parseProductPrice)[1]);

      const updatedPOSTproduct =
        await cartRepo.updateProductsAndPriceInCurrCart(
          currCart._id,
          newProductList,
          currCart.totalPrice +
            productPrice * parseFloat(parsedRequestBody.quantity)
        );
      resolve(updatedPOSTproduct);
      return;
    } catch (err) {
      console.log(err);
      resolve(
        "Unable to add product: " +
          parsedRequestBody.product_id +
          " to cart: " +
          currCart._id.toString() +
          "\n" +
          err
      );
      return;
    }
  });
}

async function changeProductQuantityFromCart(req, res) {
  return new Promise(async (resolve) => {
    if (req.method !== "PATCH") {
      let resMsg =
        "Method Not Allowed: Please use PATCH to change product quantity in cart.";
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


    // ensure that only one query parameter (the user_id)
    if (Object.keys(queryParams).length !== 0) {
      resCode = 400;
      resMsg =
        "Bad Request: Please ensure there are no query parameters in the URI";
      resType = "text/plain";
      res.writeHead(resCode, { "Content-Type": resType });
      res.end(resMsg);
      resolve(resMsg);
      return;
    }
    const user_id = await getID(req, res);

    const currMember = await cartRepo.getMember(user_id);
    try {
      await req.on("data", (chunk) => {
        requestBody += chunk;
      });
      parsedRequestBody = JSON.parse(requestBody);
    } catch (err) {
      console.error(err);
      return;
    }
    // Ensure request body is a singular JSON object with non-object properties quantity (Number), etc.
    if (
      typeof parsedRequestBody === "object" &&
      !Array.isArray(parsedRequestBody)
    ) {
      const reqBodyKeys = Object.keys(parsedRequestBody);
      // Check it has exactly three properties
      if (reqBodyKeys.length !== 2) {
        resCode = 400;
        resMsg =
          "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String}";
        resType = "text/plain";
      } else {
        if (
          !reqBodyKeys.includes("quantity") ||
          !reqBodyKeys.includes("product_id") 
        ) {
          resCode = 400;
          resMsg =
            "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String}";
          resType = "text/plain";
        } else {
          if (
            typeof parsedRequestBody.quantity !== "number" ||
            typeof parsedRequestBody.product_id !== "string"
          ) {
            resCode = 400;
            resMsg =
              "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String}";
            resType = "text/plain";
          } else if (
            parsedRequestBody.quantity == null ||
            parsedRequestBody.product_id == null
          ) {
            resCode = 400;
            resMsg =
              "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String, email: String} that are not null";
            resType = "text/plain";
          } // Reaching this else means the request body is good to go
          else {
            // Get JSON body
            const quantity = parsedRequestBody.quantity;
            const product_id = parsedRequestBody.product_id;
            const email = currMember.email;

            // Get query params in the URI (should just be user_id)

            // If product exists, we want to increase its quantity in the shopping cart, so call PATCH method to return the proper response

            try {
              const currMemberCart = await cartRepo.getCurrCart(email);

              // If no cart returned, this user is not registered!
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

              const oldProduct = await cartRepo.getCurrProduct(
                product_id,
                currMemberCart._id
              );

              const oldProductQuantity = oldProduct.quantity;

              const updatedProduct = await cartRepo.setProductQuantity(
                product_id,
                currMemberCart._id,
                quantity
              );

              const newProductList = [];
              for (const product of currMemberCart.products) {
                if (product.product_id === updatedProduct.product_id) {
                  newProductList.push(updatedProduct);
                } else {
                  newProductList.push(product);
                }
              }

              const productInfo = await productRepo.getProductById(
                parsedRequestBody.product_id
              );
              let productPrice = productInfo.price;
              productPrice = parseFloat(
                productPrice.match(parseProductPrice)[1]
              );

              const newUpdatedProduct =
                await cartRepo.updateProductsAndPriceInCurrCart(
                  currMemberCart._id,
                  newProductList,
                  (
                    currMemberCart.totalPrice -
                    productPrice * parseFloat(oldProductQuantity) +
                    productPrice * parseFloat(quantity)
                  ).toFixed(2),
                  productInfo
                );

              const updatedProductInfo = await cartRepo.getCurrProduct(
                parsedRequestBody.product_id,
                currMemberCart._id
              );
              resCode = 202;
              resMsg = JSON.stringify(updatedProductInfo);
              resType = "application/json";
            } catch (err) {
              console.log(err);
              resMsg = "Unable to update product";
              resCode = 500;
              resType = "text/plain";
            }
            resCode = 202;
            resType = "application/json";
          }
        }
      }
    } else {
      resType = "text/plain";
      resCode = 400;
      resMsg =
        "Bad Request: Please ensure request body is a singular JSON object";
    }
    res.writeHead(resCode, { "Content-Type": resType });
    res.end(resMsg);
    resolve(resMsg);
    return;
  });
}

const regExpURIAddProduct = /^\/cart\/add\/[^/]+$/;
async function addProductToCart(req, res) {
  return new Promise(async (resolve) => {
    if (req.method !== "POST") {
      let resMsg =
        "Method Not Allowed: Please use POST to add product to cart.";
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

    // verify correct format -->
    /**
     * {
     *  quantity: Number
     *  product_id: String
     *  email: String
     * }
     */

    // Reg Exp test for URI to correct resource *

    try {
      await req.on("data", (chunk) => {
        requestBody += chunk;
      });
      parsedRequestBody = JSON.parse(requestBody);
    } catch (err) {
      console.error(err);
      resolve(err);
      return;
    }
    // Ensure request body is a singular JSON object with non-object properties quantity (Number), etc.
    if (
      typeof parsedRequestBody === "object" &&
      !Array.isArray(parsedRequestBody)
    ) {
      const reqBodyKeys = Object.keys(parsedRequestBody);
      // Check it has exactly three properties
      const user_id = await getID(req, res);
      const currMember = await cartRepo.getMember(user_id);
      if (reqBodyKeys.length !== 2) {
        resCode = 400;
        resMsg =
          "Bad Request: Please ensure request body has two keys {quantity: Number, product_id: String}";
        resType = "text/plain";
        res.writeHead(resCode, { "Content-Type": resType });
        res.end(resMsg);
        resolve(resMsg);
        return;
      } else {
        if (
          !reqBodyKeys.includes("quantity") ||
          !reqBodyKeys.includes("product_id")
        ) {
          resCode = 400;
          resMsg =
            "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String}";
          resType = "text/plain";
          res.writeHead(resCode, { "Content-Type": resType });
          res.end(resMsg);
          resolve(resMsg);
          return;
        } else {
          if (
            typeof parsedRequestBody.quantity !== "number" ||
            typeof parsedRequestBody.product_id !== "string"
          ) {
            resCode = 400;
            resMsg =
              "Bad Request: Please ensure request body has two keys {quantity: Number, product_id: String}";
            resType = "text/plain";
            res.writeHead(resCode, { "Content-Type": resType });
            res.end(resMsg);
            resolve(resMsg);
            return;
          } // Reaching this else means the request body is good to go
          else if (
            parsedRequestBody.quantity == null ||
            parsedRequestBody.product_id == null 
          ) {
            resCode = 400;
            resMsg =
              "Bad Request: Please ensure request body has two keys {quantity: Number, product_id: String} that are not null";
            resType = "text/plain";
            res.writeHead(resCode, { "Content-Type": resType });
            res.end(resMsg);
            resolve(resMsg);
            return;
          } // Reaching this else means the request body is good to go
          else {
            const currMemberCart = await cartRepo.getCurrCart(
              currMember.email
            );

            const quantity = parsedRequestBody.quantity;
            const product_id = parsedRequestBody.product_id;
            const email = currMember.email;
              console.log(product_id);
            const existingProduct = await cartRepo.getCurrProduct(
              product_id,
              currMemberCart._id
            );

            // If product exists, we want to increase its quantity in the shopping cart, so call PATCH method to return the proper response
            if (existingProduct) {
              const changedCart = await changeProductQuantityFromCatalog(
                parsedRequestBody,
                res,
                currMemberCart
              );
              if (typeof changedProduct !== "string") {
                const changedProduct = await cartRepo.getCurrProduct(
                  product_id,
                  currMemberCart._id
                );
                resMsg = JSON.stringify(changedProduct);
                resType = "application/json";
              } else {
                resType = "text/plain";
              }
              resCode = 201;
              res.writeHead(resCode, { "Content-Type": resType });
              res.end(resMsg);
              resolve(resMsg);
              return;
            } else {
              // Add to shopping cart collection
              const newProduct = new cartProductCollection({
                quantity: quantity,
                product_id: product_id,
                parent_cart: currMemberCart._id.toString(),
                shipping_status: null,
                from: null,
                to: null,
                date_shipped: null,
                date_arrival: null,
                shipping_id: null,
              });

              try {
                const newDeletedList = [];
                for (const product of currMemberCart.deletedProducts) {
                  if (product !== product_id) {
                    newDeletedList.push(product);
                  }
                }

                await cartRepo.updateDeletedList(
                  currMemberCart._id,
                  newDeletedList
                );




                const productInfo = await productRepo.getProductById(
                  product_id
                );
                let productPrice = productInfo.price;
                productPrice = parseFloat(
                  productPrice.match(parseProductPrice)[1]
                );
                const savedNewProduct = await newProduct.save();
                await cartRepo.pushProductToCart(
                  currMemberCart._id,
                  newProduct,
                  currMemberCart.totalPrice +
                    productPrice * parseFloat(quantity)
                );

                resCode = 201;
                resMsg = JSON.stringify(savedNewProduct);
                resType = "application/json";
                res.writeHead(resCode, { "Content-Type": resType });
                res.end(resMsg);
                resolve(resMsg);
                return;
              } catch (e) {
                console.log("Error adding to cart: " + e);
                resCode = 500;
                resMsg = "Internal Server Error: Error adding product to cart";
                resType = "text/plain";
                res.writeHead(resCode, { "Content-Type": resType });
                res.end(resMsg);
                resolve(resMsg);
                return;
              }
            }
          }
        }
      }
    } else {
      resCode = 400;
      resMsg =
        "Bad Request: Please ensure request body is a singular JSON object";
      resType = "text/plain";
      res.writeHead(resCode, { "Content-Type": resType });
      res.end(resMsg);
      resolve(resMsg);
      return;
    }
  });
}

async function getProducts(req, res) {
  // take a get request with uri of /cart?userId=___
  return new Promise(async (resolve) => {
    let resMsg = "";
    let resCode, resType;

    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;

    // ensure that only one query parameter (the user_id)
    if (Object.keys(queryParams).length !== 0) {
      resCode = 400;
      resMsg =
        "Bad Request: Please ensure there are no query parameters in the URI";
      resType = "text/plain";
      res.writeHead(resCode, { "Content-Type": resType });
      res.end(resMsg);
      resolve(resMsg);
      return;
    }

    try {
      const user_id = await getID(req, res);
      const currMember = await cartRepo.getMember(user_id);

      const currMemberCart = await cartRepo.getCurrCart(currMember.email);

      if (currMemberCart == null) {
        //No items found in shopping cart
        resCode = 204;
        resType = "text/plain";
        resMsg = "There are no items in your shopping cart!";
      } else {
        resCode = 200;
        resType = "application/json";
        resMsg = JSON.stringify(currMemberCart);
      }
    } catch (err) {
      // User is not registered
      console.log(err);
      console.log("You are not a registered member!");
      resCode = 401;
      resType = "text/plain";
      resMsg = "You are not a registered member!";
    }

    res.writeHead(resCode, { "Content-Type": resType });
    res.end(resMsg);
    console.log("Request Complete");
    resolve(resMsg);
  });
}

async function removeProductFromCart(req, res) {
  return new Promise(async (resolve) => {
    // take a delete request with uri of /cart/remove?userId=___&productId=____

    if (req.method != "DELETE") {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Method Not Allowed" }));
      return;
    }

    try {
      let resMsg = "";
      let resCode, resType;
      const parsedUrl = url.parse(req.url, true);
      const queryParams = parsedUrl.query;

      // ensure that only one query parameter (the user_id)
      if (Object.keys(queryParams).length !== 1) {
        resCode = 400;
        resMsg = JSON.stringify({
          message:
            "Bad Request: Please ensure exactly 1 query param for product_id is specified",
        });
        resType = "application/json";
        res.writeHead(resCode, { "Content-Type": resType });
        res.end(resMsg);
        resolve(resMsg);
        return;
      }
      if (!("product_id" in queryParams)) {
        resCode = 400;
        resMsg =
          "Bad Request: Must have exactly one query params with key 'product_id'";
        resType = "text/plain";
        res.writeHead(resCode, { "Content-Type": resType });
        res.end(resMsg);
        resolve(resMsg);
        return;
      }
      const user_id = await getID(req, res);
      const product_id = queryParams["product_id"];
      const currMember = await cartRepo.getMember(user_id);
      const currMemberCart = await cartRepo.getCurrCart(currMember.email);

      if (!currMemberCart) {
        // User ID is not in database
        resCode = 401;
        resMsg =
          "Unauthorized Access: Email <" +
          currMember.email +
          "> is not currently registered!";
        resType = "text/plain";
        res.writeHead(resCode, { "Content-Type": resType });
        res.end(resMsg);
        resolve(resMsg);
        return;
      }
      const pushProductToDeleted = await cartRepo.pushProductToDeleted(
        currMemberCart._id,
        product_id
      );
      const removedCartProduct = await cartRepo.deleteProductFromCart(
        product_id,
        currMemberCart._id
      );

      if (!removedCartProduct) {
        //Product is not in cart
        resCode = 404;
        resMsg =
          "Not Found: Product with ID <" +
          product_id +
          "> not found in current cart";
        resType = "text/plain";
        res.writeHead(resCode, { "Content-Type": resType });
        res.end(resMsg);
        resolve(resMsg);
        return;
      }

      const newProductList = [];
      for (const product of currMemberCart.products) {
        if (product.product_id !== removedCartProduct.product_id) {
          newProductList.push(product);
        }
      }
      
      const productInfo = await productRepo.getProductById(product_id);

      let productPrice = productInfo.price;
      productPrice = parseFloat(productPrice.match(parseProductPrice)[1]);

      await cartRepo.updateProductsAndPriceInCurrCart(
        currMemberCart._id,
        newProductList,
        (
          currMemberCart.totalPrice -
          productPrice * parseFloat(removedCartProduct.quantity)
        ).toFixed(2)
      );

      resCode = 202;
      resMsg = JSON.stringify(removedCartProduct);
      resType = "application/json";
      res.writeHead(resCode, { "Content-Type": resType });
      res.end(resMsg);
      resolve(resMsg);
      return;
    } catch (error) {
      console.log(error);
      res.writeHead(400);
      res.end("Bad Request: " + error);
      resolve("bad request");
    }
  });
}

const NOT_FOUND = 404;
const INVALID_METHOD = 405;
const FOUND_USER = 200;

// async function verifyUserID(id, method) {
//   return new Promise(async (resolve, reject) => {
//     if (method === "GET") {
//       const currMember = await membersCollection.findOne({
//         _id: id,
//       });

//       if (!currMember) {
//         reject(NOT_FOUND);
//         return;
//       } else {
//         resolve(FOUND_USER);
//         return;
//       }
//     } else if (method === "POST" || method === "PATCH" || method === "DELETE") {
//       const currMember = await membersCollection.findOne({
//         _id: id,
//         "cart.purchaseTime": null,
//       });

//       if (!currMember) {
//         reject(NOT_FOUND);
//         return;
//       } else {
//         resolve(FOUND_USER);
//         return;
//       }
//     } else {
//       reject(INVALID_METHOD);
//       return;
//     }
//   });
// }

// calls cartrepo and sends back array of past cart ids for user in response to a get request
async function getCartHistory(req, res) {
  // // take a get request with uri of /cartHistory?userId=___
  return new Promise(async (resolve) => {
    let resMsg = "";
    let resCode, resType;

    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;

    // ensure that only one query parameter (the user_id)
    if (Object.keys(queryParams).length !== 0) {
      resCode = 400;
      resMsg =
        "Bad Request: Please ensure no params are in the URI";
      resType = "text/plain";
      res.writeHead(resCode, { "Content-Type": resType });
      res.end(resMsg);
      resolve(resMsg);
      return;
    }
    
    const currUser = await getID(req, res);

    try {
      const currMember = await cartRepo.getMember(currUser);

      console.log(currMember.email);

      const currMemberCartHistory = await cartRepo.getUserCartHistory(currMember.email);

      console.log(currMemberCartHistory);

      if (currMemberCartHistory == null) {
        //No shopping carts purchased
        resCode = 204;
        resType = "text/plain";
        resMsg = "You haven't checkout out yet!";
      } else {
        resCode = 200;
        resType = "application/json";
        resMsg = JSON.stringify(currMemberCartHistory);
      }
    } catch (err) {
      // User is not registered
      console.log(err);
      console.log("You are not a registered member!");
      resCode = 401;
      resType = "text/plain";
      resMsg = "You are not a registered member!";
    }

    res.writeHead(resCode, { "Content-Type": resType });
    res.end(resMsg);
    console.log("Request Complete");
    resolve(resMsg);
  });
}

// retrieve specific cart product based on ID
async function getCartProduct(req, res) {
  // // take a get request with uri of /cartHistory?userId=___
  return new Promise(async (resolve) => {
    let resMsg = "";
    let resCode, resType;

    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;

    // ensure that only one query parameter (the user_id)
    if (Object.keys(queryParams).length !== 1) {
      resCode = 400;
      resMsg =
        "Bad Request: Please ensure product_id is specified.";
      resType = "text/plain";
      res.writeHead(resCode, { "Content-Type": resType });
      res.end(resMsg);
      resolve(resMsg);
      return;
    }
    
    if (!("product_id" in queryParams)) {
      resCode = 400;
      resMsg =
        "Bad Request: Must specify product_id";
      resType = "text/plain";
      res.writeHead(resCode, { "Content-Type": resType });
      res.end(resMsg);
      resolve(resMsg);
      return;
    }
    const currUser = await getID(req, res);
    const productID = queryParams["product_id"];

    console.log("*** " + productID);

    try {
      const currMember = await cartRepo.getMember(currUser);
      const currCart = await cartRepo.getCurrCart(currMember.email);
      const cartProductInfo = await cartRepo.getCurrProduct(productID, currCart._id);

      console.log(currMember.email);
      console.log(cartProductInfo);

      if (cartProductInfo == null) {
        //No shopping carts purchased
        resCode = 204;
        resType = "text/plain";
        resMsg = "You don't have this product in your cart!";
      } else {
        resCode = 200;
        resType = "application/json";
        resMsg = JSON.stringify(cartProductInfo);
      }
    } catch (err) {
      // User is not registered
      console.log(err);
      console.log("You are not a registered member!");
      resCode = 401;
      resType = "text/plain";
      resMsg = "You are not a registered member!";
    }

    res.writeHead(resCode, { "Content-Type": resType });
    res.end(resMsg);
    console.log("Request Complete");
    resolve(resMsg);
  });
}

module.exports = {
  getProducts,
  removeProductFromCart,
  addProductToCart,
  changeProductQuantityFromCart,
  changeProductQuantityFromCatalog,
  getCartHistory,
  getCartProduct,
};
