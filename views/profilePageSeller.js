document.addEventListener('DOMContentLoaded', function () {

    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', function () {
        const profilePhotoElement = document.getElementById('profile-photo');
        profilePhotoElement.src = '../public/Images/default-Avatar-2.jpeg';
    });

    const jwtToken = getCookie("token");

    if (jwtToken) {
        fetchUserInformation(jwtToken);
    } else {
        console.error("JWT token not found in cookies");
    }
});

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

function populateForm(userData) {
    document.querySelector("#account-general input[placeholder='Enter First Name']").value = userData.firstName || "";
    document.querySelector("#account-general input[placeholder='Enter Last Name']").value = userData.lastName || "";
    document.querySelector("#account-general input[placeholder='Enter Email']").value = userData.email || "";
    document.querySelector("#date-of-birth").value = userData.dateOfBirth || "";
    document.querySelector("#phone-number").value = userData.phoneNumber || "";
    document.querySelector("#account-info input[placeholder='Enter Street 1']").value = userData.address?.street1 || "";
    document.querySelector("#account-info input[placeholder='Enter Street 2']").value = userData.address?.street2 || "";
    document.querySelector("#account-info input[placeholder='Enter Street 3']").value = userData.address?.street3 || "";
    document.querySelector("#state").value = userData.address?.state || "Select a State";
    document.querySelector("#account-info input[placeholder='Enter Postal Code']").value = userData.address?.postalCode || "";
    document.querySelector("#account-seller textarea[placeholder='Enter your bio']").value = userData.Bio || "";
    document.querySelector("#account-seller input[placeholder='Enter your company name']").value = userData.Company || "";
    document.querySelector("#account-seller input[placeholder='Enter your website URL']").value = userData.website || "";

    const profilePhotoElement = document.getElementById('profile-photo');
    if (userData.profileImage) {
        profilePhotoElement.src = userData.profileImage;
    } else {
        profilePhotoElement.src = '../public/Images/default-Avatar-2.jpeg';
    }
}

function saveChanges() {
    const jwtToken = getCookie("token");

    if (jwtToken) {
        fetch("http://localhost:3000/token", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                const userId = data.id;

                const firstName = document.querySelector("#account-general input[placeholder='Enter First Name']").value;
                const lastName = document.querySelector("#account-general input[placeholder='Enter Last Name']").value;
                const email = document.querySelector("#account-general input[placeholder='Enter Email']").value;
                const dateOfBirth = document.querySelector("#date-of-birth").value;
                const phoneNumber = document.querySelector("#phone-number").value;
                const bio = document.querySelector("#account-seller textarea[placeholder='Enter your bio']").value;
                const company = document.querySelector("#account-seller input[placeholder='Enter your company name']").value;
                const website = document.querySelector("#account-seller input[placeholder='Enter your website URL']").value;
                const street1 = document.querySelector("#account-info input[placeholder='Enter Street 1']").value;
                const street2 = document.querySelector("#account-info input[placeholder='Enter Street 2']").value;
                const street3 = document.querySelector("#account-info input[placeholder='Enter Street 3']").value;
                const state = document.querySelector("#state").value;
                const postalCode = document.querySelector("#account-info input[placeholder='Enter Postal Code']").value;

                if (!validateEmail(email)) {
                    showAlert("Please enter a valid email address (e.g., user@gmail.com)");
                    return;
                }

                const updatedUserData = {};

                if (firstName !== null && firstName !== "") updatedUserData.firstName = firstName;
                if (lastName !== null && lastName !== "") updatedUserData.lastName = lastName;
                if (email !== null && email !== "") updatedUserData.email = email;
                if (dateOfBirth !== null && dateOfBirth !== "") updatedUserData.dateOfBirth = dateOfBirth;
                if (phoneNumber !== null && phoneNumber !== "") updatedUserData.phoneNumber = phoneNumber;
                if (bio !== null && bio !== "") updatedUserData.Bio = bio;
                if (company !== null && company !== "") updatedUserData.Company = company;
                if (website !== null && website !== "") updatedUserData.website = website;

                if ((street1 !== null && street1 !=="") || (street2 !== null && street2 !== "") || (street3 !== null && street3 !== "") || (state !== null && state !== "") || (postalCode !== null && postalCode !== "")) {
                    updatedUserData.address = {
                        street1: street1,
                        street2: street2,
                        street3: street3,
                        state: state,
                        postalCode: postalCode,
                    };
                }
                const profilePhotoInput = document.getElementById('profile-photo-input');
                const selectedFile = profilePhotoInput.files[0];

                if (selectedFile) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const base64Image = e.target.result;
                        updatedUserData.profileImage = base64Image;

                        console.log(updatedUserData);

                        fetch(`http://localhost:3000/profile/updateProfile/${userId}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${jwtToken}`,
                            },
                            body: JSON.stringify(updatedUserData),
                        })
                            .then(response => response.json())
                            .then(updatedData => {
                                console.log("User profile updated:", updatedData);
                                showSuccessAlert();
                            })
                            .catch(error => {
                                console.error("Error updating user profile:", error);
                            });
                    };

                    reader.readAsDataURL(selectedFile);
                } else {
                    updatedUserData.profileImage = '../public/Images/default-Avatar-2.jpeg';

                    console.log(updatedUserData);

                    fetch(`http://localhost:3000/profile/updateProfile/${userId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${jwtToken}`,
                        },
                        body: JSON.stringify(updatedUserData),
                    })
                        .then(response => response.json())
                        .then(updatedData => {
                            console.log("User profile updated:", updatedData);
                            showSuccessAlert();
                        })
                        .catch(error => {
                            console.error("Error updating user profile:", error);
                        });
                }
            })
            .catch(error => {
                console.error("Error fetching user ID:", error);
            });
    } else {
        console.error("JWT token not found in cookies");
    }
}

function validateEmail(email) {
    //  email validation, checks for @gmail.com
    return /\S+@\S+\.\S+/.test(email) && email.includes('@gmail.com');
}

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

function showSuccessAlert() {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'custom-success-alert';

    const alertText = document.createElement('p');
    alertText.textContent = 'Profile Updated Successfully';

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.color = 'green';
    okButton.style.fontWeight = 'bold';
    okButton.onclick = () => {
        document.body.removeChild(alertContainer);
    };

    alertContainer.appendChild(alertText);
    alertContainer.appendChild(okButton);
    document.body.appendChild(alertContainer);
}




function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
