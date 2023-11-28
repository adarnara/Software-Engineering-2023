const ProductRepository = require('../Repository/ProductRepo');
const { parseJwtHeader } = require("../middlewares/authmiddleware.js");
const userRepo = require("../Repository/userRepo.js");
const url = require('url');
const Product = require('../models/Product.js');



function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
      if (req.headers['content-type'] === 'application/json') {
          let body = '';
          req.on('data', chunk => {
              body += chunk.toString(); 
          });
          req.on('end', () => {
              try {
                  resolve(JSON.parse(body));
              } catch (error) {
                  reject(error);
              }
          });
      } else {
          reject(new Error('Unsupported content type'));
      }
  });
}

class SellerController {
    async getAllSellersProducts(req, res) {
        try {
            // console.log("made it to seller controller")
            let userData = parseJwtHeader(req, res); 
            // console.log(userData, "<---- user data");
            if(userData){
                let user = await userRepo.findUserById(userData["id"]); 
                // console.log(user, "<---- user ");
                const sellerEmail = user["email"];  
                // console.log(sellerEmail, "<---- seller email");
                const products = await ProductRepository.getAllFromSellerEmail(sellerEmail); 
                // console.log(products, "<---- products from repo");
                if(!products){
                    // console.log('no products found');
                    throw new Error("No products found from that email.");
                }
                // console.log('finished in sellerController');
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(products));
            } else {
                throw new Error("Not authorized.")
            }
            // const queryObject = url.parse(req.url, true).query; <---- for sending email through url
            // const sellerEmail = queryObject.email;
            // let sellerEmail = "testtt@gmail.com"
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "Failed to fetch products from seller.", error: error.message }));
        }
    }


    async createSellerProduct(req, res) {
        try {
            const requestBody = await parseRequestBody(req);   
            let userData = parseJwtHeader(req, res);
            // We continue handling if the JWT was valid.
            if (userData) {
                let user = await userRepo.findUserById(userData["id"]);
                //add seller data
                requestBody["seller_data"]["company"] = user["Company"];
                requestBody["seller_data"]["bio"] = user["Bio"];
                requestBody["seller_data"]["website"] = user["website"];
                requestBody["seller_data"]["phone"] = user["phoneNumber"];
                requestBody["seller_data"]["email"] = user["email"];
                requestBody["seller_data"]["firstName"] = user["firstName"];
                requestBody["seller_data"]["lastName"] = user["lastName"];
                requestBody["seller_data"]["warehouse_address"]["street1"] = user["address"]["address1"];
                requestBody["seller_data"]["warehouse_address"]["street2"] = user["address"]["address2"];
                requestBody["seller_data"]["warehouse_address"]["street3"] = user["address"]["address3"];

                // requestBody["seller_data"][warehouse_address]["city"] = user["email"];     //----these are not currently being stored to my knowledge
                requestBody["seller_data"]["warehouse_address"]["state"] = user["address"]["state"];
                requestBody["seller_data"]["warehouse_address"]["zip"] = user["address"]["postalCode"];
                // requestBody["seller_data"][warehouse_address]["country"] = user[""];      //----these are not currently being stored to my knowledge
                const newProduct = await ProductRepository.create(requestBody);
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({ message: "Created new product:", newProduct}));
            }
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "Failed to create product.", error: error.message }));
        }
    }

    async updateSellerProduct(req, res) {
        console.log('made it to seller controller')
        try {
            const requestBody = await parseRequestBody(req); 
            console.log(requestBody, "<----- request body")
            let userData = parseJwtHeader(req, res); 
            console.log(userData, "<_------- user data")
            if(userData){
                const filter = { _id: requestBody["_id"] };
                const update = {
                    $set: {
                        name:  requestBody["name"],
                        price: requestBody["price"],
                        stars: requestBody["stars"],
                        rating_count: requestBody["rating_count"],
                        feature_bullets: requestBody["feature_bullets"],
                        images: requestBody["images"],
                        variant_data: requestBody["variant_data"],
                    }
                };
                console.log(filter, "<------ flter");

                console.log(update, "<------ to be update data");

                ProductRepository.updateSellerProduct(filter, update);
                
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({ message: "Updated product:"}));
            } else {
                console.log('not autorized sjdhasjdhjasfkahjfk')
            }
            
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "Failed to update product from seller.", error: error.message }));
        }
    }

    async deleteSellerProduct(req, res) {
        try {    
            let productId = await parseRequestBody(req);
            let userData = parseJwtHeader(req, res);
            if(userData){
                ProductRepository.delete(productId);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({ message: "Product deleted successfully." }));
            }
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "Failed to delete product from seller.", error: error.message }));
        }
    }
}

module.exports = new SellerController();
