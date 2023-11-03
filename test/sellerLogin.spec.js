const mongoose = require('mongoose');
const request = require('supertest');
const server = require('../server');

jest.mock('../Repository/userRepo.js', () => {
  return {
    findSellerByEmail: jest.fn().mockImplementation((email) => {
      if (email === 'test@example.com') {
        return Promise.resolve({
          isPasswordMatched: jest.fn().mockResolvedValue(true),
        });
      }
      return Promise.resolve(null);
    }),
    findAllUser:jest.fn()
  };
});

jest.mock('../models/sellerModel', () => {
  return {
    findOne: jest.fn().mockImplementation(() => ({
      isPasswordMatched: jest.fn().mockResolvedValue(true),
    })),
  }
});

const bcrypt = require('bcrypt');
jest.mock('bcrypt');

const seller = require('../models/sellerModel');
const userRepo = require('../Repository/userRepo');
mongoose.connect = jest.fn();
mongoose.connection = {
  close: jest.fn(),
};

describe('seller Login API', () => {
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

  describe('POST tests for seller login and login functionality ', () => {
    it('should return 201 and a token if the credentials are correct', async () => {
      //creating a seller
      const user = {
        firstName: 'testing',
        lastName: 'test',
        email: 'test@example.com',
        password: 'correctPassword',
      };
      seller.findOne.mockResolvedValueOnce(user); //mocking seller model
      bcrypt.compare.mockResolvedValueOnce(true);
      const response = await request(server)
        .post('/seller/login')
        .set('Content-Type', 'application/json')
        .send(user);

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
    });

    it('should return 401 if the email is incorrect', async () => {
      const user = {
        firstName: 'testing',
        lastName: 'test',
        email: 'wrongemail@example.com',
        password: 'password123',
      };
      seller.findOne.mockResolvedValueOnce(null);

      const response = await request(server)
        .post('/seller/login')
        .set('Content-Type', 'application/json')
        .send(user);

      expect(response.status).toBe(401);
    });

    it('should return 401 if the password is incorrect', async () => {
      const user = {
        firstName: 'testing',
        lastName: 'test',
        email: 'wrongemail@example.com',
        password: 'wrongpassword123',
      };
      seller.findOne.mockResolvedValueOnce(user);
      const response = await request(server)
        .post('/seller/login')
        .send(user);

      expect(response.status).toBe(401);
    });
  });
  describe('GET method to get all users api via route /users', () => {
    it('should return a list of admins in the database', async () => {
      const mockUsers = [
        { firstName: "user1", lastName: "user1lastName",email:"user1@email.com", password: "password23" },
        { firstName: "user1", lastName: "user2lastName",email:"user2@email.com", password: "password234" }
      ];
      
      userRepo.findAllUser.mockResolvedValueOnce(mockUsers);
  
      const response = await request(server)
        .get('/users') // Adjusted the route to match the GET request
        .set("Content-Type", "application/json");
  
      expect(response.status).toBe(201); // Status code for successful GET request
      expect(response.body).toEqual(mockUsers);
    }, 10000);
  });
});
