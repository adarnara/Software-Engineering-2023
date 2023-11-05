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

    it("should return a filled cart with 1 item for the current user", async () => {
      const mockProduct1 = {
        parent_cart: "6547e31db2320ac36290d801",
        product_id: "books7",
        quantity: 36,
        from: null,
        to: null,
        date_shipped: null,
        date_arrival: null,
        shipping_id: null,
        _id: "6547e4639622c407517c4a8f",
        __v: 0
      }

      currMemberCart = {
        _id: "6547e31db2320ac36290d801",
        email: memberEmail,
        purchaseTime: null,
        numShipped: null,
        totalPrice: "0.0",
        products: [mockProduct1],
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

    it("should return a filled cart with 2+ items for the current user", async () => {
      const mockProduct1 = {
        parent_cart: "6547e31db2320ac36290d801",
        product_id: "books7",
        quantity: 36,
        from: null,
        to: null,
        date_shipped: null,
        date_arrival: null,
        shipping_id: null,
        _id: "6547e4639622c407517c4a8f",
        __v: 0
      }

      const mockProduct2 = {
        parent_cart: "6547e31db2320ac36290d801",
        product_id: "ipad1",
        quantity: 3,
        from: null,
        to: null,
        date_shipped: null,
        date_arrival: null,
        shipping_id: null,
        _id: "6547e4639622c407517c4a8f",
        __v: 0
      }

      const mockProduct3 = {
        parent_cart: "6547e31db2320ac36290d801",
        product_id: "laptop12",
        quantity: 1,
        from: null,
        to: null,
        date_shipped: null,
        date_arrival: null,
        shipping_id: null,
        _id: "6547e4639622c407517c4a8f",
        __v: 0
      }

      currMemberCart = {
        _id: "6547e31db2320ac36290d801",
        email: memberEmail,
        purchaseTime: null,
        numShipped: null,
        totalPrice: "0.0",
        products: [mockProduct1, mockProduct2, mockProduct3],
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

    it("should return Error 400 if more than one query parameter is specified in request URL", async () => {
      const mockProduct1 = {
        parent_cart: "6547e31db2320ac36290d801",
        product_id: "books7",
        quantity: 36,
        from: null,
        to: null,
        date_shipped: null,
        date_arrival: null,
        shipping_id: null,
        _id: "6547e4639622c407517c4a8f",
        __v: 0
      }

      currMemberCart = {
        _id: "6547e31db2320ac36290d801",
        email: memberEmail,
        purchaseTime: null,
        numShipped: null,
        totalPrice: "0.0",
        products: [mockProduct1],
        __v: "0",
      };

      cartRepo.getCurrCart.mockResolvedValueOnce(currMemberCart);
      cartRepo.getMember.mockResolvedValueOnce(mockedUser);
      const response = await request(server)
        .get("/cart?user_id=6547e31db2320ac36290d802&product_id=123456789")
        .set("Content-Type", "application/json");
      expect(response.status).toBe(400);
      expect(response.text).toEqual("Bad Request: Please Ensure exactly one query params for user_id is specified");
    });

    it("should return Error 400 if the one query parameter is not a user_id", async () => {
      const mockProduct1 = {
        parent_cart: "6547e31db2320ac36290d801",
        product_id: "books7",
        quantity: 36,
        from: null,
        to: null,
        date_shipped: null,
        date_arrival: null,
        shipping_id: null,
        _id: "6547e4639622c407517c4a8f",
        __v: 0
      }

      currMemberCart = {
        _id: "6547e31db2320ac36290d801",
        email: memberEmail,
        purchaseTime: null,
        numShipped: null,
        totalPrice: "0.0",
        products: [mockProduct1],
        __v: "0",
      };

      cartRepo.getCurrCart.mockResolvedValue(currMemberCart);
      cartRepo.getMember.mockResolvedValue(mockedUser);
      const response = await request(server)
        .get("/cart?product_id=6547e31db2320ac36290d802")
        .set("Content-Type", "application/json");
      expect(response.status).toBe(400);
      expect(response.text).toEqual("Bad Request: Must have exactly one query param with key 'user_id'");
    });

    it("should return Error 400 if the one query parameter is not a user_id", async () => {
      const mockProduct1 = {
        parent_cart: "6547e31db2320ac36290d801",
        product_id: "books7",
        quantity: 36,
        from: null,
        to: null,
        date_shipped: null,
        date_arrival: null,
        shipping_id: null,
        _id: "6547e4639622c407517c4a8f",
        __v: 0
      }

      currMemberCart = {
        _id: "123456789abcdefghijklmno",
        email: memberEmail,
        purchaseTime: null,
        numShipped: null,
        totalPrice: "0.0",
        products: [mockProduct1],
        __v: "0",
      };

      cartRepo.getCurrCart.mockResolvedValue(currMemberCart);
      cartRepo.getMember.mockResolvedValue(mockedUser);
      const response = await request(server)
        .get("/cart?product_id=6547e31db2320ac36290d802")
        .set("Content-Type", "application/json");
      expect(response.status).toBe(400);
      expect(response.text).toEqual("Bad Request: Must have exactly one query param with key 'user_id'");
    });

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
        .post("/cart/add?user_id=6547e31db2320ac36290d802")
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
      const output = {
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

      cartRepo.getCurrProduct
        .mockResolvedValueOnce(existingProd)
        .mockResolvedValueOnce(existingProd)
        .mockResolvedValueOnce(output);

      cartRepo.updateProductsAndPriceInCurrCart.mockResolvedValue(output);

      const response = await request(server)
        .post("/cart/add?user_id=6547e31db2320ac36290d802")
        .set("Content-Type", "application/json")
        .send(addbooks1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(output);
    });

    it("should return error 400 that not all 3 body items have been entered correctly", async () => {
      const addbooks1 = {
        quantity: 4,
        email: memberEmail,
      };

      const response = await request(server)
        .post("/cart/add?user_id=6547e31db2320ac36290d802")
        .set("Content-Type", "application/json")
        .send(addbooks1);
      expect(response.status).toBe(400);
      expect(response.text).toEqual(
        "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String, email: String}"
      );
    });
    it("should return error 400 that not all 3 body items have been entered correctly", async () => {
      const addbooks2 = {
        quantity: "4",
        email: memberEmail,
        product_id: "books1",
      };

      const response1 = await request(server)
        .post("/cart/add?user_id=6547e31db2320ac36290d802")
        .set("Content-Type", "application/json")
        .send(addbooks2);
      expect(response1.status).toBe(400);
      expect(response1.text).toEqual(
        "Bad Request: Please ensure request body has three keys {quantity: Number, product_id: String, email: String}"
      );
    });
  });

  describe("DELETE /cart/add?user_id=6547e31db2320ac36290d802", () => {
    it("should return the product deleted from the cart", async () => {
      cartRepo.deleteProductFromCart.mockResolvedValueOnce({
        id: "books1",
        name: "Test Book 1",
        price: "$5.00",
      });
      const response = await request(server)
        .delete(
          "/cart/remove?user_id=6547e31db2320ac36290d802&product_id=books1"
        )
        .set("Content-Type", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: "books1",
        name: "Test Book 1",
        price: "$5.00",
      });
    });
    it("should return product never existed in cart", async () => {
      cartRepo.deleteProductFromCart.mockResolvedValueOnce(null);
      const response = await request(server)
        .delete(
          "/cart/remove?user_id=6547e31db2320ac36290d802&product_id=books1"
        )
        .set("Content-Type", "application/json");
      expect(response.status).toBe(404);
      expect(response.text).toEqual(
        "Not Found: Product with ID <books1> not found in current cart"
      );
    });
    it("should return error from invalid query string", async () => {
      cartRepo.deleteProductFromCart.mockResolvedValueOnce({
        id: "books1",
        name: "Test Book 1",
        price: "$5.00",
      });
      const response = await request(server)
        .delete("/cart/remove?user_id=6547e31db2320ac36290d802")
        .set("Content-Type", "application/json");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message:
          "Bad Request: Please Ensure exactly two query params for user_id and product_id are specified",
      });
    });
  });
});
