const mongoose = require('mongoose');
const shoppingCartCollection = require("../models/shoppingCart");
const cartProductCollection = require("../models/cartProduct");
const connectDB = require('../config/db')
const userRepo = require('../Repository/userRepo');
const cartRepo = require('../Repository/cartRepo')
const shoppingCartController = require('../controller/shoppingCartController');


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


// const testShoppingCart = new shoppingCartCollection(
//     {
//         email: "johndoes23@gmail.com", 
//         purchaseTime: Date.now()
//     }
// )

// // console.log(testShoppingCart);
// testShoppingCart.save();




// cartProductCollection.find({})
//     .then((cartProducts) => {
//         console.log('Data retrieved from MongoDB: ');
//         console.log(cartProducts);

//         mongoose.connection.close();
//     })
//     .catch((err) => {
//         console.error('Error querying data: ' + err);
//         mongoose.connection.close();
//     });

// const testCartProduct1 = new cartProductCollection(
//     {
//         product_id: 1239,
//         quantity: 2
//     }
// )

// console.log(testCartProduct1);
// testCartProduct1.save()



// const currentCart = cartRepo.getUserCurrentCart("johndoes23@gmail.com").then((res) => console.log(res))
// console.log(currentCart)

// fetch("localhost")

const url = `http://localhost:3000/cart/add`
// const request = {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body:
//         JSON.stringify(
//             {
//                 quantity: 1,
//                 product_id: '1232131',
//                 email: "johndoes23@gmail.com"
//             }
//         )
// };
// let user = "johndoes23@gmail.com";

// fetch(url, request).then(res => console.log("fetch: ",  res)).then(data => console.log("fetch: ",  data));
// cartRepo.addProductToCart("johndoes23@gmail.com", 11111, 69).then(res => console.log(res))
cartRepo.createEmptyCart("johndoes@gmail.com").then((res) => console.log(res))
// cartRepo.getUserCartHistory("johndoes23@gmail.com").then((res) => console.log(res))
// cartRepo.getProductsFromUser("johndoes23@gmail.com").then(res => console.log(res));

// shoppingCartController.addProductToCart("johndoes23@gmail.com", 11111, 69).then(res => console.log(res));

// cartRepo.getUserCartHistory(user)
//     .then(
//         // returns an array of cart objects
//         res => {
//             console.log(res[0]._id);

//             cartRepo.getProductsFromCartObject(res[0]).then(res => console.log(res));
//         }
//     )


// cartRepo.changeProductQuantity(user, 123124, 1337).then(res => console.log(res))


// cartRepo.removeProductFromCart(user, 888888).then(res => console.log(res))