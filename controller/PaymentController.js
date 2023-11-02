 
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

class PaymentController {

    async getStripePaymentRedirect(req, res){
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [{
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Pi (Test)",
                        },
                        unit_amount: 314,
                    },
                quantity: 1,
                }],
            success_url: "http://localhost:3000",
            cancel_url: "http://localhost:3000"
        });
        res.writeHead(200);
        res.end(JSON.stringify(session));
    }
}



module.exports = new PaymentController();
