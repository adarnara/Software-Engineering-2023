const mongoose = require('mongoose');
const db = require("./mockDB.js")


const request = require('supertest');
const server = require('./testserver.js');
const cartRepo = require('../Repository/cartRepo.js');
const cartModel = require('../models/shoppingCart.js');

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


