const Product = require('../models/Product');

class ProductRepository {
  async getAll() {
    return Product.find({});
  }

  async getById(id) {
    return Product.findById(id);
  }

  // ... other CRUD methods specific to products
}

module.exports = new ProductRepository();