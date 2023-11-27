const TicketsController = require("../controller/ticketsCtrl");

module.exports = {
    'POST/submit-form': TicketsController.createTicket
};