const Ticket = require('../models/ticketModel.js');

const ticketsRepository = {
  
  async changeStatus(ticketId, newStatus) {
    try {
      const updatedTicket = await Ticket.findByIdAndUpdate(
        ticketId,
        { status: newStatus },
        { new: true }
      );
      return updatedTicket;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  },

  
  async addResolutionDescription(ticketId, resolutionDescription) {
    try {
      const updatedTicket = await Ticket.findByIdAndUpdate(
        ticketId,
        { resolutionDescription: resolutionDescription },
        { new: true }
      );
      return updatedTicket;
    } catch (error) {
      console.error('Error adding resolution description:', error);
      throw error;
    }
  },

  
  async addClosureDate(ticketId, closureDate) {
    try {
      const updatedTicket = await Ticket.findByIdAndUpdate(
        ticketId,
        { closureDate: closureDate },
        { new: true }
      );
      return updatedTicket;
    } catch (error) {
      console.error('Error adding closure date:', error);
      throw error;
    }
  },
};

module.exports = ticketsRepository;