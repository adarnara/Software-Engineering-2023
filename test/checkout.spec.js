const request = require('supertest');
const server = require('../server.js');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const client = request(server);
const urlPrefix = '/';

jest.mock('stripe', () => {
  return () => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: '6542e4986a75960d68dd0ba2',
        }),
      },
    },
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  await new Promise(resolve => server.close(resolve));
});
  
describe('Create checkout session', () => {
  it('should create a checkout session', async () => {
    const res = await client.post(`${urlPrefix}checkout`)
      .send({
        "_id":"6542e4986a75960d68dd0ba2","email":"johndoes@gmail.com","purchaseTime":null,"numShipped":null,"products":[{"parent_cart":"6542e4986a75960d68dd0ba2","product_id":"books9","quantity":6,"from":null,"to":null,"date_shipped":null,"date_arrival":null,"shipping_id":null,"_id":"6543dac070f00ad572f83f92","__v":0}],"__v":0,"totalPrice":47.94
      });
    
    expect(res.status).toEqual(200);
    expect(res.text).toEqual("{\"id\":\"6542e4986a75960d68dd0ba2\"}");
    expect(res.ok).toEqual(true);
  });
});

describe('Create checkout session', () => {
  it('should create a failed checkout session', async () => {
    const res = await client.post(`${urlPrefix}checkout`)
      .send({
        "_id":"6542e4986a75960d68dd0ba2","purchaseTime":null,"numShipped":null,"products":[{"parent_cart":"6542e4986a75960d68dd0ba2","quantity":6,"from":null,"to":null,"date_shipped":null,"date_arrival":null,"shipping_id":null,"_id":"6543dac070f00ad572f83f92","__v":0}],"__v":0,"totalPrice":47.94
      });
    expect(res.status).toEqual(500);
    expect(res.ok).toEqual(false);
  });
});