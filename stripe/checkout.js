const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Item 1" }],
  [2, { priceInCents: 20000, name: "Item 2" }],
]);

async function createCheckoutSession(items) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: items.map(item => {
      const storeItem = storeItems.get(item.id);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: storeItem.name,
          },
          unit_amount: storeItem.priceInCents,
        },
        quantity: item.quantity,
      };
    }),
    success_url: `public/checkout/success.html`,
    cancel_url: `public/checkout/cancel.html`,
  });

  return session;
}

module.exports = { createCheckoutSession };
