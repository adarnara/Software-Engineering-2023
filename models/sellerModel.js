const mongoose = require('mongoose');
const User = require('./users');

const sellerSchema = mongoose.Schema({
  //none of these fields are required... also to put populated when doing Seller implementation most likely PUT requests
  pendingOrders: [{
    type: mongoose.Schema.Types.ObjectId, // signifies that the type is a currently existing model[] means its an array
    ref: 'Transaction'
  }],
  fulfilledOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  refundRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  currentListings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductList'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  ratingStars: {
    type: Number,
    default: 0.0
  },
  ratings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  }],
  ratingCount: {
    type: Number,
    default: 0
  },
  website:{
    type: String,
    default: null
  },
  Bio:{
    type: String,
    default: ""
  },
  Company:{
    type: String,
    default: null
  }
});

const Seller = User.discriminator('Seller', sellerSchema);


module.exports = Seller;