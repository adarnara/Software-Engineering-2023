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
    console.log('called getProductById()')

    const product = await Product.findById(id)

    if(!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async getProductsByCategory(category) {
    const products = await Product.find({});
    if (!products) {
      throw new Error('No products found');
    }
    return products.filter(product => product._id.includes(category));
  }
  // ... other CRUD methods specific to products
}

module.exports = new ProductRepository;