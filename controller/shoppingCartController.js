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
  currCart
) {
  return new Promise(async (resolve) => {
    try {
      console.log(parsedRequestBody.product_id)
      console.log(currCart)
      const currProduct = await cartProductCollection.findOne({
        product_id: parsedRequestBody.product_id,
        parent_cart: currCart._id.toString(),
      });
      console.log(currProduct.quantity)
      const newQuantity = parsedRequestBody.quantity + currProduct.quantity;

      const updatedProduct = await cartProductCollection.findOneAndUpdate(
        { product_id: parsedRequestBody.product_id },
        { $set: { quantity: newQuantity } },
        { new: true }
      );
      
      const newProductList = [];
      for (const product of currCart.products) {
        if (product.product_id === updatedProduct.product_id) {
          newProductList.push(updatedProduct);
        } else {
          newProductList.push(product);
        }
      }
      console.log(newProductList);
      console.log(currCart._id + "");

      await shoppingCartCollection.findOneAndUpdate(
        { _id: currCart._id, purchaseTime: null },
        { $set: { 
          products: newProductList
         }},
        { new: true }
        );
            
      resolve(
        "Successfully added product: " +
        parsedRequestBody.product_id +
          " to cart: " +
          currCart._id.toString()
      );
      console.log("Success")
      return;
    } catch (err) {
      console.log(err);
      resolve(
        "Unable to add product: " + parsedRequestBody.product_id + " to cart: " + currCart._id.toString()
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

    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;
    
    // ensure that only one query parameter (the user_id)
    if (Object.keys(queryParams).length !== 1) {
      resCode = 400;
      resMsg = "Bad Request: Please Ensure only one query param for user_id is specified";
      res.writeHead(resCode, { "Content-Type": resType });
      res.end(resMsg);
      resolve(resMsg);
      return;
    }
    if (!('user_id' in queryParams)) {
      resCode = 400;
      resMsg = "Bad Request: Single query param must have the key 'user_id'";
      res.writeHead(resCode, { "Content-Type": resType });
      res.end(resMsg);
      resolve(resMsg);
      return;
    }
    const user_id = queryParams['user_id'];


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
            // Get JSON body
            const quantity = parsedRequestBody.quantity;
            const product_id = parsedRequestBody.product_id;
            const email = parsedRequestBody.email;

            // Get query params in the URI (should just be user_id)



            // If product exists, we want to increase its quantity in the shopping cart, so call PATCH method to return the proper response

            try {
              const currMemberCart = await membersCollection.findOne({
                email: email,
                "cart.purchaseTime": null,
              });

              // If no cart returned, this user is not registered!
              if (!currMemberCart) {
                resCode = 401;
                resMsg = "Unauthorized Access: Email <" + email + "> is not currently registered!";
                res.writeHead(resCode, { "Content-Type": resType });
                res.end(resMsg);
                resolve(resMsg);
                return;
              }

              const updatedProduct =
                await cartProductCollection.findOneAndUpdate(
                  { product_id: product_id, parent_cart: currMemberCart._id.toString() },
                  { $set: { quantity: quantity } },
                  { new: true }
                );

                const newProductList = [];
                for (const product of currMemberCart.products) {
                  if (product.product_id === updatedProduct.product_id) {
                    newProductList.push(updatedProduct);
                  } else {
                    newProductList.push(product);
                  }
                }
                console.log(newProductList);
                console.log(currCart._id + "");

                await shoppingCartCollection.findOneAndUpdate(
                  { _id: currMemberCart._id.toString(), purchaseTime: null },
                  { $set: { 
                    products: newProductList
                  }},
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
    // if (!regExpURIAddProduct.test(req.url)) {
    //   let resMsg = "Bad Request: URL must be accessing '.../cart/{_id}";
    //   let resCode = 400;
    //   let resType = "text/plain";
    //   res.writeHead(resCode, { "Content-Type": resType });
    //   res.end(resMsg);
    //   resolve(resMsg);
    //   return;
    // }

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
            const currMemberCart = await shoppingCartCollection.findOne({
              email: parsedRequestBody.email,
              "cart.purchaseTime": null,
            });

            const quantity = parsedRequestBody.quantity;
            const product_id = parsedRequestBody.product_id;
            const email = parsedRequestBody.email;
            console.log(currMemberCart);
            const existingProduct = await cartProductCollection.findOne({
              product_id: product_id,
              parent_cart: currMemberCart._id.toString(),
            });
            // If product exists, we want to increase its quantity in the shopping cart, so call PATCH method to return the proper response
            if (existingProduct) {
              console.log("319");
              console.log(currMemberCart);
              resMsg = await changeProductQuantityFromCatalog(
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
                // const grabCart = await membersCollection.findOne({ email: `${user}` })[
                //   "cart"
                // ];

                // const grabCartProduct = await cartProductCollection.findOneAndDelete({
                //   parent_cart: grabCart._id,
                //   product_id: productId,
                // });

                const savedNewProduct = await newProduct.save();
                console.log(currMemberCart);
                console.log(364);
                await shoppingCartCollection.updateOne(
                  { _id: currMemberCart._id.toString(), purchaseTime: null },
                  { $push: { products: newProduct } }
                );

                resCode = 200;
                resMsg = JSON.stringify(savedNewProduct);
                resType = "application/json";
                res.writeHead(resCode, { "Content-Type": resType });
                res.end(resMsg);
                resolve(resMsg);
                console.log("Success");
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
        _id: currUser,
      });
      const currMemberCart = await shoppingCartCollection.findOne({
        email: currMember.email,
        purchaseTime: null,
      });
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
    // take a delete request with uri of /cart/remove/?userId=___&productId=____
    
    /*
    const address = req.url; // request url
    let urlObject = url.parse(address, true);
    productId = urlObject["productId"];
    userId = urlObject["userId"];
    */

    if (req.method != "DELETE") {
      res.writeHead(405, { 'Content-Type': 'application/json' });
		  res.end(JSON.stringify({ message: 'Method Not Allowed' }));
      return;
    }

    // ...REMOVE/cart/{user_id}/cartProduct/{cartProduct_id}
  
    try {
      // get email from userId
      // WIP
      /*

      const memberEmail = membersCollection.findById(userId).email; // might be usersCollection, not members collection;
      */
      

      // get current Cart of email
      
      // const grabCart = await shoppingCart.findOne({email: email, purchaseTime: null});

      // delete product from cartProduct
      const grabCartProduct = await cartProductCollection.findOneAndDelete({
        parent_cart: grabCart._id.toString(),
        product_id: productId,
      });

      // cart product is also deleted from cart array on cascade?
      // WIP
      // grabCart.products
      /*
      
      const myArray = [1, 2, 3, 4, 5];

      const index = grabCart.products.indexOf({product_id: productId});

      const x = grabCart.splice(index, 1);

      grabCart.save();
      // console.log(`myArray values: ${myArray}`);
      // console.log(`variable x value: ${x}`);
      
      */




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
    if (method === "GET") {
      const currMember = await membersCollection.findOne({
        _id: id,
      });

      if (!currMember) {
        reject(NOT_FOUND);
        return;
      } else {
        resolve(FOUND_USER);
        return;
      }
    } else if (method === "POST" || method === "PATCH" || method === "DELETE") {
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

module.exports = {
  getProducts,
  removeProductFromCart,
  addProductToCart,
  changeProductQuantityFromCart,
  changeProductQuantityFromCatalog,
};
