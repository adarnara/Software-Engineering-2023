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
            // We can change where we store the JWT. We have 3 options:
            //  - Session storage: lasts for the session, but removed when,
            //    for instance, the browser is closed
            //  - Local storage: lasts longer than session storage
            //  - Cookies: automatically sent with every request from browser,
            //    but may be harder to parse without libraries (but might not
            //    be that hard)
            if (response.headers.get("Content-Type") === "application/json") {
                const data = await response.json();
                console.log(response);
                console.log(data);
                if (data.token) {
                    sessionStorage.setItem("token", data.token);
                }
            }
            // Successful login, redirect to landing page
            window.location.href = "landingPage.html";
        } else {
            const data = await response.json();
            console.log(data.message);
            // TODO: this doesn't work (no element with id 'message')
            document.getElementById("message").innerText = data.message;
            loginButton.textContent = 'Invalid login';
        }
    };

    // Handle form submission
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

