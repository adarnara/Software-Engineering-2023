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

const userLogin = async (req, res) =>{
    const {email, password} = req.body;
    const findUser = await userRepo.findByEmail(email)
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

module.exports = { createUser, userLogin };