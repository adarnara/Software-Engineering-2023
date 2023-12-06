const { validateToken } = require("../config/jwt");
const Admin = require('../models/adminModel');

async function isAdminAuthenticated(req) {
  try {
      const token = req.headers.authorization?.split(' ')[1];
    
      if (!token) return false;

      const decoded = validateToken(token);
      const admin = await Admin.findById(decoded.id); // Assuming your JWT stores the admin's ID
    
      return admin && admin.role === 'Admin';
  } catch (error) {
      return false;
  }
}

module.exports = {isAdminAuthenticated};