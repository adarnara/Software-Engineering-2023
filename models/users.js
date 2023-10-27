const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const options = { discriminatorKey: 'role' }; // 'role' will indicate what type of user it is

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        index: true
    },
    lastName: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user"  
    }
}, options);

UserSchema.pre('save', async function (next) {
    const saltRounds = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hashSync(this.password, saltRounds);
    next();
});

//login functionality
UserSchema.methods.isPasswordMatched = async function(enteredPassWord){
return await bcrypt.compare(enteredPassWord, this.password)
}

module.exports = mongoose.model('user', UserSchema);