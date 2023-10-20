const member = require('../models/memberModel');
const seller = require('../models/sellerModel');
const user = require('../models/users')

class UserRepository {
    async findMemberByEmail(email) {
        return await member.findOne({ email });
    }
    async findSellerByEmail(email){
        return await seller.findOne({email});
    }

    async createMember(memberData) {
        return await member.create(memberData);
    }
    async createSeller(sellerData) {
        return await seller.create(sellerData);
    }
    async findByEmail(email){
        return await user.findOne({email})
    }
}

module.exports = new UserRepository();