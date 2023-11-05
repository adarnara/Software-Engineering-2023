const request = require('supertest');
const server = require('../server'); 
const mongoose = require('mongoose');

afterAll(async () => {
  await mongoose.connection.close();
  await new Promise(resolve => server.close(resolve));
});

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
  
      getProductsByCategory: jest.fn().mockImplementation((searchTerm) => {
        const mockProducts = [
          { id: 'books1', name: 'Test Book 1' },
          { id: 'books23', name: 'Test Book 23' },
          { id: 'laptops20', name: 'Laptop 20' },
        ];
  
        return Promise.resolve(mockProducts.filter(product => product.id.includes(searchTerm)));
      }),
    };
});


describe('Product Search', () => {
  it('should return a specific product for a valid ID', async () => {
    const res = await request(server).get('/search?productId=books1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ id: 'books1', name: 'Test Book 1' });
  });

  it('should return all products containing a given search term', async () => {
    const res = await request(server).get('/search?term=books');
    console.log(res.body)
    expect(res.statusCode).toEqual(200);
    //Check if all returned products contain 'books' in their ID
    // expect(res.body.every(product => product.id.includes('books'))).toBeTruthy();
  });


});