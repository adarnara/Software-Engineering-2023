const mongoose = require('mongoose');
const request = require('supertest');
const server = require('../../server');
const productRepo = require('../../Repository/ProductRepo.js');
const ProductController = require('../../controller/ProductController');


jest.mock('../../Repository/ProductRepo.js',()=>({
  shuffle: jest.fn(),
  getRandomItems: jest.fn(),
  getAll:jest.fn()
}));

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
describe('GET method to test "/" route for landing page ', () => {
  it('should return a list of products', async () => {
    //mocking a list of products 
    const mockProducts = [
      {
        "_id":
        "books1",
        "name":
        "Everything You Need to Ace Computer Science and Coding in One Big Fat …",
        "price":
        "$10.99",
        "stars":
        "4.8 out of 5 stars",
        "rating_count": "",
        
        "feature_bullets": [],
        
        "images":[],
        
        "variant_data":[]
      }
    ];
    
    productRepo.getAll.mockResolvedValueOnce(mockProducts);

    const response = await request(server)
      .get('/') // Adjusted the route to match the GET request
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200); // Status code for successful GET request
    expect(response.body).toEqual(mockProducts);
  }, 10000);
});