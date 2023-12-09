const Ticket = require("../models/ticketModel");
const mongoose = require('mongoose');
const middleware = require('../middlewares/authmiddleware.js');
const ticketsRepository = require('../Repository/ticketsRepo.js');
const userRepo = require("../Repository/userRepo.js");
const { isAdminAuthenticated } = require('../middlewares/adminAuth');


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
    const isAuthenticated = await isAdminAuthenticated(req);
        if (!isAuthenticated) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Unauthorized' }));
            return;
        }
    try {
        const firstOpenTicket = await ticketsRepository.getFirstOpenTicket();
        if (firstOpenTicket == null){
            res.writeHead(201, { 'Content-Type': 'application/json' }).end(JSON.stringify({ message: "No tickets." }));
        }
        else{
            let user = await userRepo.findUserById(firstOpenTicket.userId);
            const ticketObject = firstOpenTicket.toObject();
            ticketObject.userData = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            };
            res.writeHead(201, { 'Content-Type': 'application/json' }).end(JSON.stringify(ticketObject));
        }
    } catch (error) {
        console.error(error);
        res.writeHead(500).end('Internal Server Error');
    }
  }
  
  async function getAllOpenTickets(req, res) {
    const isAuthenticated = await isAdminAuthenticated(req);
        if (!isAuthenticated) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Unauthorized' }));
            return;
        }
    try {
        const allOpenTickets = await ticketsRepository.getAllOpenTickets();
        if (allOpenTickets == null){
            res.writeHead(201, { 'Content-Type': 'application/json' }).end(JSON.stringify({ message: "No tickets." }));
        }
        else{
            const formattedTickets = [];

            for (const ticket of allOpenTickets) {
                let user = await userRepo.findUserById(ticket.userId);
                const ticketObject = ticket.toObject();
                ticketObject.userData = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                };
                formattedTickets.push(ticketObject);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(formattedTickets));
        }
    } catch (error) {
        console.error("Error getting all open tickets: ", error);
        res.writeHead(500).end("Internal Server Error");
    }
    }

    async function getAllResolvedTickets(req, res) {
        const isAuthenticated = await isAdminAuthenticated(req);
        if (!isAuthenticated) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Unauthorized' }));
            return;
        }
        try {
            const allResolvedTickets = await ticketsRepository.getAllResolvedTickets();
            const formattedTickets = [];
    
            for (const ticket of allResolvedTickets) {
                let user = await userRepo.findUserById(ticket.userId);
                const ticketObject = ticket.toObject();
                ticketObject.userData = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                };
                formattedTickets.push(ticketObject);
            }
    
            res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(formattedTickets));
        } catch (error) {
            console.error("Error getting all open tickets: ", error);
            res.writeHead(500).end("Internal Server Error");
        }
    }

    async function resolution(req, res) {
        const isAuthenticated = await isAdminAuthenticated(req);
        if (!isAuthenticated) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Unauthorized' }));
            return;
        }
        try {
            if (req.headers["content-type"] !== 'application/json') {
                res.writeHead(415).end('Unsupported Media Type');
                return;
            }
            let json = await getJSON(req);
            let resolutionDescription = json.resolution;
            const { id } = req.params;
            console.log("Ticket id: ",id);
            await ticketsRepository.resolution(id, resolutionDescription);
            res.writeHead(201, { 'Content-Type': 'application/json' }).end("Ticket resolved successfully.");
        } catch (error) {
            console.error("Error in resolution of a ticket: ", error);
            res.writeHead(500).end("Internal Server Error");
        }
    }
    

  module.exports ={
    createTicket:createTicket,
    getFirstOpen:getFirstOpen,
    getAllOpenTickets:getAllOpenTickets,
    getAllResolvedTickets:getAllResolvedTickets,
    resolution:resolution
};