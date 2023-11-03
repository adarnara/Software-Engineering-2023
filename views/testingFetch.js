// Make a fetch request to the root path
fetch(`http://localhost:3000/`)
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        // Log only the response from the root path
        console.log('Response from /:', JSON.stringify(data, null, 2));
    })
    .catch((error) => {
        console.error('Error:', error);
    });


