console.log('Script loaded');

// Select the button using querySelector
const button = document.querySelector("button");
console.log(button);

// Add an event listener for the 'click' event
button.addEventListener("click", async () => {
  console.log('Button clicked');

  // Get the correct body using cart fetch APIs
  await fetch(`http://localhost:3000/cart?user_id=6545a86825de71eac175dfc7`)
    .then(async responseGET => {
      console.log("inside responseGET");
      responseGET = await responseGET.json();
      console.log(responseGET);
      // Perform the fetch operation inside the event listener
      fetch("http://localhost:3000/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({"_id":responseGET._id,"email":responseGET.email,"purchaseTime":responseGET.purchaseTime,"numShipped":responseGET.numShipped,"products":responseGET.products,"__v":responseGET.__v,"totalPrice":responseGET.totalPrice}),
      })
      .then(res => {
        // Check if the response is ok (status in the range 200-299)
        if (res.ok) return res.json();
        // If not ok, reject the promise with the error reason
        return res.json().then(json => Promise.reject(json));
      })
      .then(({ url }) => {
        // Redirect to the URL from the response
        // handle fixing shopping carts
        console.log("URL:");
        console.log(url);
        window.location.href = url;
      })
      .catch(e => {
        // Log the error to the console
        console.error('Error:', e);
      });
    });
});

