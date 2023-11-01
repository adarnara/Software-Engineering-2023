const Product = require('../models/Product');

class ProductRepository {
  async getAll() {
    const products = await Product.find({});

    if (!products) {
      throw new Error('No products found');
    }

    return products;
  }

  async getProductById(id) {
    const product = await Product.findById(id)

    if(!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async getProductsByCategory(category, page = 1, pageSize = 5) {
    const offset = (page - 1) * pageSize;
    const products = await Product.find({
      _id: { $regex: new RegExp(category) }
    }).skip(offset).limit(pageSize);
  
    if (!products) {
      throw new Error('No products found');
    }
  
    return products;
  }
  // ... other CRUD methods specific to products
}

module.exports = new ProductRepository;