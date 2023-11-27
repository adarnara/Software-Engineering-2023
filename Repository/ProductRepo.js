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

  async getProductsByCategory(category, page, pageSize) {
    const offset = (page - 1) * pageSize; //calculates how many items should be skipped to get to the current page.
    const products = await Product.find({
      _id: { $regex: new RegExp(category) } //RegExp will filter the products out that don't belong to the right category.
    }).skip(offset).limit(pageSize); //.skip() will skip the amount of products specified by offset.
                                     //.limit() will limit it to only returning a 5 products (or however many should be allowed per page).
    if (!products) {
      throw new Error('No products found');
    }
    return products;
  }

  async getLargestCategoryId(category) {
    const products = await Product.find({
      _id: { $regex: new RegExp(category) } //RegExp will filter the products out that don't belong to the right category.
    })
    if (!products) {
      throw new Error('No products found');
    }
    const largestId = products[products.length]._id;
    console.log(largestId);
    return largestId;
  }

  async create(productData) {
    const newProduct = new Product(productData);
    await newProduct.save();
    return newProduct;
  }
  
  async findByEmail(email){
    return await user.findOne({email})
  }
}

module.exports = new ProductRepository;