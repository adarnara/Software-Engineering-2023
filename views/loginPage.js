document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".container");
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.Register-form');
    const RegiBtn = document.querySelector('.RegiBtn');
    const LoginBtn = document.querySelector('.LoginBtn');
    const loginButton = document.getElementById('loginButton');


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
        if (response.status === 201) {
            if (response.headers.get("Content-Type") === "application/json") {
                const data = await response.json();
                console.log(response);
                console.log(data);
                if (data.token) {
                    // Store the token in cookies
                    document.cookie = `token=${data.token}; path=/`;

                    // Make a request to /token to get user information
                    try {
                        const tokenResponse = await fetch("http://localhost:3000/token", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${data.token}`
                            }
                        });

                        if (tokenResponse.status === 200) {
                            const userData = await tokenResponse.json();

                            // Store user information in cookies
                            document.cookie = `user=${JSON.stringify(userData)}; path=/`;

                            // Check if the entered email matches the email stored in cookies
                            const enteredEmail = document.getElementById("username").value;
                            const storedUser = getCookie("user");
                            if (storedUser) {
                                const storedEmail = JSON.parse(storedUser).email;
                                if (enteredEmail === storedEmail) {
                                    loginButton.textContent = 'Already logged in';
                                    setTimeout(() => {
                                        loginButton.textContent = 'Login';
                                    }, 1000);
                                } else {
                                    // Successful login, redirect to landing page
                                    window.location.href = "landingPage.html";
                                }
                            }
                        } else {
                            // Handle error from /token route
                            console.log("Error from /token route");
                            loginButton.textContent = 'Invalid login';
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        } else {
            const data = await response.json();
            console.log(data.message);
            document.getElementById("message").innerText = data.message;
            loginButton.textContent = 'Invalid login';
        }
    };

    const loginFormElement = document.getElementById('login-form');
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        const loginData = {
            email: email,
            password: password
        };

        let loginRoute = "";

        if (role === "seller") {
            loginRoute = "/seller/login";
        } else if (role === "member") {
            loginRoute = "/member/login";
        } else if (role === "admin") {
            loginRoute = "/admin/login";
        } else {
            document.getElementById("message").innerText = "Invalid role selection.";
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000${loginRoute}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            });

            handleLoginResult(response);
        } catch (error) {
            console.error(error);
            document.getElementById("message").innerText = "Internal Server Error";
            loginButton.textContent = 'Invalid login';
        }
    });
});

function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return cookieValue;
        }
    }
    return null;
}
