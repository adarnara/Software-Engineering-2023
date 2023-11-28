document.getElementById("registration-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("reg-first-name").value;
    const lastName = document.getElementById("reg-last-name").value;
    const email = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-confirm-password").value;
    const role = document.getElementById("reg-role").value;

    const registerButton = document.getElementById("registerButton");

    const updateRegisterButtonText = (text, delay = 1500) => {
        registerButton.textContent = text;
        setTimeout(() => {
            registerButton.textContent = "Register";
        }, delay);
    };

    // Check for blank fields
    if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
        showAlert("Missing fields. Please make sure to input all fields.");
        registerButton.textContent = 'Error processing request';
        setTimeout(() => {
            registerButton.textContent = 'Register';
        }, 1000);
        return;
    }

    if (password !== confirmPassword) {
        updateRegisterButtonText("Passwords do not match");
        return;
    }

    const registrationData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        role: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
    };

    let registrationRoute = "";

    if (role === "seller") {
        registrationRoute = "/seller/register";
    } else if (role === "member") {
        registrationRoute = "/member/register";
    } else {
        updateRegisterButtonText("Invalid role selection");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000${registrationRoute}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(registrationData),
        });

        if (response.status === 201) {
            updateRegisterButtonText("Registration successful");

            document.getElementById("reg-username").value = "";
            document.getElementById("reg-password").value = "";

            document.getElementById("username").value = email;

            registerForm.classList.remove('active');
            loginForm.classList.remove('active');
            container.classList.remove('register-active');
            container.classList.add('login-active');
        } else {
            const data = await response.json();

            if (data.message) {
                updateRegisterButtonText(data.message);
            } else {
                updateRegisterButtonText("Invalid registration");
            }
        }
    } catch (error) {
        console.error(error);
        updateRegisterButtonText("Internal Server Error");
    }
});

function showAlert(message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'custom-alert';

    const alertText = document.createElement('p');
    alertText.textContent = message;

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.color = 'red';
    okButton.style.fontWeight = 'bold';
    okButton.onclick = () => {
        document.body.removeChild(alertContainer);
    };

    alertContainer.appendChild(alertText);
    alertContainer.appendChild(okButton);
    document.body.appendChild(alertContainer);
}

function fetchUserInformation(jwtToken) {
    fetch("http://localhost:3000/token", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        },
    })
        .then(response => response.json())
        .then(data => {
            const userId = data.id;

            fetch(`http://localhost:3000/user/${userId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            })
                .then(response => response.json())
                .then(userData => {
                    // Populate the form with retrieved user information
                    populateForm(userData);
                })
                .catch(error => {
                    console.error("Error fetching user information:", error);
                });
        })
        .catch(error => {
            console.error("Error fetching user ID:", error);
        });
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}