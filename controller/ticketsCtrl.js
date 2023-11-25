const Ticket = require("../models/ticketModel");

async function getTicketsRedirect(req, res){
    try{
        if(req.headers["Content-Type"] != 'application/json'){
            res.writeHead(415);
            res.end();
            return;
        }
        let json = await getJSON(req);
        if(!isValidObjectId(json)){
            res.writeHead(406);
            res.end();
            return;
        }
        //Here it should write to the database.
    }
    catch(error){
        res.writeHead(500);
        res.end;
    };
}