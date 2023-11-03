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

  describe('Creating new cart for user email', () => {
    it('first test', async () => {
      const email = "twc44@scarletmail.rutgers.edu"

      const cart = await cartRepo.createEmptyCart(email);
      console.log(cart.email)
      expect(cart.email).toBe(email)
      expect(cart.purchaseTime).toBe(null)
      expect(cart.products).toStrictEqual([])
      expect(cart.numShipped).toBe(null)
      expect(cart.totalPrice).toBe(0)

    })
  });