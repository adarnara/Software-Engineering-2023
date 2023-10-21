const Product = require('../models/Product');

class ProductRepository {
  async getAll() {
    const products = await Product.find({});

    if (!products) {
      throw new Error('No products found');
    }

    return products;
  }

  // ... other CRUD methods specific to products
}

module.exports = new ProductRepository;