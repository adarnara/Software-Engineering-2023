const memberRepo = require('../Repository/memberRepo');
const { generateToken } = require('../config/jwt');
const member = require('../models/memberModel')
const createMember = async (req, res) => {
    const email = req.body.email;
    try {
        const findMember = await memberRepo.findByEmail(email);
        if (!findMember) {
            // Create a new user and save to db
            const newMember = await memberRepo.create(req.body);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newMember));
        } else {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Email already in use', success: false }));
        }
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error', success: false }));
    }
};

const memberLogin = async (req, res) =>{
    const {email, password} = req.body;
    const findMember = await memberRepo.findByEmail(email)
    try{ 
        if(findMember && await findMember.isPasswordMatched(password)){
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            _id: findMember?._id,  //'?' is there so our code do not break if those properties are null
            name: findMember?.name,
            email: findMember?.email,
            token: generateToken(findMember?._id)
        }));
    } else {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'invalid credentials please try again', success: false }));
    }}catch(error){
        console.log(error);
    }
}

module.exports = { createMember,memberLogin };