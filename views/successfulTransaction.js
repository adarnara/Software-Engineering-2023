// test api token: shippo_test_98bdae79698aa6f42363e805399343db9b796058
// let shippo = require('shippo')('shippo_test_98bdae79698aa6f42363e805399343db9b796058');
// const userRepo = require('../Repository/userRepo.js');

// const productRepo = require("../Repository/ProductRepo.js");
// const currMemberEmail = "mm3201@scarletmail.rutgers.edu";
const currMemberAddress = "123 Epic Drive";
let currMemberCart;
let buttonCount = 0;
let cartPrice;
let shippingPrice = 0;
let countDeliveryOptionsSelected = 0;
let numProducts = 0;
let cartProductSet;
let cartProductShippingInfo;

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

document.addEventListener('DOMContentLoaded', async function() {
    const currUser = await checkToken()


    await authorize(`http://localhost:3000/cart`)
    .then(async (response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        currMemberCart = await response.json();
        return;
    });

    let updatedCartProducts;
    await authorize(`http://localhost:3000/cart`)
        .then(async (res) => {
            if (!res.ok) {
                console.error("Meh");
                return;
            }

            return await res.json();
        }).then(async (data) => {
            updatedCartProducts = data.products;
        })

    const updatedShippingProducts = {
        "email": currUser.email,
        "cart_id": currMemberCart._id,
        "updated_cart_products": updatedCartProducts
    };

    const transactionReq = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedShippingProducts)
    };

            console.log("UPDATE SHIPPING INFO - SUCCESS");
            console.log();

    console.log(transactionReq);

    const purchasedCartEmptyCart = await authorize(`http://localhost:3000/cart/transaction?cart_id=${currMemberCart._id}`, transactionReq)
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }                        
            return await response.json();
        }).then(async (data) => {
            purchasedCart = data.purchased_cart;
            emptyCart = data.empty_cart;

            console.log("UPDATE SHIPPING INFO - SUCCESS");
            console.log(data);
            console.log();
    });
    console.log("SUCCESS PURCHASE CART:");
    console.log(purchasedCartEmptyCart);
    // hide loading state
    const loadingIcon = document.getElementById('loading-icon');
    const makingPurchaseText = document.getElementById('making-purchase-text');
    loadingIcon.remove();
    makingPurchaseText.remove();
    const checkmark = document.getElementById('checkmark');
    checkmark.style.display = 'block';
    document.getElementById('container').classList.add('checkmark-container');
    
});

function redirectHistory() {
    window.location.href = "shoppingCartHistory.html";
}

function redirectLandingPage() {
    window.location.href = "landingPage.html";
}