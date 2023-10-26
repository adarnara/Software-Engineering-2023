const userRepo = require('../Repository/userRepo');
const { generateToken } = require('../config/jwt');
const url = require('url');
const createUser = async (path,req, res) => { // passs path as argument parame...
    const email = req.body.email;
    console.log(path)
    try {
        if(path === '/member/register'){
            const findUser = await userRepo.findMemberByEmail(email);
            if (!findUser) {
                // Create a new user and save to db
                const newUser = await userRepo.createMember(req.body);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newUser));
            } else {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Email already in use', success: false }));
            }
        } else if(path==='/seller/register'){
            const findUser = await userRepo.findSellerByEmail(email);
            if (!findUser) {
                // Create a new user and save to db
                const newUser = await userRepo.createSeller(req.body);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newUser));
            } else {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Email already in use', success: false }));
            }
        }else {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'unable to save user', success: false }));
        }

    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'a member cannot register as a seller, please use a different email', success: false }));
    }
};

const memberLogin = async (req, res) =>{
    const {email, password} = req.body;
    const findUser = await userRepo.findMemberByEmail(email)
    try{ 
        if(findUser && await findUser.isPasswordMatched(password)){
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            _id: findUser?._id,  //'?' is there so our code do not break if those properties are null
            name: findUser?.name,
            email: findUser?.email,
            token: generateToken(findUser?._id)
        }));
    } else {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'invalid credentials please try again', success: false }));
    }}catch(error){
        console.log(error);
    }
}
const sellerLogin = async (req, res) =>{
    const {email, password} = req.body;
    const findUser = await userRepo.findSellerByEmail(email)
    try{ 
        if(findUser && await findUser.isPasswordMatched(password)){
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            _id: findUser?._id,  //'?' is there so our code do not break if those properties are null
            name: findUser?.name,
            email: findUser?.email,
            token: generateToken(findUser?._id)
        }));
    } else {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'invalid credentials please try again', success: false }));
    }}catch(error){
        console.log(error);
    }
}


const getAllUsers = async(req,res) =>{
    try{
        const getUsers = await userRepo.findAllUser()
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getUsers));
    }catch(error){
        throw new Error(error)
    }
}

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
  
  async function register(path,request, response) {
    try {
      const postData = await getPostData(request);
      const userData = JSON.parse(postData);
      const result = await createUser(path,{ body: userData }, response);
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
  }
  async function login(path,request, response){
    try {
      const postData = await getPostData(request);
      const userData = JSON.parse(postData);
      if(path === '/member/login'){
        const result = await memberLogin({ body: userData }, response);
      }
      else if ( path === '/seller/login'){
        const result = await sellerLogin({ body: userData }, response);
      }
    } catch (error) {
      console.log(error)
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
  
  }
  async function allUsers(request,response){
      try{
        getAllUsers(request, response)
      }
      catch(error){
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'server error Unable to get all users' }))
      }
  }
module.exports = { login,register,allUsers };