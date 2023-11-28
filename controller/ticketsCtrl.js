const Ticket = require("../models/ticketModel");
const mongoose = require('mongoose');
const middleware = require('../middlewares/authmiddleware.js');

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

        const newTicket = new Ticket({
            userId: userData.id,
            description: json.description,
        });

        await newTicket.save();
        res.writeHead(201, { 'Content-Type': 'application/json' }).end(JSON.stringify(newTicket));

    } catch (error) {
        console.error(error);
        res.writeHead(500).end('Internal Server Error');
    }
}

module.exports = { createTicket };