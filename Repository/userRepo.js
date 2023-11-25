const member = require('../models/memberModel');
const seller = require('../models/sellerModel');
const user = require('../models/users');

class UserRepository {
    async findMemberByEmail(email) {
        return await member.findOne({ email });
    }

    async findSellerByEmail(email) {
        return await seller.findOne({ email });
    }

    async createMember(memberData) {
        return await member.create(memberData);
    }

    async createSeller(sellerData) {
        return await seller.create(sellerData);
    }

    async createUser(userData) {
        return await user.create(userData);
    }

    async findByEmail(email) {
        return await user.findOne({ email });
    }

    async findAllUser() {
        return await user.find();
    }

    async updateById(id, body) {
        console.log('Updating user with ID:', id);
        console.log('Received update data:', body);
        return await user.findByIdAndUpdate(id, body, { new: true });
    }

    async deleteUser(id) {
        return await user.findByIdAndDelete(id);
    }

    async findUserById(id) {
        return await user.findById(id);
    }
    async updateProfile(userId, updateData) {
        console.log('Updating user profile with ID:', userId);
        console.log('Received update data:', updateData);

        const existingUser = await user.findById(userId);
        if (!existingUser) {
            throw new Error('User not found');
        }

        let updatedUser;

        if (existingUser.role === 'Member') {
            updatedUser = await member.findByIdAndUpdate(userId, updateData, { new: true });
        } else if (existingUser.role === 'Seller') {
            updatedUser = await seller.findByIdAndUpdate(userId, updateData, { new: true });
        } else {
            updatedUser = await user.findByIdAndUpdate(userId, updateData, { new: true });
        }

        return updatedUser;
    }
}

module.exports = new UserRepository();
