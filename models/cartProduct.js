const mongoose = require('mongoose');

// const newProduct = new cartProduct({
//     parent_cart: 
//     product_id: product_id,
//     quantity: quantity,

//     shipping_status: null,
//     from: null,
//     to: null,
//     date_shipped: null,
//     date_arrival: null,
//     shipping_id: null
// });


const cartProductSchema = new Schema({
    parent_cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shoppingCart'
    },
    product_id: String,
    quantity: quantity,
    from: String,
    to: String,
    date_shipped: Date,
    date_arrival: Date,
    shipping_id: Number
});

module.exports = mongoose.model('cartProduct', cartProductSchema);