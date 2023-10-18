const Member = require('../models/memberModel');

class MemberRepository {
    async findByEmail(email) {
        return await Member.findOne({ email });
    }

    async create(memberData) {
        return await Member.create(memberData);
    }
}

module.exports = new MemberRepository();