/* creating user schema for when a user signs up  */
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');

// Declare the Schema of the Mongo model
const MemberSchema = new mongoose.Schema({
    firstName:{
      type:String,
      required:true,
      index:true,
    },
    lastName:{
      type:String,
      required:true,
      index:true,
  },
    email:{
      type:String,
      required:true,
      unique:true,
    },
    password:{
      type:String,
      required:true,
    },
    role: {
      type:String,
      default: "member"
    },
    //shipping info to be populated during PUT request 
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
MemberSchema.pre('save', async function (next) {
  const saltRounds= await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hashSync(this.password,saltRounds)
});

//login functionality
MemberSchema.methods.isPasswordMatched = async function(enteredPassWord){
  return await bcrypt.compare(enteredPassWord, this.password)
}
//Export the model
module.exports = mongoose.model('Member', MemberSchema);