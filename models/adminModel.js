const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const AdminSchema = new mongoose.Schema({
    adminName: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    adminKey: {
        type: String,
        required: true,
        unique: true // no two same admin keys
    },
    role: {
        type: String,
        default: "Admin"  
    }
});

AdminSchema.pre('save', async function (next) {
    const saltRounds = await bcrypt.genSaltSync(10);
    this.adminKey = await bcrypt.hashSync(this.adminKey, saltRounds);
    next();
});

//Admin login functionality
AdminSchema.methods.isAdminKeyMatched = async function(enteredKey){
return await bcrypt.compare(enteredKey, this.adminKey)
}

module.exports = mongoose.model('admin', AdminSchema);