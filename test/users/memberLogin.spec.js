const mongoose = require('mongoose');
const request = require('supertest');
const server = require('../../server');

jest.mock('../../Repository/userRepo.js', () => {
  return {
    findMemberByEmail: jest.fn().mockImplementation((email) => {
      if (email === 'test@example.com') {
        return Promise.resolve({
          isPasswordMatched: jest.fn().mockResolvedValue(true),
        });
      }
      return Promise.resolve(null);
    }),
  };
});

jest.mock('../../models/memberModel', () => {
  return {
    findOne: jest.fn().mockImplementation(() => ({
      isPasswordMatched: jest.fn().mockResolvedValue(true),
    })),
  };
});
const bcrypt = require('bcrypt');
jest.mock('bcrypt');

const member = require('../../models/memberModel');
mongoose.connect = jest.fn();
mongoose.connection = {
  close: jest.fn(),
};

describe('member Login API', () => {
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
  
  describe('POST tests for member login and login functionality ', () => {
    it('should return 201 and a token if the credentials are correct', async () => {
      //creating a user
      const user = {
        firstName:"testing",
        lastName:"test",
        email: 'test@example.com',
        password: 'correctPassword',
      };
      member.findOne.mockResolvedValueOnce(user); //mocking member model
      bcrypt.compare.mockResolvedValueOnce(true);
      const response = await request(server)
        .post('/member/login') 
        .set ("Content-Type", "application/json")
        .send(user);

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
    });

    it('should return 401 if the email is incorrect', async () => {
      const user = {
        firstName:"testing",
        lastName:"test",
        email: 'wrongemail@example.com',
        password: 'password123',
      };
      member.findOne.mockResolvedValueOnce(null);
     

      const response = await request(server)
        .post('/member/login')
        .set ("Content-Type", "application/json")
        .send(user);

      expect(response.status).toBe(401);
    });

    it('should return 401 if the password is incorrect', async () => {
      const user = {
        firstName:"testing",
        lastName:"test",
        email: 'wrongemail@example.com',
        password: 'wrongpassword123',
      };
      member.findOne.mockResolvedValueOnce(user);
      const response = await request(server)
        .post('/member/login')
        .send(user);

      expect(response.status).toBe(401);
    });
  });
});
