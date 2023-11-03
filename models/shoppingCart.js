const mongoose = require('mongoose');
const cartProduct = require('./cartProduct.js').schema;
const Schema = mongoose.Schema;


const shoppingCartSchema = new Schema({
    // cart Id is autogenerated as _id
    email: {
        type: String,
        required: true
      },
    purchaseTime: {
        type: Number, // epoch time
        default: null
    },
    products: {
        type: [cartProduct]
    },
    numShipped: {
        type: Number,
        default: null
    },
    totalPrice: {
        type: Number,
        default: 0.00
    }
});

module.exports = mongoose.model('shoppingCart', shoppingCartSchema);