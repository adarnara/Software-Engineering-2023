// test api token: shippo_test_98bdae79698aa6f42363e805399343db9b796058
// let shippo = require('shippo')('shippo_test_98bdae79698aa6f42363e805399343db9b796058');
// const userRepo = require('../Repository/userRepo.js');
// const productRepo = require("../Repository/ProductRepo.js");
const currMemberEmail = "123email.com";
const currMemberAddress = "123 Epic Drive";

// let emailInput = document.getElementById("username");
// emailInput.value = currMemberEmail;

// let primaryAddressInput = document.getElementById("address");
// primaryAddressInput.value = currMemberAddress;

//`http://localhost:3000/cart/add?user_id=6547e3ad257b40fae701ccc6`
// function validateAllInputs() {
//     const inputs = document.querySelectorAll('input, select');

//     // make sure each input filled out with something
//     for (let i = 0; i < inputs.length; i++) {
//         if (inputs[i].hasAttribute('required') && [i].value.trim() === '') {
//             alert('Please ensure all fields are filled out.');
//             return false;
//         }
//     }

//     return true;
// }

function confirmForm() {
    disableForm(true);
}

function hideEditBtn() {
    disableForm(false);
    console.log("8===D");
    document.getElementById('editShippingInfoButton').style.display = 'none';
    document.getElementById('editShippingInfoButton').add('unclickable');
}

function showEditShippingInfoForm() {
    disableForm(false);

    document.getElementById('editShippingInfoButton').style.display = 'none';
}

function disableForm(isDisabled) {
    const formElems = document.getElementById('confirm_shipping_info').elements;
    for (let i = 0; i < formElems.length; i++) {
        if (formElems[i].class !== 'btn') formElems[i].disabled = isDisabled;
    }

    const formContainer = document.querySelector('.container');
    if (isDisabled) {
        formContainer.classList.add('disabled-form');
    } else {
        formContainer.classList.remove('disabled-form');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("confirm_shipping_info").addEventListener("input", function() {
        const form = document.getElementById("confirm_shipping_info");
        const confirmBtn = document.getElementById("confirmShippingInfoButton");
        const editBtn = document.getElementById("editShippingInfoButton");


        if (form.checkValidity()) {
            confirmBtn.disabled = false;
        } else {
            confirmBtn.disabled = true;
        }
    });


    // Wait when user presses confirm button
    document.getElementById('confirmShippingInfoButton').addEventListener('click', async function (event) {
        event.preventDefault();

        const nameIn = document.getElementById('full_name');
        const emailIn = document.getElementById('email');
        const phoneNumberIn = document.getElementById('phoneNumber');
        const addressIn = document.getElementById('address');
        const cityIn = document.getElementById('city');
        const stateIn = document.getElementById('state');
        const zipIn = document.getElementById('zip');

        nameIn.setAttribute('readonly', 'readonly');
        emailIn.setAttribute('readonly', 'readonly');
        phoneNumberIn.setAttribute('readonly', 'readonly');
        addressIn.setAttribute('readonly', 'readonly');
        cityIn.setAttribute('readonly', 'readonly');
        stateIn.setAttribute('disabled', 'disabled');
        zipIn.setAttribute('readonly', 'readonly');


        document.querySelector('.container').classList.add('slide-left');

        const newDiv = document.createElement('div');
        newDiv.innerHTML = '<h3>New Content on the Right Side</h3>';
        newDiv.classList.add('new-content');
        document.body.appendChild(newDiv);

        confirmForm();      // !**** THIS DOESN'T WORK :C

        console.log(nameIn);
        console.log(emailIn);
        console.log(phoneNumberIn);
        console.log(addressIn);
        console.log(cityIn);
        console.log(stateIn);
        console.log(zipIn);


        const addressTo = {
            "name": nameIn.value.toString(),
            "street1": addressIn.value.toString(),
            "city": cityIn.value.toString(),
            "state": stateIn.value.toString(),
            "zip": zipIn.value.toString(),
            "country": "US",                        // MAYBE CHANGE FOR INTERNATIONAL SHIPPING LATER?
            "email": emailIn.value.toString()    // maybe add phone later too?
        }

        const parcels = [                         // hardcoded... waiting for Adarsh to add randomized weights, heights, etc. to scraped products *
            {
                "length": "5",
                "width": "5",
                "height": "5",
                "distance_unit": "in",
                "weight": "2",
                "mass_unit": "lb"
            }  
        ];

        const req = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                {
                    "address_to": addressTo,
                    "parcels": parcels
                }
            ),
        };

        try {
            await fetch('http://localhost:3000/cart/ship?user_id=12345', req)
                .then((res) => console.log(res.json()));
        }
        catch (err) {
            console.log(err);
        }

    });
});