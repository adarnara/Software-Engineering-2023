const mongoose = require('mongoose');
const request = require('supertest');
const server = require('../../server');
const adminRepo = require('../../Repository/adminRepo');
const adminCtrl = require('../../controller/adminCtrl');

// Mock the specific function in that module
adminCtrl.getAdminCount = jest.fn();
 

jest.mock('../../Repository/adminRepo',()=>({
  findByName: jest.fn(),
  createAdmin: jest.fn(),
  findAllAdmins: jest.fn(),
  getAdminCount: jest.fn()
}));


mongoose.connect = jest.fn();
mongoose.connection = {
  close: jest.fn()
};

describe('test for admin APIs', () => {

  jest.mock('../../controller/adminCtrl',()=>({
    getAdminCount: jest.fn(),
    adminRegister: jest.fn()
  }));
  jest.mock('../../models/adminModel', () => {
    return {
      countDocuments: jest.fn()
    };
  });
  
  adminCtrl.getAdminCount = jest.fn();
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
  const admin = require('../../models/adminModel');
  describe('POST method for admin registration via route  /admin/register', () => {
    it('should register a new admin successfully', async () => {
      const newAdmin = {
        adminName: "newAdmin",
        adminKey: "1234565",
      };

      adminRepo.findByName.mockResolvedValueOnce(null);
      adminRepo.createAdmin.mockResolvedValueOnce(newAdmin);
      admin.countDocuments.mockResolvedValueOnce(5)
      

      const response = await request(server)
        .post('/admin/register')
        .set ("Content-Type", "application/json")
        .send(newAdmin);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newAdmin);
    },10000); // 

    it('should return 409 if the email is already in use', async () => {
      // creating mock of mongoose data 
      const existingAdmin = {
        adminName:"testAdmin",
        adminKey: '12345',
      };

      adminRepo.findByName.mockResolvedValueOnce(existingAdmin);

      const response = await request(server)
        .post('/admin/register')
        .set ("Content-Type", "application/json")
        .send(existingAdmin);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: 'Admin Already exists', success: false });
    });
  });
  describe('GET method to test admin api via route /admins', () => {
    it('should return a list of admins in the database', async () => {
      //mocking a list of admins
      const mockAdmins = [
        { adminName: "admin1", adminKey: "key1" },
        { adminName: "admin2", adminKey: "key2" }
      ];
      
      adminRepo.findAllAdmins.mockResolvedValueOnce(mockAdmins);
  
      const response = await request(server)
        .get('/admins') // Adjusted the route to match the GET request
        .set("Content-Type", "application/json");
  
      expect(response.status).toBe(201); // Status code for successful GET request
      expect(response.body).toEqual(mockAdmins);
    }, 10000);
  });
});