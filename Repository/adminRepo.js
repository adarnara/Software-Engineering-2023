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
    //find admin by id
    async findAdminById(id){
      return await admin.findById(id);
    }
}

module.exports = new adminRepository();