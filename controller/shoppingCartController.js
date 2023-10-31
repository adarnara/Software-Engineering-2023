const mongoose = require('mongoose');
const shoppingCart = require('../models/shoppingCart');
const connectDB = require('../config/db');


connectDB();

// const cartwheel = new shoppingCart({ userId: 3842982409, });

const cartwheel = new shoppingCart({
    // cart Id is autogenerated as _id?

    userId: 3842982409,
    purchaseTime: null,
    products: [{productId: 123, quantity: 2, from: null, to: null, startShipping: null, endShipping: null, shippingID: null}],
    numShipped: null
});

console.log(cartwheel);

cartwheel.save();