const mongoose = require('mongoose');
const db = require("./mockDB.js");
const http = require("http");


const request = require('supertest');
const server = require('./testserver.js');
const cartRepo = require('../Repository/cartRepo.js');
const cartModel = require('../models/shoppingCart.js');
let webServer;

// webServer = http.createServer(server);
server.listen(3000, (error) => {
  if (error) {
      console.log('Error Occurred', error);
  } else {
      console.log(`Server is running on 3000`);
  }
});

beforeAll(async () => {
  await db.connect();

});

afterEach(async () => {
  await db.clearDatabase();
  jest.clearAllMocks();
});

afterAll(async () => {
  await db.closeDatabase()
  await new Promise(resolve => server.close(resolve));
});

describe('Cart operations', () => {
  const email = "twc44@scarletmail.rutgers.edu"

  it('new cart for user', async () => {

    const cart = await cartRepo.createEmptyCart(email);
    console.log(cart.email)
    expect(cart.email).toBe(email)
    expect(cart.purchaseTime).toBe(null)
    expect(cart.products).toStrictEqual([])
    expect(cart.numShipped).toBe(null)
    expect(cart.totalPrice).toBe(0)

  })

  const product_id = "19243"

  it("add product", async () => {
    const cart = await cartRepo.createEmptyCart(email);
    const item = await cartRepo.addProductToCart(email, product_id, 13)
    const cartProducts = await cartRepo.getProductsFromCartObject(cart);
    console.log(cartProducts)
    expect(cartProducts[0].parent_cart.toString()).toBe(cart._id.toString())
    expect(cartProducts[0].product_id).toBe(product_id)
    expect(cartProducts[0].quantity).toBe(13)
  })

  it("change product quantity and delete from cart", async () => {
    const cart = await cartRepo.createEmptyCart(email);
    await cartRepo.addProductToCart(email, product_id, 13)
    await cartRepo.changeProductQuantity(email, product_id, 12)
    let cartProducts = await cartRepo.getProductsFromCartObject(cart);

    expect(cartProducts[0].parent_cart.toString()).toBe(cart._id.toString())
    expect(cartProducts[0].product_id).toBe(product_id)
    expect(cartProducts[0].quantity).toBe(12)

    await cartRepo.deleteProductFromCart(product_id, cart._id);
    cartProducts = await cartRepo.getProductsFromCartObject(cart);

    expect(cartProducts[0]).toBe(undefined)
  })

});

describe("Adding products to cart", () => {
  it("should add products not already in the cart correctly", async (done) => {
    const email = "test6@gmail.com";
    const cart = await cartRepo.createEmptyCart(email);
    console.log(cart.email)
    expect(cart.email).toBe(email)
    expect(cart.purchaseTime).toBe(null)
    expect(cart.products).toStrictEqual([])
    expect(cart.numShipped).toBe(null)
    expect(cart.totalPrice).toBe(0)

    request(server)
      .post("/cart/add?user_id=65452b7ef6a81c9363e57985")
      .set("Content-Type", /json/)
      .send({
        quantity: 5,
        product_id: "ipad1",
        email: "test6@gmail.com"
      })
      .end((err, res) => {
        console.log("\n\n\n\n\n" + 87)
        console.log(res)
        if (err) {
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n\n\n\n");
          done.fail(err);
          return;
        }
        console.log("\n\n\n\n\n" + 87)
        console.log(res)
        expect(res).toEqual("");

        done();
      });
  });
});





// describe('Client operations', () => {
//   const email = "twc44@scarletmail.rutgers.edu"

//   it('client product add to cart', async () => {

//     await cartRepo.createEmptyCart(email);


//     // typeof parsedRequestBody.quantity !== "number" ||
//     //             typeof parsedRequestBody.product_id !== "string" ||
//     //             typeof parsedRequestBody.email !== "string"
//     productToAdd = {
//       quantity: 4,
//       product_id: "3290",
//       email: email
//     }
    
//     const response = await request(server)
//           .post('/cart/add')
//           .set ("Content-Type", "application/json")
//           .send(productToAdd);



//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(productToAdd);
//   }, 2000)

    


    // const response = await request(server)
    // .get('/cart/')
    // .set("Content-Type", "application/json")

// });


