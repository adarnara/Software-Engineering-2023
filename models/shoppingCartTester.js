const mongoose = require('mongoose');
const shoppingCartCollection = require("../models/shoppingCart");
const cartProductCollection = require("../models/cartProduct");
const connectDB = require('../config/db')


// const cartProductSchema = new Schema({
//     parent_cart: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'shoppingCart'
//     },
//     product_id: String,
//     quantity: quantity,
//     from: String,
//     to: String,
//     date_shipped: Date,
//     date_arrival: Date,
//     shipping_id: Number
// });

connectDB();

const testShoppingCart = new shoppingCartCollection(
    {
        email: "johndoes23@gmail.com"
    }
)

console.log(testShoppingCart);
testShoppingCart.save();

// const testCartProduct1 = new cartProductCollection(
//     {
//         product_id: 1239,
//         quantity: 2
//     }
// )

// console.log(testCartProduct1);
// testCartProduct1.save()






