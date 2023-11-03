console.log('Script loaded');

// Select the button using querySelector
const button = document.querySelector("button");
console.log(button);

// Add an event listener for the 'click' event
button.addEventListener("click", () => {
  console.log('Button clicked');

  // Perform the fetch operation inside the event listener
  fetch("http://localhost:3000/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({"_id":"6542e4986a75960d68dd0ba2","email":"johndoes@gmail.com","purchaseTime":null,"numShipped":null,"products":[{"parent_cart":"6542e4986a75960d68dd0ba2","product_id":"books9","quantity":6,"from":null,"to":null,"date_shipped":null,"date_arrival":null,"shipping_id":null,"_id":"6543dac070f00ad572f83f92","__v":0}],"__v":0,"totalPrice":47.94}),
  })
  .then(res => {
    // Check if the response is ok (status in the range 200-299)
    if (res.ok) return res.json();
    // If not ok, reject the promise with the error reason
    return res.json().then(json => Promise.reject(json));
  })
  .then(({ url }) => {
    // Redirect to the URL from the response
    window.location = url;
  })
  .catch(e => {
    // Log the error to the console
    console.error('Error:', e);
  });
});

