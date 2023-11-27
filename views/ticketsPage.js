//const authorization = require("../public/js/util.js")

document.getElementById('Tickets').addEventListener('submit', async function(event){
    event.preventDefault();

    var userInput = document.getElementById('userInput').value;

    var userId = 'userId';
    authorize('http://localhost:3000/submit-form', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ description: userInput }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Ticket has been posted:', data);
        // Here you can handle what happens after a successful submission
    })
    .catch((error) => {
        console.error("Error: ", error);
    });
});
