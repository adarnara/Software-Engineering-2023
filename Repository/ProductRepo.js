const Product = require('../models/Product');

class ProductRepository {
  async getAll() {
    try {
      const products = await Product.find({});
      if (!products) {
        throw new Error('No products found');
      }
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }


  // ... other CRUD methods specific to products
}

module.exports = new ProductRepository; // Export the class itself