const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
    createdDate: { type: Date, default: Date.now },
    resolutionDescription: String,
    closureDate: Date
});

module.exports = mongoose.model('Ticket', ticketSchema);
