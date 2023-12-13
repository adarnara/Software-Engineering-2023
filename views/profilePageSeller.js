document.addEventListener('DOMContentLoaded', function() {
    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', function() {
        const profilePhotoElement = document.getElementById('profile-photo');
        profilePhotoElement.src = '../public/Images/default-Avatar-2.jpeg';
    });
    
    const cancelButton = document.getElementById('cancel-button');
    cancelButton.addEventListener('click', function() {
        // Redirect to the landing page when the "Cancel" button is clicked.
        window.location.href = 'landingPage.html';
    });
    
    assertJwtToken();
    fetchUserInformation();
});

function fetchUserInformation() {
    checkToken().then(data => {
        const userId = data.id;
        
        
        authorize(`${SERVER_URL}/profile/getUser`)
            
            .then(response => response.json())
            .then(userData => {
                // Populate the form with retrieved user information
                populateForm(userData);
            })
            
            .catch(error => {
                console.error("Error fetching user information:", error);
            });
    }).catch(error => {
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
    const profilePhotoElement = document.getElementById('profile-photo');
    if (userData.profileImage) {
        profilePhotoElement.src = userData.profileImage;
    } else {
        profilePhotoElement.src = '../public/Images/default-Avatar-2.jpeg';
    }
}

// In the future, we should use async functions instead of chaining callbacks.
function saveChanges() {
    assertJwtToken();
    
    authorize("http://localhost:3000/token")
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
            
            if ((street1 !== null && street1 !== "") || (street2 !== null && street2 !== "") || (street3 !== null && street3 !== "") || (state !== null && state !== "") || (postalCode !== null && postalCode !== "")) {
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
                reader.onload = function(e) {
                    const base64Image = e.target.result;
                    updatedUserData.profileImage = base64Image;
                    
                    console.log(updatedUserData);
                    
                    authorize(`http://localhost:3000/profile/updateProfile`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
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
                
                authorize(`http://localhost:3000/profile/updateProfile`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
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
    
}

// Note: in the future, use email-typed inputs instead of manual validation.
function validateEmail(email) {
    // not sure why the email needed to be `@gmail.com`, changing that.
    
    // email validation, checks for @gmail.com
    // return /\S+@\S+\.\S+/.test(email) && email.includes('@gmail.com');
    
    return /[A-Za-z0-9_]+@\S+\.\S+/.test(email);
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

function continueShopping() {
    window.location.href = "/views/landingPageSeller.html";
}

function toProfile() {
    checkToken().then(function redirect(data) {
        const role = data.role;
        if (role === "Seller") {
            window.location.href = "/views/profilePageSeller.html";
        } else if (role === "Member") {
            window.location.href = "/views/profilePageMember.html";
        } else {
            console.error("Unknown role:", role);
        }
    });
}

function logout() {
    removeJwtToken();
    window.location.href = "/views/landingPage.html";
}

function setup() {
    const token = getJwtToken();
    
    if (token) {
        const profileButton = document.createElement("button");
        profileButton.className = "go-to-page-button";
        profileButton.innerHTML = '<img src="../public/Images/profile.png" alt="Profile" />';
        profileButton.onclick = function() {
            toProfile();
        };
        
        
        document.getElementById("shopping-icon").appendChild(profileButton);
        
        const logoutButton = document.createElement("button");
        logoutButton.className = "go-to-page-button";
        logoutButton.innerHTML = '<img src="/public/Images/image-button-two.png" alt="Logout" />';
        logoutButton.onclick = logout;
        
        document.getElementById("shopping-icon").appendChild(logoutButton);
    }
}

// Set up the web page
setup();
