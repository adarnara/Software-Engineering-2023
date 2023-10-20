const admin = require('../models/adminModel');

class adminRepository {
    async findByName(adminName) {
    return await admin.findOne({ adminName });
    }
    async createAdmin(adminData) {
        return await admin.create(adminData);
    }
}

module.exports = new adminRepository();