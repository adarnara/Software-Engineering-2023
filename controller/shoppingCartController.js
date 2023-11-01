const mongoose = require("mongoose");
const shoppingCart = require("../models/shoppingCart");
const connectDB = require("../config/db");
const membersCollection = require("../models/memberModel");
const shoppingCartCollection = require("../models/shoppingCart"); // dupliicate
const cartProductCollection = require("../models/cartProduct");
const url = require("url");
const { request } = require("http");

// connectDB();

// 'GET/': (request, response) => shoppingCartController.getProducts(request,response),
// 'POST/': (request, response) => shoppingCartController.addProductToCart(request,response),
// 'PATCH/': (request, response) => shoppingCartController.changeProductQuantity(request,response),
// 'DELETE/': (request, response) => shoppingCartController.removeProductFromCart(request,response),

// .../users/{id}/cart/

// const updateProductQuantity = async (productId, email, newQuantity) => {
//     try {
//       const updatedProduct = await ShoppingCart.findOneAndUpdate(
//         { product_id: productId, email: email },
//         { $set: { quantity: newQuantity } },
//         { new: true }
//       );

//       return updatedProduct;
//     } catch (error) {
//       throw error;
//     }
//   };

async function changeProductQuantityFromCatalog(
  parsedRequestBody,
  res,
  parent_cart
) {
  return new Promise(async (resolve) => {  
    try {
      const currQuantity = await cartProductCollection.findOne({
        product_id: parsedRequestBody.product_id,
        parent_cart: parent_cart.id,
      }).quantity;
  
      const newQuantity = parsedRequestBody.quantity + currQuantity;
  
      const updatedProduct = await cartProductCollection.findOneAndUpdate(
        { product_id: parsedRequestBody.product_id },
        { $set: { quantity: newQuantity } },
        { new: true }
      );
      resolve (
        "Successfully added product: " +
        product_id +
        " to cart: " +
        parent_cart.id
      );
      return;
    } catch (err) {
      console.log(err);
      resolve (
        "Unable to add product: " + product_id + " to cart: " + parent_cart.id
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
    let requestBody;
    let parsedRequestBody;
  
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
    const badRequest = false;
    if (
      typeof parsedRequestBody === "object" &&
      !Array.isArray(parsedRequestBody)
    ) {
      const reqBodyKeys = Object.keys(parsedRequestBody);
      // Check it has exactly three properties
      if (reqBodyKeys.length !== 3) {
        resCode = 400;
        resMsg =
          "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String, email: String}";
        badRequest = true;
        resType = "text/plain";
      } else {
        if (
          !reqBodyKeys.includes("quantity") ||
          !reqBodyKeys.includes("product_id") ||
          !reqBodyKeys.includes("email")
        ) {
          resCode = 400;
          resMsg =
            "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String, email: String}";
          badRequest = true;
          resType = "text/plain";
        } else {
          if (
            typeof parsedRequestBody.quantity !== "number" ||
            typeof parsedRequestBody.product_id !== "string" ||
            typeof parsedRequestBody.email !== "string"
          ) {
            resCode = 400;
            resMsg =
              "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String, email: String}";
            badRequest = true;
            resType = "text/plain";
          } else if (
            parsedRequestBody.quantity == null ||
            parsedRequestBody.product_id == null ||
            parsedRequestBody.email == null
          ) {
            resCode = 400;
            resMsg =
              "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String, email: String} that are not null";
            badRequest = true;
            resType = "text/plain";
          } // Reaching this else means the request body is good to go
          else {
            const quantity = parsedRequestBody.quantity;
            const product_id = parsedRequestBody.product_id;
            const email = parsedRequestBody.email;
  
            // If product exists, we want to increase its quantity in the shopping cart, so call PATCH method to return the proper response
  
            try {
              const currMemberCart = await membersCollection.findOne({
                email: email,
                "cart.purchaseTime": null,
              });
  
              const updatedProduct = await cartProductCollection.findOneAndUpdate(
                { product_id: product_id, parent_cart: currMemberCart.id },
                { $set: { quantity: quantity } },
                { new: true }
              );
  
              resCode = 200;
              resMsg = "Update Successful";
              badRequest = true;
              resType = "text/plain";
            } catch (err) {
              console.log(err);
              resMsg =
                "Unable to update product: " +
                product_id +
                " in cart: " +
                parent_cart.id;
              resCode = 500;
              badRequest = true;
              resType = "text/plain";
            }
            resCode = 200;
            resType = "text/plain";
          }
        }
      }
    } else {
      resCode = 400;
      resMsg =
        "Bad Request: Please ensure request body is a singular JSON object";
      badRequest = true;
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
      let resMsg = "Method Not Allowed: Please use POST to add product to cart.";
      let resCode = 405;
      let resType = "text/plain";
      res.writeHead(resCode, { "Content-Type": resType });
      res.end(resMsg);
      resolve(resMsg);
      return;
    }
  
    let resMsg = "";
    let resCode, resType;
    let requestBody;
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
    if (!regExpURIAddProduct.test(req.url)) {
      let resMsg = "Bad Request: URL must be accessing '.../cart/{_id}";
      let resCode = 400;
      let resType = "text/plain";
      res.writeHead(resCode, { "Content-Type": resType });
      res.end(resMsg);
      resolve(resMsg);
      return;
    }
  
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
      if (reqBodyKeys.length !== 3) {
        resCode = 400;
        resMsg =
          "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String, email: String}";
        resType = "text/plain";
        res.writeHead(resCode, { "Content-Type": resType });
        res.end(resMsg);
        resolve(resMsg);
        return;
      } else {
        console.log("261");
        if (
          !reqBodyKeys.includes("quantity") ||
          !reqBodyKeys.includes("product_id") ||
          !reqBodyKeys.includes("email")
        ) {
          resCode = 400;
          resMsg =
            "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String, email: String}";
          resType = "text/plain";
          res.writeHead(resCode, { "Content-Type": resType });
          res.end(resMsg);
          resolve(resMsg);
          return;
        } else {
          if (
            typeof parsedRequestBody.quantity !== "number" ||
            typeof parsedRequestBody.product_id !== "string" ||
            typeof parsedRequestBody.email !== "string"
          ) {
            console.log("280");
            resCode = 400;
            resMsg =
              "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String, email: String}";
            resType = "text/plain";
            res.writeHead(resCode, { "Content-Type": resType });
            res.end(resMsg);
            resolve(resMsg);
            return;
          } // Reaching this else means the request body is good to go
          else if (
            parsedRequestBody.quantity == null ||
            parsedRequestBody.product_id == null ||
            parsedRequestBody.email == null
          ) {
            console.log("294");
            resCode = 400;
            resMsg =
              "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String, email: String} that are not null";
            resType = "text/plain";
            res.writeHead(resCode, { "Content-Type": resType });
            res.end(resMsg);
            resolve(resMsg);
            return;
          } // Reaching this else means the request body is good to go
          else {
            console.log("304");
            const currMemberCart = await membersCollection.findOne({
              email: email,
              "cart.purchaseTime": null,
            });
  
            const quantity = parsedRequestBody.quantity;
            const product_id = parsedRequestBody.product_id;
            const email = parsedRequestBody.email;
  
            const existingProduct = await cartProductCollection.findOne({
              product_id: product_id,
              parent_cart: currMemberCart._id,
            });
            // If product exists, we want to increase its quantity in the shopping cart, so call PATCH method to return the proper response
            if (existingProduct) {
              console.log("319");

              resMsg = changeProductQuantityFromCatalog(
                parsedRequestBody,
                res,
                currMemberCart
              );
              resCode = 200;
              resType = "text/plain";
              res.writeHead(resCode, { "Content-Type": resType });
              res.end(resMsg);
              resolve(resMsg);
              return;
            } else {
              console.log("331");
              // Add to shopping cart collection
  
              const newProduct = new cartProduct({
                quantity: quantity,
                product_id: product_id,
                parent_cart: currMemberCart._id,
                shipping_status: null,
                from: null,
                to: null,
                date_shipped: null,
                date_arrival: null,
                shipping_id: null,
              });
  
              try {
                // const grabCart = await membersCollection.findOne({ email: `${user}` })[
                //   "cart"
                // ];
          
                // const grabCartProduct = await cartProductCollection.findOneAndDelete({
                //   parent_cart: grabCart._id,
                //   product_id: productId,
                // });

                const savedNewProduct = await newProduct.save();
                console.log(currMemberCart._id);
                shoppingCartCollection.updateOne(
                  { _id: currMemberCart._id },
                  { $push: { products: newProduct } },
                  (error, result) => {
                    if (error) {
                      console.log(
                        "Error adding product to cart."
                      );

                      resCode = 500;
                      resMsg = "Internal Server Error: Unable to add product to cart.";
                      resType = "application/json";
                      res.writeHead(resCode, { "Content-Type": resType });
                      res.end(resMsg);
                      resolve(resMsg);
                      return;
                    } else {
                      console.log(
                        "Product added to Shopping Cart " +
                          result +
                          " --> ",
                        savedNewProduct
                      );

                      resCode = 200;
                      resMsg = JSON.stringify(savedNewProduct);
                      resType = "application/json";
                      res.writeHead(resCode, { "Content-Type": resType });
                      res.end(resMsg);
                      resolve(resMsg);
                      return;
                    }
                  }
                );
                
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
  return new Promise(async (resolve) => {
    let resMsg = "";
    let resCode, resType;
  
    const parsedUrl = url.parse(req.url, true);
    const urlPath = parsedUrl.path;
    const splitUrl = urlPath.split("/");
    const currUser = splitUrl[2];
    let currMemberCart;
    try {
      const currMember = await membersCollection.findOne({
        _id: currUser
      });
      const currMemberCart = await shoppingCartCollection.findOne({
        email: currMember.email,
        purchaseTime: null
      })
      console.log("Curr Member Cart: ", JSON.stringify(currMemberCart));
    } catch (err) {
      console.log(err);
    }
    if (currMemberCart == null) {
      resCode = 200;
      resType = "text/plain";
      resMsg = "There are no items in your shopping cart!";
    } else {
      resCode = 200;
      resType = "application/json";
      resMsg = currMemberCart;
    }
  
    console.log("Status: " + resCode);
  
    res.writeHead(resCode, { "Content-Type": resType });
    res.end(resMsg);
    console.log("Request Complete");
    resolve(resMsg);
  }); 
}

async function removeProductFromCart(req, res) {
  return new Promise(async (resolve) => {
    // take a delete request with uri of /cart/?productId=____

    if (req.method != "DELETE") {
      return;
    }

// ...REMOVE/cart/{user_id}/cartProduct/{cartProduct_id}

    const address = req.url; // request url
    let urlObject = url.parse(address, true);
    productId = urlObject["productId"];
    const user = urlObject.pathname.replace(/\//g, ""); // sanitize path

    try {
      const grabCart = await membersCollection.findOne({ email: `${user}` })[
        "cart"
      ];

      const grabCartProduct = await cartProductCollection.findOneAndDelete({
        parent_cart: grabCart._id,
        product_id: productId,
      });
      // cart product is also deleted from cart array as

      console.log(grabCartProduct);

      // const index = grabCart.products.indexOf({ productId: `${productId}` });
      // grabCart.products = grabCart.products.indexOf.splice(index, 1);
      // console.log("item deleted" + grabCart);
      // grabCart.save();
      res.writeHead(200, { "Content-Type": "application/json" });
      const message = "Item " + grabCartProduct.product_id + "Deleted";
      res.end(JSON.stringify({ message: message }));
      resolve(message);
    } catch (error) {
      res.writeHead(400);
      response.end("bad request");
      resolve("bad request");
    }
  });
}

const NOT_FOUND = 404;
const INVALID_METHOD = 405;
const FOUND_USER = 200;

async function verifyUserID(id, method) {
  return new Promise(async (resolve, reject) => {
    if (method === 'GET') {
      const currMember = await membersCollection.findOne({
        _id: id
      });

      if (!currMember) {
        reject(NOT_FOUND);
        return;
      } else {
        resolve(FOUND_USER);
        return;
      }
    } else if (method === 'POST' || method === 'PATCH' || method === 'DELETE') {
      const currMember = await membersCollection.findOne({
        _id: id,
        "cart.purchaseTime": null,
      });

      if (!currMember) {
        reject(NOT_FOUND);
        return;
      } else {
        resolve(FOUND_USER);
        return;
      }
    } else {
      reject(INVALID_METHOD);
      return;
    }
  });
}



module.exports = { getProducts,removeProductFromCart,addProductToCart, changeProductQuantityFromCart, changeProductQuantityFromCatalog };

