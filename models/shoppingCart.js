const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shoppingCartSchema = new Schema({
    // cart Id is autogenerated as _id?

    userId: {
        type: Number, // replace with user object?
        required: true
    },
    purchaseTime: {
        type: Date
    },
    products: {
        type: [{productId: Number, quantity: Number}]
    }
});

module.exports = mongoose.model('shoppingCart', shoppingCartSchema);