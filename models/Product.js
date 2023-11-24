const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: String,
  dimensions: [Number],
});

const productSchema = new mongoose.Schema({
  _id: String,
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  stars: String,
  rating_count: String,
  feature_bullets: [String],
  images: [
    {
      hiRes: String,
      thumb: String,
      large: String,
      main: [imageSchema],
      variant: String,
      lowRes: String,
      shoppableScene: String,
    },
  ],
  variant_data: [String],

});



const Product = mongoose.model('Product', productSchema);

Product.createWithCustomId = function (id, productData, callback) {
  const customProductData = { _id: id, ...productData };
  return this.create(customProductData, callback);
};

module.exports = Product;

