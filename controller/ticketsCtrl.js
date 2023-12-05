const Ticket = require("../models/ticketModel");
const mongoose = require('mongoose');
const middleware = require('../middlewares/authmiddleware.js');
const ticketsRepository = require('../Repository/ticketsRepo.js');
const { parseJwtHeader } = require("../middlewares/authmiddleware");


async function getJSON(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', error => {
            reject(error);
        });
    });
}

async function createTicket(req, res) {
    try {
        if (req.headers["content-type"] !== 'application/json') {
            res.writeHead(415).end('Unsupported Media Type');
            return;
        }
  
        let json = await getJSON(req);
        const userData = middleware.parseJwtHeader(req);
        if (!userData || !userData.id) {
            res.writeHead(401).end('Unauthorized');
            return;
        }
  
        const newTicket = await ticketsRepository.createTicket(userData.id, json.description);
        res.writeHead(201, { 'Content-Type': 'application/json' }).end(JSON.stringify(newTicket));
  
    } catch (error) {
        console.error(error);
        res.writeHead(500).end('Internal Server Error');
    }
  }

  async function getFirstOpen(req,res){
    try {
        let userData = parseJwtHeader(req, res);
    // We continue handling if the JWT was valid.
    if (userData) {
        
        // Set some properties to return.
        userData["firstName"] = user["firstName"];
        userData["lastName"] = user["lastName"];
        userData["email"] = user["email"];
        userData["role"] = user["role"];
    }
        const firstOpenTicket = await ticketsRepository.getFirstOpenTicket();
        let user = await userRepo.findUserById(firstOpenTicket.userId);
        console.log(user);
        //firstOpenTicket.userData = userData;
        res.writeHead(201, { 'Content-Type': 'application/json' }).end(JSON.stringify(firstOpenTicket));
  
    } catch (error) {
        console.error(error);
        res.writeHead(500).end('Internal Server Error');
    }

  }

  module.exports ={
    createTicket:createTicket,
    getFirstOpen:getFirstOpen
};