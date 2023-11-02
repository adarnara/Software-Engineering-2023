 
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const Product = require('../models/Product');

/*
 * Returns a JSON object from Stripe that redirects to
 * Stripe's payment checkout page which returns back to
 * some desired page.
 */
async function getStripePaymentRedirect(req, res){
    try{
        if(req.headers["content-type"] != "application/json"){
            res.writeHead(415);
            res.end();
        }
        json = getJSON(req);
        if(!isValid(json)){
            res.writeHead(406);
            res.end();
        }
        let items = [{
          price_data: {
            currency: "usd",
            product_data: {
              name: "Pi (Test)",
            },
            unit_amount: 314,
          },
          quantity: 1,
        }];
        // Implement JSON to line_items TODO
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: items, //TODO
            success_url: "http://localhost:3000",
            cancel_url: "http://localhost:3000"
        });
        res.writeHead(200);
        res.end(JSON.stringify(session));
    } catch(err){
        console.log(err);
        res.writeHead(500);
        res.end();
    }
}

module.exports = {getStripePaymentRedirect};


/*
 * Gets the JSON from a http request object
 * If it fails to do so it returns a empty JSON
 */
function getJSON(req){
    const datachunks = [];
    let datastr;
    req.on("data", chunk => {
        datachunks.push(chunk);
    });
    req.on("end", () => {
        datastr = Buffer.concat(datachunks).toString();
    });
    let json;
    let isParsable = true;
    try{
        json = JSON.parse(datastr);
    } catch (err) {
        isParsable = false;
    }
    if(!isParsable)
        return {};
    return json;
}

/*
 * Finds if the JSON fields are valid.
 */ // TODO
function isValid(json){
    return true;
}

