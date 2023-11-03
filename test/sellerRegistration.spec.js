const mongoose = require('mongoose');
const request = require('supertest');
const server = require('../server');
const userRepo = require('../Repository/userRepo');

jest.mock('../Repository/userRepo', () => ({
  findSellerByEmail: jest.fn(),
  createSeller: jest.fn()
}));

mongoose.connect = jest.fn();
mongoose.connection = {
  close: jest.fn()
};

describe('test for seller  Registration API', () => {
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

  describe('POST method for seller registration via route  /seller/register', () => {
    it('should register a new member successfully', async () => {
      const newUser = {
        firstName: "New",
        lastName: "Seller",
        email: 'newseller@email.com',
        password: 'newsellerpassword'
      };

      userRepo.findSellerByEmail.mockResolvedValueOnce(null);
      userRepo.createSeller.mockResolvedValueOnce(newUser);

      const response = await request(server)
        .post('/seller/register')
        .set ("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newUser);
    });

    it('should return 409 if the email is already in use', async () => {
      // creating mock of mongoose data 
      const existingUser = {
        firstName: "Existing",
        lastName: "seller",
        email: 'existinguser@example.com',
        password: 'password3'
      };

      userRepo.findSellerByEmail.mockResolvedValueOnce(existingUser);

      const response = await request(server)
        .post('/seller/register')
        .set ("Content-Type", "application/json")
        .send(existingUser);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: 'Email already in use', success: false });
    });
  });
});