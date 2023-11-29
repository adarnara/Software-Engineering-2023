 
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const ProductRepo = require('../Repository/ProductRepo')
const cartRepo = require('../Repository/cartRepo')
const { URL } = require('url')

/*
 * Is used to enable resilient mode which prevents failure
 * due to slightly invalid JSON objects being used.
 * Disable to throw errors instead.
 */
const resilientMode = true;

/*
 * Returns a JSON object from Stripe that redirects to
 * Stripe's payment checkout page which returns back to
 * some desired page.
 * !!!!!Deperecated!!!!!
 */
async function getStripePaymentRedirect(req, res){
    try{
        if(req.headers["content-type"] != "application/json"){
            res.writeHead(415);
            res.end();
            return;
        }
        let json = await getJSONBody(req);
        if(!isValidJSON(json)){
            res.writeHead(406);
            res.end();
            return;
        }
        let items = await getFormatedStripeJSON(json.products);
        console.log(JSON.stringify(items));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: items,
            automatic_tax: {
                enabled: true,
            },
            success_url: "http://127.0.0.1:5500/views/successfulTransaction.html",
            cancel_url: "http://127.0.0.1:5500/views/shoppingCart.html"
        });
        res.writeHead(200);
        res.end(JSON.stringify(session));
    } catch(err){
        //console.log(err);
        res.writeHead(500);
        res.end();
    }
}

/*
 * Performs the same as getStripePaymentRedirect
 * but now as a get request using the cartid
 * in the url
 */
async function getStripePaymentRedirectdb(req, res){
    try{
        const requrl = new URL(req.url, `http://${req.headers.host}`);
        const cart_id = requrl.searchParams.get("cart_id");
        if(cart_id === null){
            res.writeHead(406);
            res.end();
            return;
        }
        const products = await cartRepo.getProductsFromCart(cart_id)
        if(products.length == 0){
            res.writeHead(404);
            res.end();
            return;
        }
        //console.log(products) // Debug
        let itemsObj = await getFormatedStripeLineItemsJSON(products);
        let shippingRateObj = await getFormatedStripeShippingRateJSON(products);
        //console.log(items); // Debug
        //console.log(shippingrate);
        // If objects are invalid, don't use them
        if(!resilientMode){
            if(!itemsObj.isValid){
                console.log("Database Error: Invalid Shopping Cart");
                res.writeHead(500);
                res.end();
                return;
            }
            if(!shippingRateObj.isValid){
                console.log("Database Error: Invalid Shipping Rates");
                res.writeHead(500);
                res.end();
                return;
            }
        }
        let items = itemsObj.data;
        let shippingRate = shippingRateObj.data;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: items,
            automatic_tax: {
                enabled: true,
            },
            success_url: "http://127.0.0.1:5500/views/shoppingCart.html",
            cancel_url: "http://127.0.0.1:5500/views/shoppingCart.html",
            shipping_options: [{
                shipping_rate_data: shippingRate
            }]
        });
        //console.log(session); // Debug
        res.writeHead(200);
        res.end(JSON.stringify(session));
        console.log("Stripe Session Successfully Made");
    } catch(err){
        console.log(err);
        res.writeHead(500);
        res.end();
    }
}



module.exports = {getStripePaymentRedirect, getStripePaymentRedirectdb};

// HELPER FUNCTIONS

/*
 * Returns a JSON object with fields
 * data - Contains a formatted line items array
 * isValid - Contains boolean if operation was successful
 */
async function getFormatedStripeLineItemsJSON(array){
    let isValid = true;
    // Reformat each item in the array to something Stripe accepts
    let newarray = await Promise.all(array.map(async (item) => {
        const productdata = await ProductRepo.getProductByInternalName(item.product_id, "name price");
        //console.log(productdata); // Debug
        if(!(productdata.doesExist)){
            return undefined;
            isValid = false;
        }
        const cents = strToCents(productdata.data.price);
        if(cents === -1){
            return undefined;
            isValid = false;
        }
        return {
            price_data:{
                currency: "usd",
                product_data:{
                    name: productdata.data.name,
                    tax_code: "txcd_35010000"
                },
                unit_amount: cents,
                tax_behavior: "exclusive"
            },
            quantity: item.quantity
        };
    }));
    let resultarray = [];
    //console.log(newarray); // Debug
    // Remove faulty cart items
    for(let i = 0; i < newarray.length; i++){
        if(!(typeof(newarray[i]) === "undefined"))
            resultarray.push(newarray[i]);
        else
            isValid = false;
    }
    return {
        data: resultarray,
        isValid: isValid
    };
}
/*
 * Returns a JSON object with fields
 * data - Returns shipping rate JSON object for Stripe
 * isValid - Contains boolean if operation was successful
 */
async function getFormatedStripeShippingRateJSON(array){
    let isValid = true
    // Sum up the shipping costs
    let totalshippingCost = array.reduce((acc, cur) => {
        //console.log(cur.shipping_rate) // Debug
        //console.log(typeof(cur))
        if(!(typeof(cur) === "undefined"))
            if(!(cur.shipping_rate === null))
                return acc + strToCents(cur.shipping_rate.amount);
        isValid = false;
        return acc;
    }, 0);
    //console.log(totalshippingCost) // Debug
    return {
        data: {
            display_name: "USPS Shipping Costs",
            type: "fixed_amount",
            fixed_amount: {
                amount: totalshippingCost,
                currency: "usd"
            },
            tax_behavior: "exclusive",
            tax_code: "txcd_92010001"
        },
        isValid: isValid
    };
}
/*
 * Converts the string of the price to the number of cents
 * E.g. String $3.14 turns into 314 or 3.14 turns into 314
 */
function strToCents(str){
    number = -1;
    try{
        if(str.charAt(0) === "$")
            number = Number(str.substring(1).split(".").reduce((acc, cur) => acc.concat(cur), ""));
        else
            number = Number(str.split(".").reduce((acc, cur) => acc.concat(cur), ""));
        // number = parseFloat(str.substring(1)).toFixed(2);
        if(isNaN(number))
            return -1;
        return number;
    } catch(err) {
        console.log(err);
        return -1;
    }
}


/*
 * Gets the JSON from a http request object
 * If it fails to do so it returns a empty JSON
 */
async function getJSONBody(req){
    datastr = await new Promise((resolve, reject) => {
        const datachunks = [];
        let str;
        req.on("data", chunk => {
            //console.log("chunks being recieved")
            datachunks.push(chunk);
        });
        req.on("end", () => {
            str = Buffer.concat(datachunks).toString();
            resolve(str);
        });
    });
    //console.log(datastr)
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
function isValidJSON(json){
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



