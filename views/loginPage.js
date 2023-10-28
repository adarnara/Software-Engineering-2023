// Ideally, the client is able to either:
// 1. Access a 3rd-party API to generate the requisite data to send to the server
// 2. Generate the data to send to the server
//   a. Encryption (Don't send plaintext passwords over internet)

// Notes
// 1. Notice that we use emails as the key to login

// Implementation Notes
// 1. Uses the Fetch API
// 2. Currently sends the data in plaintext

// Sends a request to register the user simply by sending the form
// data in JSON format.
function register() {
    const formElement = document.getElementById("login-form");
    const formData = new FormData(formElement);

    let formJson = {};
    formData.forEach(function(val, key) {
        formJson[key] = val;
    });

    // Fetch API
    const request = new Request(
        "/member/login", {
            method: "POST",
            body: JSON.stringify(formJson),
        }
    );

    fetch(request)
        .then(function(res) {
            if (!res.ok) {
                throw new Error(`HTTP Error! Status: ${res.status}`);
            }
            return res.blob();
        })
        .then(function(_) {
            console.log("Request Succeeded!")
        });
}

// Attach an event listener to the form, which is set to `method="dialog"`.
// The form will not submit by itself since this is the case.
addEventListener("submit", function(evt) {
    if (evt.target === document.getElementById("login-form")) {
        // Send the register request, which will automatically retrieve all the
        // information from the form.
        register();
    }
})
