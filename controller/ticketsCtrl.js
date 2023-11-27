const Ticket = require("../models/ticketModel");
const mongoose = require('mongoose');
const middleware = require('../middlewares/authmiddleware.js');

async function getJSON(req) {
    return new Promise((resolve, reject) => {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                resolve(JSON.parse(body));
            });
        } catch (error) {
            reject(error);
        }
    });
}


async function createTicket(req, res) {
    try {
        if (req.headers["content-type"] !== 'application/json') {
            res.writeHead(415);
            res.end('Unsupported Media Type');
            return;
        }

        let json = await getJSON(req);
        const userData = middleware.parseJwtHeader(req);
        const userID = userData.id;

        // Create a new ticket
        const newTicket = new Ticket({
            userId: userID,
            description: json.description,
        });

        await newTicket.save();

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTicket));

    } catch (error) {
        console.error(error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
}

module.exports = { createTicket };
