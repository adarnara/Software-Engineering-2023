const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: String,
  dimensions: [Number],
});

const productSchema = new mongoose.Schema({

  _id: mongoose.Schema.Types.ObjectId, // Use ObjectId for _id
  category:{
    type:String,
    required: true,
  },

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
  seller_data: {
    company: String,
    bio: String,
    website: String,
    phone: String,
    email: String,
    firstName: String,
    lastName: String,
    warehouse_address: [{

      street1: String,
      street2: String,
      street3: String,
      city: String,
      state: String,
      zip: String,
      country: String,      

    }],
  },
  length: String,
  width: String,
  height: String,
  distance_unit: String,
  weight: String,
  mass_unit: String,
});

const Product = mongoose.model('Product', productSchema);

Product.createWithCustomId = function (id, productData, callback) {
  const customProductData = { ...productData }; // Remove _id assignment here
  customProductData._id = mongoose.Types.ObjectId(id); // Assign ObjectId here
  return this.create(customProductData, callback);
};

module.exports = Product;
