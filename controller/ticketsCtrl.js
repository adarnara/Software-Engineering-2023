const Ticket = require("../models/ticketModel");
const mongoose = require('mongoose');

// Helper function to parse JSON from request
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

// Helper function to validate if an ID is a valid MongoDB ObjectId
function isValidObjectId(json) {
    return mongoose.Types.ObjectId.isValid(json.userId);
}

// Controller function to handle ticket creation
async function createTicket(req, res) {
    try {
        if (req.headers["content-type"] !== 'application/json') {
            res.writeHead(415);
            res.end('Unsupported Media Type');
            return;
        }

        let json = await getJSON(req);

        if (!isValidObjectId(json)) {
            res.writeHead(406);
            res.end('Invalid ObjectId');
            return;
        }

        // Create a new ticket
        const newTicket = new Ticket({
            userId: json.userId,
            //productId: json.productId,
            //sellerId: json.sellerId,
            description: json.description,
            // other fields can be added as per the requirement
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
