document.addEventListener("DOMContentLoaded", async function () {
    const container = document.querySelector(".container");
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.Register-form');
    const RegiBtn = document.querySelector('.RegiBtn');
    const LoginBtn = document.querySelector('.LoginBtn');
    const loginButton = document.getElementById('loginButton');

    let alreadyLoggedIn = false;
    const checkExistingToken = async () => {
        try {
            const existingToken = getCookieToken("token");
            console.log("Existing Token:", existingToken);

            if (existingToken) {
                const tokenResponse = await fetch("http://localhost:3000/token", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${existingToken}`,
                        "Content-Type": "application/json",
                    },
                });

                if (tokenResponse.status === 200) {
                    const userData = await tokenResponse.json();
                    const userEmail = userData.email;

                    const inputEmail = document.getElementById("username").value;
                    console.log("User Email from Token:", userEmail);
                    console.log("Input Email:", inputEmail);

                    if (userEmail === inputEmail) {
                        loginButton.textContent = 'Already Logged In';
                        setTimeout(() => {
                            loginButton.textContent = 'Login';
                        }, 1500);
                        alreadyLoggedIn = true;
                    }
                    else{
                        alreadyLoggedIn = false;
                    }
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

                removeCookie("token");

                // Store the JWT token in a cookie with 10 minutes expiration
                setCookie("token", token, 10 / (24 * 60)); // 10 minutes expiration

                // Request user information from /token route using the obtained token
                try {
                    const tokenResponse = await fetch("http://localhost:3000/token", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (tokenResponse.status === 200) {
                        const userData = await tokenResponse.json();
                        console.log("User ID:", userData.userId);

                        // Display success message for 1.5 seconds
                        loginButton.textContent = 'Login Successful';
                        setTimeout(() => {
                            loginButton.textContent = 'Login';
                        }, 200);

                        // Redirect to landing page
                        window.location.href = "landingPage.html";
                    } else {
                        console.error("Failed to fetch user information");
                        // Handle error as needed
                        showErrorMessage('Error Logging In');
                    }
                } catch (tokenError) {
                    console.error(tokenError);
                    // Handle error as needed
                    showErrorMessage('Error Logging In');
                }
            } else {
                const data = await response.json();
                console.log(data.message);
                document.getElementById("message").innerText = data.message;
                loginButton.textContent = 'Invalid login';
            }
        } catch (error) {
            console.error(error);
            // Handle error as needed
            showErrorMessage('Error Logging In');
        }
    };

    const removeCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };
    const setCookie = (name, value, days) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    };

    const showErrorMessage = (message) => {
        loginButton.textContent = message;
        setTimeout(() => {
            loginButton.textContent = 'Login';
        }, 1500); // Display for 2 seconds, adjust as needed
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
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        await checkExistingToken();

        if (alreadyLoggedIn) {
            // Skip the rest of the login process if already logged in
            return;
        }


        const email = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showAlert('Missing fields. Please make sure to input all fields.');
            return;
        }

        const loginData = {
            email: email,
            password: password
        };

        try {
            // Authenticate user using /member/login route
            const response = await fetch("http://localhost:3000/member/login", {
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
            document.getElementById("message").innerText = "Internal Server Error";
            showErrorMessage('Error Logging In');
        }
    });
    const getCookieToken = (name) => {
        const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return cookieValue ? cookieValue.pop() : null;
    };

});