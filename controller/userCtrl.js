const userRepo = require('../Repository/userRepo');
const { generateToken } = require('../config/jwt');
const { parseJwtHeader } = require("../middlewares/authmiddleware");
const url = require('url');
const fs = require('fs');

const createUser = async (path, req, res) => {
    const email = req.body.email;
    console.log(path);
    try {
        if (path === '/member/register') {
            const findSeller = await userRepo.findSellerByEmail(email);
            if (findSeller) {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'A seller cannot register as a member, please use a different email', success: false }));
                return;
            }
            const findMember = await userRepo.findMemberByEmail(email);
            if (!findMember) {
                const newUser = await userRepo.createMember(req.body);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newUser));
            } else {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Email already in use by a member', success: false }));

            }
        } else if (path === '/seller/register') {
            const findMember = await userRepo.findMemberByEmail(email);
            if (findMember) {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'A member cannot register as a seller, please use a different email', success: false }));
                return;
            }
            const findSeller = await userRepo.findSellerByEmail(email);
            if (!findSeller) {
                const newUser = await userRepo.createSeller(req.body);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newUser));
            } else {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Email already in use by a seller', success: false }));
            }
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid registration path', success: false }));
        }
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'An error occurred during registration', success: false }));
    }
};


const memberLogin = async (req, res) => {
    const { email, password } = req.body;
    const findUser = await userRepo.findMemberByEmail(email)
    try {
        if (findUser && await findUser.isPasswordMatched(password)) {
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                _id: findUser?._id,  //'?' is there so our code do not break if those properties are null
                name: findUser?.name,
                email: findUser?.email,
                token: generateToken(findUser?._id)
            }));
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'invalid credentials please try again', success: false }));
        }
    } catch (error) {
        console.log(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal server error', success: false }));
    }
}
const sellerLogin = async (req, res) => {
    const { email, password } = req.body;
    const findUser = await userRepo.findSellerByEmail(email)
    try {
        if (findUser && await findUser.isPasswordMatched(password)) {
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                _id: findUser?._id,  //'?' is there so our code do not break if those properties are null
                name: findUser?.name,
                email: findUser?.email,
                token: generateToken(findUser?._id)
            }));
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'invalid credentials please try again', success: false }));
        }
    } catch (error) {
        console.log(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal server error', success: false }));
    }
}


const getAllUsers = async (req, res) => {
    try {
        const getUsers = await userRepo.findAllUser()
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getUsers));
    } catch (error) {
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

async function register(path, request, response) {
    try {
        const postData = await getPostData(request);
        const userData = JSON.parse(postData);


        let reqData = {
            body: userData,
        };

        // TODO: sellers should also have an address?
        // Handle address: should always be true with new form
        if (userData.address) {
            reqData.body.shippingInfo = {
                address: userData.address,
            };
            delete userData.address;
        }

        const result = await createUser(path, reqData, response);

    } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Internal Server Error' }));
        console.error(error);
    }
}
async function login(path, request, response) {
    try {
        const postData = await getPostData(request);
        const userData = JSON.parse(postData);
        if (path === '/member/login') {
            const result = await memberLogin({ body: userData }, response);
        }
        else if (path === '/seller/login') {
            const result = await sellerLogin({ body: userData }, response);
        }
    } catch (error) {
        console.log(error)
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Internal Server Error' }));
    }

}
async function allUsers(request, response) {
    try {
        getAllUsers(request, response)
    }
    catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'server error Unable to get all users' }))
    }
}

const updateUser = async (request, response) => {
    const { id } = request.params
    const putData = await getPostData(request);
    const userUpdateData = JSON.parse(putData);
    try {
        const updatedUser = await userRepo.updateById(id, userUpdateData)
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(updatedUser))
    } catch (error) {
        console.error('Update Error:', error);
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'server error Unable to update user' }))
    }
};

async function removeUser(request, response) {
    const { id } = request.params;
    console.log(id)
    console.log("hello")
    try {
        const user = await userRepo.findUserById(id);
        if (!user) {
            response.writeHead(404, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({ message: 'User not found' }));
        } else {
            await userRepo.deleteUser(id);
            response.writeHead(200, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({ message: `User with id: ${id} removed` }));
        }
    } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'server error Unable to delete user' }));
    }
}

const getAUser = async (request, response) => {
    const { id } = request.params;
    try {
        const user = await userRepo.findUserById(id);
        if (!user) {
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'User not found' }));
        } else {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(user));
        }
    } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Server error Unable to get user' }));
    }
};


/**
 * Current approach is to put the token in a header
 */
async function getUserByToken(request, response) {
    let userData = parseJwtHeader(request, response);
    // We continue handling if the JWT was valid.
    if (userData) {
        let user = await userRepo.findUserById(userData["id"]);
        // Set some properties to return.
        userData["firstName"] = user["firstName"];
        userData["lastName"] = user["lastName"];
        userData["email"] = user["email"];
        userData["role"] = user["role"];
        // probably should send member/seller/admin information as well
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(userData));
    }
}


module.exports = { login, register, allUsers, updateUser, getAUser, removeUser, getUserByToken };

