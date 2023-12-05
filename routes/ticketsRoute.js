const TicketsController = require("../controller/ticketsCtrl");

module.exports = {
    'POST/submit-form':(request,response) => TicketsController.createTicket(request,response)
};