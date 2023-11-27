document.getElementById('Tickets').addEventListener('submit', async function(event){
    event.preventDefault();

    var userInput = document.getElementById('userInput').value;

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
        window.location.href = "http://localhost:5500/views/landingPage.html";
    })
    .catch((error) => {
        console.error("Error: ", error);
    });
});