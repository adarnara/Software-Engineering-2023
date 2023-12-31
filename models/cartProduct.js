const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        ref: 'shoppingCart',
        required: true
    },
    product_id: String,
    quantity: {
        type: Number,
        default: 1
    },
    shipping_rate: {
        type: Object,
        default: null
    },
    from: {type: Object, default: null},
    to: {type: Object, default: null},
    transaction: {
        type: Object,
        default: null
    }
});

module.exports = mongoose.model('cartProduct', cartProductSchema);