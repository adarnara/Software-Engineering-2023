const mongoose = require('mongoose');
const User = require('./users');

const MemberSchema = new mongoose.Schema({
  // TODO: shipping info to be populated during PUT/PATCH methods to populate request populated by subgroup1?
  cart:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cart'
  }],
  shippingInfo: {
    address: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    state: {
      type: String,
      default: null
    },
    zipCode:{
      type:String,
      default:null
    }  
  },
wishList :[{
  type: mongoose.Schema.ObjectId,
  ref: 'Product'
}],
orders:[{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'order'
  }],
});



const Member = User.discriminator('Member', MemberSchema);


module.exports = Member;