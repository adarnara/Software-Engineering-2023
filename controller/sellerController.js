const ProductRepository = require('../Repository/ProductRepo');
const { parseJwtHeader } = require("../middlewares/authmiddleware.js");
const userRepo = require("../Repository/userRepo.js");


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
            //   TODO: 
            //   based on the 
            //       

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(products));
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "Failed to fetch products from seller.", error: error.message }));
        }
    }


    async createSellerProduct(req, res) {
        try {
            const requestBody = await parseRequestBody(req);   
            // console.log(requestBody, "hellooooooooo");
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

                // requestBody["seller_data"][warehouse_address]["city"] = user["email"];
                requestBody["seller_data"]["warehouse_address"]["state"] = user["address"]["state"];
                requestBody["seller_data"]["warehouse_address"]["zip"] = user["address"]["postalCode"];
                // requestBody["seller_data"][warehouse_address]["country"] = user[""];

            }
            const newProduct = await ProductRepository.create(requestBody);
            
            res.writeHead(201, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "Created new product:", newProduct}));
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "Failed to create product.", error: error.message }));
        }
    }

    async updateSellerProduct(req, res) {
        try {

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(updatedProduct));
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "Failed to update product from seller.", error: error.message }));
        }
    }

    async deleteSellerProduct(req, res) {
        try {    

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "Product deleted successfully." }));
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "Failed to delete product from seller.", error: error.message }));
        }
    }
}

module.exports = new SellerController();
