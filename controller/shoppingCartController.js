const mongoose = require('mongoose');
const shoppingCart = require('../models/shoppingCart');
const connectDB = require('../config/db');


connectDB();

const cartwheel = new shoppingCart({ userId: 3842982409 });

console.log(cartwheel.userId)

cartwheel.save();