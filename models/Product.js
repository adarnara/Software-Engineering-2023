const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Define your schema fields here, for example:
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
  // ... any other fields ...
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;