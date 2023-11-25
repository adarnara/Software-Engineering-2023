const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const options = { discriminatorKey: 'role' };

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
    },
    address: {
        address1: {
            type: String,
            default: null
        },
        address2: {
            type: String,
            default: null
        },
        address3: {
            type: String,
            default: null
        },
        state: {
            type: String,
            default: null
        },
        postalCode: {
            type: String,
            default: null
        }
    },
    phoneNumber: {
        type: String,
        default: null
    },
    dateOfBirth: {
        type: String,
        default: null
    },
    profileImage: {
        type: String,
        default: null
    }

}, {
    timestamps: true
}, options);

UserSchema.pre('save', async function (next) {
    const saltRounds = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hashSync(this.password, saltRounds);
    next();
});

UserSchema.methods.isPasswordMatched = async function (enteredPassWord) {
    return await bcrypt.compare(enteredPassWord, this.password);
};

module.exports = mongoose.model('user', UserSchema);
