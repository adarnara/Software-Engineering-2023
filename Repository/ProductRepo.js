const Product = require('../models/Product');

class ProductRepository {
  async getAll() {
    const products = await Product.find({});

    if (!products) {
      throw new Error('No products found');
    }

    return products;
  }

  async getAllFromSellerEmail(email) {
      const products = await Product.find({"seller_data.email": email});      
      return products;
  }

  async getProductById(id) {
    const product = await Product.find({"category": id})
    if(!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  // Gets the product based on the internal category name
  // Only gets fields specified by the fieldstring
  async getProductByInternalName(intername, fieldstr){
    const product = await Product.findOne({"category": intername}, fieldstr);
    let flag = true
    if(!product){
      flag = false
    }
    return {doesExist: flag, data: product};
  }

  async getProductsByCategory(category, page, pageSize) {
    const offset = (page - 1) * pageSize; //calculates how many items should be skipped to get to the current page.
    const products = await Product.find({
      category: { $regex: new RegExp(category) } //RegExp will filter the products out that don't belong to the right category.
    }).skip(offset).limit(pageSize); //.skip() will skip the amount of products specified by offset.
                                     //.limit() will limit it to only returning a 5 products (or however many should be allowed per page).
    if (!products) {
      throw new Error('No products found');
    }
    return products;
  }

  async getLargestCategoryId(category) {
    const products = await Product.find({
      category: { $regex: new RegExp(category) } //RegExp will filter the products out that don't belong to the right category.
    })
    if (!products) {
      throw new Error('No products found');
    }
    let largestId = 0;
    for(let i = 0; i < products.length; i++){
      const match = products[i].category.match(/\d+/); 
      const id = match ? parseInt(match[0]) : null; 
      if(id > largestId){
        largestId = id;
      }
    }
    return largestId;
  } 

  async create(productData) {
    const newProduct = new Product(productData);
    await newProduct.save();
    return newProduct;
  }

  async delete(productId) {
    try {
        const result = await Product.findByIdAndDelete(productId);
        if (!result) {
            throw new Error('Product not found');
        }
        return { success: true, message: 'Product successfully deleted', deletedProduct: result};
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, message: 'Error deleting product', error: error.message };
    }
  }

  async updateSellerProduct(filter, update){
    try {
      const result = await Product.updateOne(filter,update);
      if (!result) {
        throw new Error('Product not updated correctly');
      }
        return { success: true, message: 'Product successfully updated', deletedProduct: result};
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, message: 'Error updating product', error: error.message };
    }
  }

  
  async findByEmail(email){
    return await user.findOne({email})
  }
}

module.exports = new ProductRepository;
