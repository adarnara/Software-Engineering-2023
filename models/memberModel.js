const mongoose = require('mongoose');
const User = require('./users');

const MemberSchema = new mongoose.Schema({
  // TODO: shipping info to be populated during PUT request populated by subgroup1?
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
}

});

const Member = User.discriminator('Member', MemberSchema);


module.exports = Member;