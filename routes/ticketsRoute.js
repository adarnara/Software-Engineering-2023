const TicketsController = require("../controller/ticketsCtrl");

module.exports = {
    'POST/submit-form':(request,response) => TicketsController.createTicket(request,response),
    'GET/getFirstOpen':(request,response) => TicketsController.getFirstOpen(request,response),
    'GET/getAllOpen':(request,response) => TicketsController.getAllOpenTickets(request,response),
    'GET/getAllResolved':(request,response) => TicketsController.getAllResolvedTickets(request,response)
};