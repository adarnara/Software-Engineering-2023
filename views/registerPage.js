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
