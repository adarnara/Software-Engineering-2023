const mongoose = require('mongoose');
const request = require('supertest');
const server = require('../server');
const userRepo = require('../Repository/userRepo');

jest.mock('../Repository/userRepo', () => ({
  findMemberByEmail: jest.fn(),
  createMember: jest.fn()
}));

mongoose.connect = jest.fn();
mongoose.connection = {
  close: jest.fn()
};

describe('Member Registration API', () => {
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

  describe('POST /member/register', () => {
    it('should register a new member successfully', async () => {
      const newUser = {
        firstName: "New",
        lastName: "User",
        email: 'newuser@email.com',
        password: 'newuserpassword'
      };

      userRepo.findMemberByEmail.mockResolvedValueOnce(null);
      userRepo.createMember.mockResolvedValueOnce(newUser);

      const response = await request(server)
        .post('/member/register')
        .set ("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newUser);
    });

    it('should return 409 if the email is already in use', async () => {
      // creating mock of mongoose data 
      const existingUser = {
        firstName: "Existing",
        lastName: "User",
        email: 'existinguser@example.com',
        password: 'password123'
      };

      userRepo.findMemberByEmail.mockResolvedValueOnce(existingUser);

      const response = await request(server)
        .post('/member/register')
        .set ("Content-Type", "application/json")
        .send(existingUser);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: 'Email already in use', success: false });
    });
  });
});