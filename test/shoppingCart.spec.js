const mongoose = require("mongoose");
const request = require("supertest");
const server = require("../server");
const cartRepo = require("../Repository/cartRepo");

// const userRepo = require('../../Repository/userRepo');
// const productRepo = require('../../Repository/ProductRepo');

jest.mock("../Repository/cartRepo", () => ({
  getUserCurrentCart: jest.fn(),
  createEmptyCart: jest.fn(),
  getUserCartHistory: jest.fn(),
  addProductToCart: jest.fn(),
  removeProductFromCart: jest.fn(),
  getProductsFromCart: jest.fn(),
  changeProductQuantity: jest.fn(),
  getProductsFromCartObject: jest.fn(),
  getProductsFromUser: jest.fn(),
  getCurrProduct: jest.fn(),
  setProductQuantity: jest.fn(),
  updateProductsAndPriceInCurrCart: jest.fn(),
  getCurrCart: jest.fn(),
  pushProductToCart: jest.fn(),
  getMember: jest.fn(),
  deleteProductFromCart: jest.fn(),
}));

jest.mock("../Repository/ProductRepo", () => {
  return {
    getProductById: jest.fn().mockImplementation((id) => {
      // Assuming mock data array for demonstration
      const mockProducts = [
        { id: "books1", name: "Test Book 1", price: "$5.00" },
        { id: "books23", name: "Test Book 23", price: "$7.00" },
        { id: "laptops20", name: "Laptop 20", price: "$10.00" },
      ];

      return Promise.resolve(mockProducts.find((product) => product.id === id));
    }),
  };
});

mongoose.connect = jest.fn();
mongoose.connection = {
  close: jest.fn(),
};

describe("Accessing user current cart", () => {
  beforeAll(async () => {
    await mongoose.connect.mockImplementationOnce(() => Promise.resolve());
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await new Promise((resolve) => server.close(resolve));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const memberEmail = "cartTest@gmail.com";

  const mockedUser = {
    _id: "6547e31db2320ac36290d802",
    email: "cartTest@gmail.com",
  };

  describe("GET /cart?user_id=6547e31db2320ac36290d802", () => {
    it("should return an empty cart for the current user", async () => {
      const currMemberCart = {
        _id: "6547e31db2320ac36290d801",
        email: memberEmail,
        purchaseTime: null,
        numShipped: null,
        totalPrice: "0.0",
        products: [],
        __v: "0",
      };

      cartRepo.getCurrCart.mockResolvedValue(currMemberCart);
      cartRepo.getMember.mockResolvedValue(mockedUser);
      const response = await request(server)
        .get("/cart?user_id=6547e31db2320ac36290d802")
        .set("Content-Type", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(currMemberCart);
    });

    // it("should return an empty cart for the current user", async () => {
    //   const currMemberCart = {
    //     _id: "6547e31db2320ac36290d801",
    //     email: memberEmail,
    //     purchaseTime: null,
    //     numShipped: null,
    //     totalPrice: "0.0",
    //     products: [{
    //       "parent_cart":,

    //     }],
    //     __v: "0",
    //   };

    //   cartRepo.getCurrCart.mockResolvedValue(currMemberCart);
    //   cartRepo.getMember.mockResolvedValue(mockedUser);
    //   const response = await request(server)
    //     .get("/cart?user_id=6547e31db2320ac36290d802")
    //     .set("Content-Type", "application/json");
    //   expect(response.status).toBe(200);
    //   expect(response.body).toEqual(currMemberCart);
    // });
  });

  describe("POST /cart/add?user_id=6547e31db2320ac36290d802", () => {
    let idResponse;
    it("should return the product added to the cart", async () => {
      const addbooks1 = {
        quantity: 5,
        email: memberEmail,
        product_id: "books1",
      };
      cartRepo.pushProductToCart.mockResolvedValue();
      cartRepo.getCurrProduct.mockResolvedValue(null);
      const response = await request(server)
        .post("/cart/add")
        .set("Content-Type", "application/json")
        .send(addbooks1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        __v: 0,
        _id: response.body._id,
        date_arrival: null,
        date_shipped: null,
        from: null,
        parent_cart: "6547e31db2320ac36290d801",
        product_id: "books1",
        quantity: 5,
        shipping_id: null,
        to: null,
      });
      idResponse = response.body._id;
    });
    it("should return the product added to the cart", async () => {
      const addbooks1 = {
        quantity: 4,
        email: memberEmail,
        product_id: "books1",
      };
      cartRepo.pushProductToCart.mockResolvedValue();
      const existingProd = {
        __v: 0,
        _id: idResponse,
        date_arrival: null,
        date_shipped: null,
        from: null,
        parent_cart: "6547e31db2320ac36290d801",
        product_id: "books1",
        quantity: 5,
        shipping_id: null,
        to: null,
      };

      cartRepo.getCurrProduct.mockResolvedValue(existingProd);
      const response = await request(server)
        .post("/cart/add")
        .set("Content-Type", "application/json")
        .send(addbooks1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        __v: 0,
        _id: response.body._id,
        date_arrival: null,
        date_shipped: null,
        from: null,
        parent_cart: "6547e31db2320ac36290d801",
        product_id: "books1",
        quantity: 9,
        shipping_id: null,
        to: null,
      });
    });
  });
});
