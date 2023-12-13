const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const ProductRepo = require('../Repository/ProductRepo')
const cartRepo = require('../Repository/cartRepo')
const { parseJwtHeader } = require("../middlewares/authmiddleware.js");
const { URL } = require('url')

/*
 * Is used to enable resilient mode which prevents failure
 * due to slightly invalid JSON objects being used.
 * Disable to throw errors instead.
 */
const resilientMode = true;

// Determines if we care about the JWT Authorization
const forceJWTAuth = false;

// Port number for the redirects in case live server is using different port
const redirectPort = 5500;

/*
 * Returns a JSON object from Stripe that redirects to
 * Stripe's payment checkout page which returns back to
 * some desired page.
 * !!!!!Deperecated!!!!!
 * I cannot guaranteed that this will not fail in a strange way
 * I also cannot secure this function by its nature
 */
async function getStripePaymentRedirect(req, res){
    try{
        if(forceJWTAuth){
            const auth = isAuthorized(req, res);
            if(auth.hasFailed)
                return;
        }
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
        let itemsObj = await getFormatedStripeLineItemsJSON(json.products);
        let shippingRateObj = await getFormatedStripeShippingRateJSON(json.products);
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
            success_url: `http://127.0.0.1:${redirectPort}/views/successfulTransaction.html`,
            cancel_url: `http://127.0.0.1:${redirectPort}/views/shoppingCart.html`,
            shipping_options: [{
                shipping_rate_data: shippingRate
            }]
        });
        res.writeHead(200);
        res.end(JSON.stringify(session));
    } catch(err){
        console.log("Critical Failure : ");
        console.log(err);
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
        if(forceJWTAuth){
            const auth = isAuthorized(req, res);
            if(auth.hasFailed)
                return;
        }
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
            success_url: `http://127.0.0.1:${redirectPort}/views/successfulTransaction.html`,
            cancel_url: `http://127.0.0.1:${redirectPort}/views/shoppingCart.html`,
            shipping_options: [{
                shipping_rate_data: shippingRate
            }]
        });
        //console.log(session); // Debug
        res.writeHead(200);
        res.end(JSON.stringify(session));
        console.log("Stripe Session Successfully Made");
    } catch(err){
        console.log("Critical Failure : ");
        console.log(err);
        res.writeHead(500);
        res.end();
    }
}

module.exports = {getStripePaymentRedirect, getStripePaymentRedirectdb};

// HELPER FUNCTIONS

/**
 * Gets a JSON object containing a formatted array of products that
 * Stripe can interperate and use to make a list of products being
 * bought and calculate the tax based on that.
 * @param array - input array of JSON objects of each cart product
 *                from the repository
 * @returns {object} with the fields
 * data [array] - Contains a formatted line items array
 * isValid boolean - Contains boolean if operation was successful
 */
async function getFormatedStripeLineItemsJSON(array) {
    let isValid = true;
    // Reformat each item in the array to something Stripe accepts
    let newarray = await Promise.all(array.map(async (item) => {
        const productdata = await ProductRepo.getProductByInternalName(item.product_id, "name price");
        if (!(productdata.doesExist)){
            return undefined;
        }
        const cents = strToCents(productdata.data.price);
        if (cents === -1){
            return undefined;
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
/**
 * Gets a formatted JSON object that contains a JSON object that
 * can be fed to Stripe to factor in shipping costs.
 *
 * @param array - input array of JSON objects of each cart product
 *                from the repository
 * @returns {object} with the fields
 * data {object} - Returns shipping rate JSON object for Stripe
 * isValid boolean - Contains boolean if operation was successful
 */
async function getFormatedStripeShippingRateJSON(array){
    let isValid = true
    // Sum up the shipping costs
    let totalshippingCost = array.reduce((acc, cur) => {
        if(!(typeof(cur) === "undefined"))
            if(!(cur.shipping_rate === null))
                return acc + strToCents(cur.shipping_rate.amount);
        isValid = false;
        return acc;
    }, 0);
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
/**
 * Converts the string of the price to the number of cents
 * E.g. String $3.14 turns into 314 or 3.14 turns into 314
 *
 * @param str String - Input price string to convert to
 *                     integer number of cents
 * @returns Integer - Number of cents the input represented
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


/**
 * Calls the JWT authenication middleware to determines
 * if we should accept the request or not.
 *
 * @param req {object} - Request object of the http call
 * @param res {object} - Response object of the http call
 * @returns {object} with fields
 * hasFailed boolean - Tells if the authentication failed
 * obj {object} - Holds the result object from parseJwtHeader
 */
function isAuthorized(req, res){
    const authResult = parseJwtHeader(req, res);
    return {
        hasFailed: (authResult === null),
        obj: authResult
    };
}

/**
 * Gets the JSON from a http request object
 * If it fails to do so it returns a empty JSON
 *
 * @param req {object} - Request object from the http POST request
 * @returns {object} - Returns a JSON object that is either
 * Empty if the JSON object is unusable
 * A populated JSON object if a JSON object could be made from
 * the POST method's body.
 */
async function getJSONBody(req){
    datastr = await new Promise((resolve, reject) => {
        const datachunks = [];
        let str;
        req.on("data", chunk => {
            datachunks.push(chunk);
        });
        req.on("end", () => {
            str = Buffer.concat(datachunks).toString();
            resolve(str);
        });
    });
    try {
        return JSON.parse(datastr);
    } catch (err) {
        return {}
    }
}

/**
 * Finds if the JSON fields are valid.
 */
function isValidJSON(json){
    // TODO add more exceptions
    if(json.products === undefined){
        return false;
    }
    return true;
}

// REFERENCE DATA

// Expected array of JSONs Stripe needs
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
