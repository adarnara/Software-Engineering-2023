const admin = require('../models/adminModel');

class adminRepository {
    async findByName(adminName) {
    return await admin.findOne({ adminName });
    }
    async createAdmin(adminData) {
        return await admin.create(adminData);
    }
    async findAllAdmins(){
      return await admin.find();
    }
}

module.exports = new adminRepository();