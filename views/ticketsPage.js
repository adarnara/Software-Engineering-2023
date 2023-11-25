document.getElementById('Tickets').addEventListener('submit', async function(event){
    event.preventDefault();

    var userInput = document.getElementById('userInput').value;

    fetch('http://localhost:3000/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: 'myemail@gmail.com', text: userInput}),
    })
    .then(response => response.json())
    .then(console.log('Ticket has been posted.'))
    .catch((error) => console.log("Error: ", error));
});