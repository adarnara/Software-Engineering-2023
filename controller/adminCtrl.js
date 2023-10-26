const adminRepo = require('../Repository/adminRepo');
const admin = require('../models/adminModel')
const { generateToken } = require('../config/jwt');

const createAdmin = async (req, res) => {
    const name = req.body.adminName;
    const adminCount = await getAdminCount()
    try {
        const findAdmin = await adminRepo.findByName(name);
        console.log(findAdmin)
        if (!findAdmin) {
            // Create a new admin and save to DB ...( no more than 10 admins)
            if (adminCount>= 10) {
              res.writeHead(409, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'we have reached the maximum number of admins', success: false }));
            }
          const newAdmin = await adminRepo.createAdmin(req.body);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newAdmin));
        } else {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Admin Already exists', success: false }));
        }
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error', success: false }));
    }
};

const Login = async (req, res) =>{
    const adminKey = req.body.adminKey;
    const name = req.body.adminName;
    const findAdmin = await adminRepo.findByName(name)
    console.log(findAdmin)
    console.log(name)
    try{ 
        if(findAdmin && await findAdmin.isAdminKeyMatched(adminKey)){
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            _id: findAdmin?._id,  //'?' is there so our code do not break if those properties are null
            key: findAdmin?.adminKey,
            token: generateToken(findAdmin?._id)
        }));
    } else {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'invalid credentials please try again', success: false }));
    }}catch(error){
        console.log(error);
    }
}

const getAdmins = async (req,res)=>{
  try{
    const getAdmins = await adminRepo.findAllAdmins()
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getAdmins));
}catch(error){
    throw new Error(error)
}
}
const getAdminCount = async () => {
  try {
      const count = await admin.countDocuments({});
      return count;
  } catch (err) {
      throw new Error("Error Counting documents in admin collection");
  }
};
function getPostData(request) {
    return new Promise((resolve, reject) => {
      try {
        let body = '';
        request.on('data', chunk => {
          body += chunk.toString(); 
        });
        request.on('end', () => {
          resolve(body);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  async function adminRegister(request, response) {
    try {
      const postData = await getPostData(request);
      const adminData = JSON.parse(postData);
      const result = await createAdmin({ body: adminData }, response);
    } catch (error) {
      console.log(error)
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
  }
  async function adminLogin(request, response){
    try {
      const postData = await getPostData(request);
      const adminData = JSON.parse(postData);
      const result = await Login({ body: adminData }, response);
    } catch (error) {
      console.log(error)
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
  
  }
  async function allAdmins(request,response){
    try{
      getAdmins(request, response)
    }
    catch(error){
      response.writeHead(500, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ message: 'server error Unable to get all users' }))
    }
  }

module.exports = { adminRegister,adminLogin,allAdmins };