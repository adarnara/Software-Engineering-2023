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

// --------------------------------------------------------------------------------------------------------------------

// const mongoose = require('mongoose');
// const Product = require('../models/Product');

// require('dotenv').config({ path: '../.env' });

// const mongoURI = process.env.MONGO_URI;

// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Product.find({})
//     .then((products) => {
//         console.log('Data retrieved from MongoDB:');
//         console.log(products);

//         mongoose.connection.close();
//     })
//     .catch((err) => {
//         console.error('Error querying data:', err);
//         mongoose.connection.close();
//     });


connectDB();


const testShoppingCart = new shoppingCartCollection(
    {
        email: "johndoes23@gmail.com", 
        purchaseTime: Date.now()
    }
)

// console.log(testShoppingCart);
testShoppingCart.save();




cartProductCollection.find({})
    .then((cartProducts) => {
        console.log('Data retrieved from MongoDB: ');
        console.log(cartProducts);

        mongoose.connection.close();
    })
    .catch((err) => {
        console.error('Error querying data: ' + err);
        mongoose.connection.close();
    });

// const testCartProduct1 = new cartProductCollection(
//     {
//         product_id: 1239,
//         quantity: 2
//     }
// )

// console.log(testCartProduct1);
// testCartProduct1.save()



// cartRepo.getUserCurrentCart("johndoes23@gmail.com").then((res) => console.log(res))

// cartRepo.createEmptyCart("johndoes23@gmail.com").then((res) => console.log(res))

// cartRepo.getUserCartHistory("johndoes23@gmail.com").then((res) => console.log(res))
