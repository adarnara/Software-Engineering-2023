const ProductRepository = require('../Repository/ProductRepo');
const { parseJwtHeader } = require("../middlewares/authmiddleware.js");


async function getUserData(req, res)
{
  return new Promise(async (resolve) => {
    let userData = parseJwtHeader(req, res);
    if (userData) {
        resolve(userData);
    } else {
        resolve(null);
    }
  })
}

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
            const newProduct = await ProductRepository.create(requestBody);
            const userData = await getUserData(req,res);
            console.log(userData, "askdjnaskjfnajskfn");
    
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
