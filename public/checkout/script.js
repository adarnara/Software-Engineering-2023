console.log('Script loaded');

// Select the button using querySelector
const button = document.querySelector("button");
console.log(button);

// Add an event listener for the 'click' event
button.addEventListener("click", () => {
  console.log('Button clicked');

  // Perform the fetch operation inside the event listener
  fetch("public/checkout/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        { id: 1, quantity: 3 },
        { id: 2, quantity: 1 },
      ],
    }),
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

