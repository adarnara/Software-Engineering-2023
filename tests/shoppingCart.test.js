const mongoose = require('mongoose');
const db = require("./mockDB.js")


// const request = require('supertest');
const server = require('../server.js');
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
  // await mongoose.connection.close();
  await new Promise(resolve => server.close(resolve));
});

describe('Cart operatens', () => {
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
    expect(cartProducts[0].parent_cart.toString()).toBe(cart._id.toString())
    expect(cartProducts[0].product_id).toBe(product_id)
    expect(cartProducts[0].quantity).toBe(13)
  })

  it("change product quantity and delete from cart", async () => {
    const cart = await cartRepo.createEmptyCart(email);
    const item = await cartRepo.addProductToCart(email, product_id, 13)
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


