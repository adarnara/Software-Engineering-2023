document.addEventListener("DOMContentLoaded", async function () {
    const container = document.querySelector(".container");
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.Register-form');
    const RegiBtn = document.querySelector('.RegiBtn');
    const LoginBtn = document.querySelector('.LoginBtn');
    const loginButton = document.getElementById('loginButton');

    let alreadyLoggedIn = false;
    let registrationRoute;

    const checkExistingToken = async () => {
        try {
            const existingToken = getJwtToken();

            if (existingToken) {
                const userData = await checkToken();
                const userEmail = userData.email;

                const inputEmail = document.getElementById("username").value;

                if (userEmail === inputEmail) {
                    loginButton.textContent = 'Already Logged In';
                    setTimeout(() => {
                        loginButton.textContent = 'Login';
                    }, 1500);
                    alreadyLoggedIn = true;
                } else {
                    alreadyLoggedIn = false;
                }
            }
        } catch (tokenError) {
            console.error(tokenError);
            document.getElementById("message").innerText = "Internal Server Error";
            showErrorMessage('Error Logging In');
        }
    };

    RegiBtn.addEventListener('click', () => {
        registerForm.classList.add('active');
        loginForm.classList.add('active');
        container.classList.remove('login-active');
        container.classList.add('register-active');
    });

    LoginBtn.addEventListener('click', () => {
        registerForm.classList.remove('active');
        loginForm.classList.remove('active');
        container.classList.remove('register-active');
        container.classList.add('login-active');
    });

    const handleLoginResult = async (response) => {
        try {
            if (response.status === 201) {
                const data = await response.json();
                const token = data.token;

                setJwtToken(token);

                // Request user information from /token route using the obtained token
                try {
                    const userData = await checkToken();

                    if (userData) {
                        // This doesn't work correctly, since the redirect
                        // happens instantaneously.
                        //
                        // Display success message for 1.5 seconds
                        // loginButton.textContent = 'Login Successful';
                        // setTimeout(() => {
                        //     loginButton.textContent = 'Login';
                        // }, 200);

                        // Redirect to landing page depending on role
                        const role = userData.role;
                        if (role === "Seller") {
                            window.location.href = "landingPageSeller.html";
                        } else if (role === "Member") {
                            window.location.href = "landingPage.html";
                        } else {
                            console.error("Unknown role:", role);
                        }
                        // window.location.href = "landingPage.html";
                    } else {
                        console.error("Failed to fetch user information");
                        // Handle error as needed
                        showErrorMessage('Error Logging In');
                    }
                } catch (tokenError) {
                    console.error(tokenError);
                    // Handle error as needed
                    showErrorMessage('Server Error');
                }
            } else {
                const data = await response.json();
                console.log(data.message);
                loginButton.textContent = 'Invalid login';
                setTimeout(() => {
                    loginButton.textContent = 'Login';
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            // Handle error as needed
            showErrorMessage('Error Logging In');
        }
    };

    const showErrorMessage = (message) => {
        loginButton.textContent = message;
        setTimeout(() => {
            loginButton.textContent = 'Login';
        }, 1500);
    };

    const showAlert = (message) => {
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
    };

    // Handle form submission
    const loginFormElement = document.getElementById('login-form');
    const roleSelect = document.getElementById('role');

    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();

        await checkExistingToken();

        if (alreadyLoggedIn) {
            return;
        }

        const email = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showAlert('Missing fields. Please make sure to input all fields.');
            loginButton.textContent = 'Error processing request';
            setTimeout(() => {
                loginButton.textContent = 'Login';
            }, 1000);
            return;
        }

        // Move role-related logic inside the form submission event listener
        const role = roleSelect.value;

        if (role === "member") {
            registrationRoute = "/member/login";
        } else if (role === "seller") {
            registrationRoute = "/seller/login";
        } else {
            registrationRoute = "/admin/login";
        }

        const loginData = {
            email: email,
            password: password,
            role: role
        };

        try {
            // Authenticate user using the selected registration route
            const response = await fetch(`http://localhost:3000${registrationRoute}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            });

            handleLoginResult(response);
        } catch (error) {
            console.error(error);
            // Handle error as needed
            showErrorMessage('Error Logging In');
        }
    });
});
