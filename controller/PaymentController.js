 
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
            return;
        }
        let json = await getJSON(req);
        if(!isValid(json)){
            res.writeHead(406);
            res.end();
            return;
        }
        let items = await getFormatedStripeJSON(json.products);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: items,
            success_url: "http://localhost:3000",
            cancel_url: "http://localhost:3000"
        });
        res.writeHead(200);
        res.end(JSON.stringify(session));
    } catch(err){
        //console.log(err);
        res.writeHead(500);
        res.end();
    }
}

module.exports = {getStripePaymentRedirect};

// HELPER FUNCTIONS

/*
 * Returns a list of JSON objects for Stripe API
 */
async function getFormatedStripeJSON(array){
    let newarray = await Promise.all(array.map(async (item) => {
        const productdata = await Product.findOne({"_id": item.product_id}, "name price");
        console.log(productdata);
        if(productdata.name === undefined || productdata.price === undefined)
            return undefined;
        const cents = strToCents(productdata.price);
        if(cents === -1)
            return undefined;
        return {
            price_data:{
                currency: "usd",
                product_data:{
                    name: productdata.name
                },
                unit_amount: cents,
            },
            quantity: item.quantity
        };
    }));
    let resultarray = [];
    for(let i = 0; i < newarray.length; i++){
        if(!(newarray[i] === undefined))
            resultarray.push(newarray[i]);
    }
    return resultarray;
}

/*
 * Converts the string of the price to the number of cents
 * E.g. String $3.14 turns into 314
 */
function strToCents(str){
    number = -1;
    try{
        number = Number(str.substring(1).split(".").reduce((acc, cur) => acc.concat(cur), ""));
        if(isNaN(number))
            return -1;
        return number;
    } catch(err) {
        //console.log(err);
        return -1;
    }
}


/*
 * Gets the JSON from a http request object
 * If it fails to do so it returns a empty JSON
 */
async function getJSON(req){
    datastr = await new Promise((resolve, reject) => {
        const datachunks = [];
        let str;
        req.on("data", chunk => {
            console.log("chunks being recieved")
            datachunks.push(chunk);
        });
        req.on("end", () => {
            str = Buffer.concat(datachunks).toString();
            resolve(str);
        });
    });
    console.log(datastr)
    let json;
    let isParsable = true;
    try{
        json = JSON.parse(datastr);
    } catch (err) {
        //console.log(err)
        isParsable = false;
    }
    if(!isParsable)
        return {};
    return json;
}

/*
 * Finds if the JSON fields are valid.
 */ //TODO add more exceptions
function isValid(json){
    if(json.products === undefined){
        return false;
    }
    return true;
}


//REFERENCE DATA

//Expected JSONs
/*
Example expected line_items
[{
    price_data: {
        currency: "usd",
        product_data: {
            name: "Pi (Test)",
        },
        unit_amount: 314,
    },
    quantity: 1,
}];
*/

/*
Sample Expected input JSON
Curr Member Cart:  {"_id":"6542e4986a75960d68dd0ba2","email":"johndoes@gmail.com","purchaseTime":null,"numShipped":null,"products":[{"parent_cart":"6542e4986a75960d68dd0ba2","product_id":"books9","quantity":6,"from":null,"to":null,"date_shipped":null,"date_arrival":null,"shipping_id":null,"_id":"6543dac070f00ad572f83f92","__v":0}],"__v":0,"totalPrice":47.94}
Status: 200
Request Complete
*/



