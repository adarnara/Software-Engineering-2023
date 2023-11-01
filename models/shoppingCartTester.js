const mongoose = require('mongoose');
const shoppingCartCollection = require("../models/shoppingCart");
const cartProductCollection = require("../models/cartProduct");
const connectDB = require('../config/db')
const userRepo = require('../Repository/userRepo');
const cartRepo = require('../Repository/cartRepo')

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

// const testShoppingCart = new shoppingCartCollection(
//     {
//         email: "johndoes23@gmail.com", 
//         purchaseTime: Date.now()
//     }
// )

// console.log(testShoppingCart);
// testShoppingCart.save();

// const testCartProduct1 = new cartProductCollection(
//     {
//         product_id: 1239,
//         quantity: 2
//     }
// )

// console.log(testCartProduct1);
// testCartProduct1.save()



// cartRepo.getUserCurrentCart("johndoes23@gmail.com").then((res) => console.log(res))

cartRepo.createEmptyCart("johndoes23@gmail.com").then((res) => console.log(res))

// cartRepo.getUserCartHistory("johndoes23@gmail.com").then((res) => console.log(res))
