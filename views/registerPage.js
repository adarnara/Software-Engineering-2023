// Register copy of login

/**
 * @returns {boolean} `true` if all fields are valid.
 */
function checkForm() {
    const formElement = document.getElementById("register-form");
    const formData = new FormData(formElement);
    // TODO: Check valid/available username
    // TODO: Check valid/available email address
    // Check passwords match (TODO: check strength?)
    if (formData.get("password") !== formData.get("confirm")) {
        alert("Passwords do not match!");
        return false;
    }
    return true;
}

function checkName() {

}

function checkEmail() {
    
}

function checkPassword() {
    
}

function register() {
    const formElement = document.getElementById("register-form");
    const formData = new FormData(formElement);

    let formJson = {};
    formData.forEach(function(val, key) {
        formJson[key] = val;
    });

    let headers = new Headers();
    headers.append("Content-Type", "application/json");

    // Fetch API
    const request = new Request(
        "/member/register", {
            headers: headers,
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
    if (evt.target === document.getElementById("register-form")) {
        // Send the register request, which will automatically retrieve all the
        // information from the form.
        if (checkForm()) {
            register();
        }
    }
})
