const mongoose = require('mongoose');
const request = require('supertest');
const server = require('../server.js');
const ProductController = require('../controller/ProductController.js');

jest.mock('../controller/ProductController.js', () => ({
    getExactProduct: jest.fn(),
    getProductsByCategory: jest.fn()
  }));;

mongoose.connect = jest.fn();
mongoose.connection = {
  close: jest.fn()
};

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

describe('GET /search route', () => {
    it('should return product data when a product is found', async () => {
      const mockProduct = {
        _id: '123',
        name: 'Test Product',
        price: '$9.99',
        stars: '5 out of 5 stars',
        rating_count: '100',
        feature_bullets: [],
        images: [],
        variant_data: [],
      };
  
      ProductController.getExactProduct.mockImplementationOnce((req, res) => res.status(200).json(mockProduct));
  
      const response = await request(server)
        .get('/search?query=Test Product')
        .set("Content-Type", "application/json");
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });
  
    it('should return an error when no product is found', async () => {
      const errorMessage = { message: 'Product not found' };
  
      ProductController.getExactProduct.mockImplementationOnce((req, res) => res.status(404).json(errorMessage));
  
      const response = await request(server)
        .get('/search?query=Nonexistent Product')
        .set("Content-Type", "application/json");
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual(errorMessage);
    });
  });
  
  describe('GET /search/category route', () => {
    it('should return a list of products for a valid category', async () => {
      const mockProducts = [
        { _id: 'book1', name: 'Book One', price: '$9.99',},
        { _id: 'book2', name: 'Book Two', price: '$12.99'},
      ];
  
      ProductController.getProductsByCategory.mockImplementationOnce((req, res) => res.status(200).json(mockProducts));
  
      const response = await request(server)
        .get('/search/category?name=Books')
        .set("Content-Type", "application/json");
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
    });
  
    it('should return an error when no products are found for a category', async () => {
      const errorMessage = { message: 'No products found in this category' };
  
      ProductController.getProductsByCategory.mockImplementationOnce((req, res) => res.status(404).json(errorMessage));
  
      const response = await request(server)
        .get('/search/category?name=Nonexistent Category')
        .set("Content-Type", "application/json");
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual(errorMessage);
    });
  });