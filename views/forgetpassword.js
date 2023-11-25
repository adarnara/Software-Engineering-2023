document.addEventListener("DOMContentLoaded", function () {
    const forgetPasswordForm = document.getElementById('login-form');
    const changePasswordButton = document.getElementById('loginButton');

    forgetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById("username").value;
        const oldPassword = document.getElementById("password").value;
        const newPassword = document.getElementById("reg-confirm-password").value;

        // Check if any of the attributes is empty
        if (!email || !oldPassword || !newPassword) {
            showAlert('Missing fields. Please make sure to input all fields.');
            changePasswordButton.textContent = 'Error processing request';
            setTimeout(() => {
                changePasswordButton.textContent = 'Change Password';
            }, 1000);
            return;
        }

        // Check if old and new passwords are the same
        if (oldPassword === newPassword) {
            changePasswordButton.textContent =  "Old & New Passwords are Same";
            setTimeout(() => {
                changePasswordButton.textContent = 'Change Password';
            }, 1500);
            return;
        }

        const forgetPasswordData = {
            email: email,
            oldPassword: oldPassword,
            newPassword: newPassword
        };

        try {
            const response = await fetch("http://localhost:3000/forgetPassword", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(forgetPasswordData),
            });

            handleChangePasswordResult(response);
        } catch (error) {
            console.error(error);
            document.getElementById("message").innerText = "Internal Server Error";
            changePasswordButton.textContent = 'Change Password';
        }
    });

    const handleChangePasswordResult = async (response) => {
        const messageElement = document.getElementById("message");

        if (response.ok) {
            // Password change successful
            changePasswordButton.textContent = 'Password Changed';
            setTimeout(() => {
                changePasswordButton.textContent = 'Change Password';
            }, 1500);
        } else if (response.status === 401) {
            changePasswordButton.textContent = 'Incorrect Old Password';
            setTimeout(() => {
                changePasswordButton.textContent = 'Change Password';
            }, 1500);
        } else {
            showAlert('Missing fields. Please make sure to input all fields.');
            changePasswordButton.textContent = 'Error processing request';
            setTimeout(() => {
                changePasswordButton.textContent = 'Change Password';
            }, 1000);
        }
    };

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
});
