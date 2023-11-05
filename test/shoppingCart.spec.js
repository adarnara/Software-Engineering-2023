const mongoose = require('mongoose');
const request = require('supertest');
const server = require('../server');
const cartRepo = require('../Repository/cartRepo');



// const userRepo = require('../../Repository/userRepo');
// const productRepo = require('../../Repository/ProductRepo');

jest.mock('../Repository/cartRepo', () => ({
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


jest.mock('../Repository/ProductRepo', () => {
    return {
      getProductById: jest.fn().mockImplementation((id) => {
        // Assuming mock data array for demonstration
        const mockProducts = [
          { id: 'books1', name: 'Test Book 1' },
          { id: 'books23', name: 'Test Book 23' },
          { id: 'laptops20', name: 'Laptop 20' },
        ];
        
        return Promise.resolve(mockProducts.find(product => product.id === id));
      }),
  
    };
});


mongoose.connect = jest.fn();
mongoose.connection = {
  close: jest.fn()
};

describe('Accessing user current cart', () => {
  beforeAll(async () => {
    await mongoose.connect.mockImplementationOnce(() => Promise.resolve());
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await new Promise(resolve => server.close(resolve));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const memberEmail = "cartTest@gmail.com";

  const mockedUser = {
    _id: "123",
    email: "cartTest@gmail.com"
  };

  cartRepo.getMember.mockResolvedValue(mockedUser);

  describe('GET /cart?user_id=123', () => {
    it('should return an empty cart for the current user', async () => {
      
      const response = await request(server)
        .get('/cart?user_id=123')
        .set ("Content-Type", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });
  });
});