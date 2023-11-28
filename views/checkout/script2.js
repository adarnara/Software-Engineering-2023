console.log('Script loaded');

// Select the button using querySelector
const button = document.querySelector("button");
console.log(button);

// Add an event listener for the 'click' event
button.addEventListener("click", async () => {
  console.log('Button clicked');
  // Get the correct body using cart fetch APIs
  await fetch(`http://localhost:3000/checkout2?cart_id=655507a609c2c717999c80cb`)
    .then(async responseGET => {
      console.log("Doing GET Request");
      responseGET = await responseGET.json();
      console.log(responseGET);
      window.location.href = responseGET.url;
    }).catch(e => {
        // Log the error to the console
        console.error('Error:', e);
    });
});

