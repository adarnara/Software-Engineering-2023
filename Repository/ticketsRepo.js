/**
 * Functions:
 * 
 * getFirstOpenTicket() -> This function will return the ticket with the oldest creation date and with an Open Status.
 * 
 * getFirstInProgessTicket() -> This will return a ticket with the oldest creation date and with "In Progress" status
 * 
 * getFirstOpenId() -> This will return the ID of the oldest ticket with "Open" status. It returns null if no ticket is found
 * 
 * getFirstInProgressId() -> This will return the ID of the oldest ticket with "In progress" Status. It returns null if no ticket is found
 * 
 * getAllOpenTickets() -> Returns an array of all tickets with "Open" status.
 * 
 * getAllInProgessTickets() -> Returns an array of all tickets with "In Progress" status
 * 
 * getAllResolvedTickets() -> Returns an array of all tickets with "Resolved" status
 * 
 * changeStatus(ticketId, newStatus) -> Can change the status of a ticket. Possible status('Open", "In Progress", "Resolved")
 * 
 * resolution(ticketId, resolutionDescription, closureDate) -> This will change the status of the ticket to "Resolved", admin can add a resolution comment and date
 * 
 * */


const Ticket = require('../models/ticketModel.js');
class ticketsRepository{

  async createTicket(userId, description){
    try{
      const newTicket = new Ticket({
          userId: userId,
          description: description,
      });
      await newTicket.save();
      return newTicket; 
    }
    catch(error){
      console.error("Error creating a ticket: ", error);
      throw error; 
    }
    
  }

  //This function will return the ticket with the oldest creation date and with an Open Status.
  async getFirstOpenTicket(){
    try{
      const ticket = await Ticket.findOne({
        status: {$in: ["Open"]}
      })
      .sort({createdDate:1})
      .exec();

      return ticket;
    }
    catch(error){
      console.error("Error fetching first 'Open' Ticket: ", error);
      throw error;
    }
  }

  //This will return a ticket with the oldest creation date and with "In Progress" status
  async getFirstInProgessTicket() {
    try {
      const ticket = await Ticket.findOne({
        status: {$in: ["In Progress"]}
      })
      .sort({createdDate: 1})
      .exec();

      return ticket;
    }
    catch(error) {
      console.error("Error fetching first 'In Progress' Ticket: ", error);
      throw error;
    }
  }
  
  //This will return the ID of the oldest ticket with "Open" status. It returns null if no ticket is found
  async getFirstOpenId() {
    try {
        const ticket = await Ticket.findOne({ status: "Open" })
            .sort({ createdDate: 1 })
            .exec();

        return ticket ? ticket._id : null;
    } catch (error) {
        console.error("Error fetching the oldest open ticket:", error);
        throw error;
    }
}

  //This will return the ID of the oldest ticket with "In progress" Status. It returns null if no ticket is found
async getFirstInProgessId() {
  try {
      const ticket = await Ticket.findOne({ status: "In Progress" })
          .sort({ createdDate: 1 })
          .exec();

      return ticket ? ticket._id : null;
  } catch (error) {
      console.error("Error fetching the oldest in-progress ticket:", error);
      throw error;
  }
}

//gets all tickets with "Open status"
async getAllOpenTickets() {
  try {
      const tickets = await Ticket.find({ status: "Open" }).exec();
      return tickets; 
  } catch (error) {
      console.error("Error fetching open tickets:", error);
      throw error;
  }
}

//gets all tickets with "In Progess" status
async getAllInProgressTickets() {
  try {
      const tickets = await Ticket.find({ status: "In Progress" }).exec();
      return tickets; 
  } catch (error) {
      console.error("Error fetching in-progress tickets:", error);
      throw error;
  }
}

//gets all tickets with "Resolved" status
async getAllResolvedTickets() {
  try {
      const tickets = await Ticket.find({ status: "Resolved" }).exec();
      return tickets;
  } catch (error) {
      console.error("Error fetching closed tickets:", error);
      throw error; 
  }
}

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
}

async resolution(ticketId, resolutionDescription) {
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { 
        resolutionDescription: resolutionDescription,
        closureDate: Date.now, //check if this is working
        status: "Resolved"
      },
      { new: true }
    );
    return updatedTicket;
  } catch (error) {
    console.error('Error adding resolution: ', error);
    throw error;
  }
}

};

module.exports = new ticketsRepository();