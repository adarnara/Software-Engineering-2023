// test api token: shippo_test_98bdae79698aa6f42363e805399343db9b796058
// let shippo = require('shippo')('shippo_test_98bdae79698aa6f42363e805399343db9b796058');
// const userRepo = require('../Repository/userRepo.js');

// const productRepo = require("../Repository/ProductRepo.js");
const currMemberEmail = "mm3201@scarletmail.rutgers.edu";
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

let newDiv = document.createElement('div');
newDiv.id = 'right-container-after-form-confirm';
newDiv.innerHTML = `
<div id="right-container" class="content-container">
    <div class="flex-container">
        <div id="products-container"></div>
        <div class="loading-spinner"></div>
        <div class="price-text"></div>
        <div id="confirmOrderButtonContainer" style="display: none;">
            <button id="confirmButton" class="confirm-button" disabled onclick="confirmOrder()">Confirm Order</button>
        </div>
    </div>
</div>`;

document.addEventListener('DOMContentLoaded', async function () {
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

    cartProductSet = new Set();
    cartProductShippingInfo = {};

    await authorize(`http://localhost:3000/cart`)
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            currMemberCart = await response.json();
            return;
        });


    cartPrice = currMemberCart.totalPrice;
    numProducts = currMemberCart.products.length;
        console.log(currMemberCart.products)
    for (let product of currMemberCart.products) {
        console.log(product);
        cartProductShippingInfo[product.product_id] = {
            "chosen_rate": null,
            "from": null,
            "to": null,
            "fastest_rate": null,
            "best_value_rate": null,
            "cheapest_rate": null
        };
        console.log(cartProductShippingInfo[product.product_id])
        cartProductSet.add(product.product_id);
    }

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
        document.querySelector('.container').classList.remove('slide-right');

        confirmForm();      // !**** THIS DOESN'T WORK :C

        newDiv.classList.add('new-content');
        newDiv.innerHTML = `
        <div id="right-container" class="content-container">
            <div class="flex-container">
                <div id="products-container"></div>
                <div class="loading-spinner"></div>
                <div class="price-text"></div>
                <div id="confirmOrderButtonContainer" style="display: none;">
                    <button id="confirmButton" class="confirm-button" disabled onclick="confirmOrder()">Confirm Order</button>
                </div>
            </div>
        </div>`;
        document.body.appendChild(newDiv);

        const addressTo = {
            "name": nameIn.value.toString().trim(),
            "street1": addressIn.value.toString().trim(),
            "city": cityIn.value.toString().trim(),
            "state": stateIn.value.toString().trim(),
            "zip": zipIn.value.toString().trim(),
            "country": "US",                        // MAYBE CHANGE FOR INTERNATIONAL SHIPPING LATER?
            "email": emailIn.value.toString().trim(),    // maybe add phone later too?
            "phone": phoneNumberIn.value.toString().trim(),
            "company": null
        }

        const parcels = [                         // hardcoded... waiting for Adarsh to add randomized weights, heights, etc. to scraped products *
            {
                "length": (Math.random() * (5 - 1) + 1).toFixed(2),
                "width": (Math.random() * (5 - 1) + 1).toFixed(2),
                "height": (Math.random() * (5 - 1) + 1).toFixed(2),
                "distance_unit": "in",
                "weight": (Math.random() * (5 - 1) + 1).toFixed(2),
                "mass_unit": "lb"
            }  
        ];

        const req = {
            method: "POST",
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

        for (const product_id in cartProductShippingInfo) {
            cartProductShippingInfo[product_id].to = addressTo;
        }

        let shipmentInfo;
        var prods = document.getElementById("products-container");
        let products = [];
        let validAddress = true;


        try {
            await authorize('http://localhost:3000/cart/ship', req)
                .then(async (res) => {
                    if (res.status == 422) {
                        console.log("HI");
                        validAddress = false;
                    }

                    if (!res.ok && res.status != 422) {
                        throw new Error(`HTTP error! Status: ${res.status}`);
                    }

                    return await res.json();
                }).then(async (data) => {
                    if (!validAddress) {
                        let invalidDiv = document.getElementById('invalid-address');
                        console.log(data.messages[0].text);
                        const invalidAddressHTML = 
                            `            
                            <div style="text-align: center;">
                            <img src="../public/Images/warning.png" alt="Warning!" width="300" height="300">
                                <h2 class="invalid-address-text"> ${data.messages[0].text} </h2>
                                <br/><br/><br/>
                                <button id="edit-address" onclick="editForm()">Edit Address</button>
                            </div>

                            `
                            ;
                        // prods.innerHTML += invalidAddressHTML;
                        newDiv.innerHTML = invalidAddressHTML;
                        invalidDiv.innerHTML = data.messages[0].text;
                        return;
                    }

                    /*
                    
    /*

    <button id="fastest_btn_${product._id}" class= "option-button" onclick="toggleShipmentOption('${
                    product._id
                  }','${
                    shippingPriceArr[0]
                  }','${
                    shippingPriceArr[1]
                  }','${
                    shippingPriceArr[2]
                  }',this)">
    */


                    

                    shipmentInfo;
                    prods = document.getElementById("products-container");
                    prods.innerHTML+=`<button id="edit-address1" onclick="editForm()">Edit Address</button>`;
                    products = [];
                    validAddress = true;

                    console.log(data);
                    data.shipments.sort(
                        (shipment1, shipment2) => shipment1.product_id - shipment2.product_id
                    );
                    
                    for (let i = 0; i < data.shipments.length; i++) {
                        const product = data.shipments[i];
                        const shipInfo = product.product_shipping_info;
                        const shipRates = shipInfo.rates;
                        const shipArr = [null, null, null];
                        const etaArr = [null, null, null];

                        /*
                                cartProductShippingInfo[product.product_id] = {
            "chosen_rate": null,
            "from": null,
            "to": null,
            "fastest_rate": null,
            "best_value_rate": null,
            "cheapest_rate": null
        };
                        */
        for (let j = 0; j < shipRates.length; j++) {
            const currRate = shipRates[j];
            for (let j2 = 0; j2 < currRate.attributes.length; j2++) {
                if (currRate.attributes[j2] === 'FASTEST') {
                    shipArr[0] = currRate.amount;
                    etaArr[0] = currRate.estimated_days;
                    cartProductShippingInfo[product.product_id].fastest_rate = currRate;
                    break;
                }
            } 
            for (let j2 = 0; j2 < currRate.attributes.length; j2++) {
                if (currRate.attributes[j2] === 'BESTVALUE') {
                    shipArr[1] = currRate.amount;
                    etaArr[1] = currRate.estimated_days;
                    cartProductShippingInfo[product.product_id].best_value_rate = currRate;
                    break;
                }
            } 
            for (let j2 = 0; j2 < currRate.attributes.length; j2++) {
                if (currRate.attributes[j2] === 'CHEAPEST') {
                    shipArr[2] = currRate.amount;
                    etaArr[2] = currRate.estimated_days;
                    cartProductShippingInfo[product.product_id].cheapest_rate = currRate;
                    break;
                }
            } 
        }

                        console.log("NNNNN:");
                        console.log(`fastest_btn_books7`);
                        // if anything is null, make button unclickable for that option



                        // get quantity of the product
                        let quantity;
                        await authorize(`http://localhost:3000/cart/product?product_id=${product.product_id}`)
                            .then(async (response) => {
                                response = await response.json();
                                quantity = response.quantity;
                        });
                        
                        
                        await authorize(
                            `http://localhost:3000/filter?productId=${product.product_id}`
                          ).then(async (response) => {
                            // console.log(response);
                            response = await response.json();
                            products.push(response);
                            const productHTML = createProductHTML(response[0], product, etaArr, shipArr, quantity);
                            prods.innerHTML += productHTML;
                          });


                          const fastestBtn = document.getElementById(`fastest_btn_${product.product_id}`);
                          const bestValueBtn = document.getElementById(`best_value_btn_${product.product_id}`);
                          const cheapestBtn = document.getElementById(`cheapest_btn_${product.product_id}`);
  
                          console.log("fastestBtn" + " " + fastestBtn);
                          console.log("bestValueBtn" + " " + bestValueBtn);
                          console.log("cheapestBtn" + " " + cheapestBtn);
  
                          for (let k = 0; k <= 2; k++) {
                            console.log(k);
                              if (shipArr[k] === null || etaArr[k] === null) {
                                  if (k == 0) {   // fastest
                                      fastestBtn.disabled = true;
                                      fastestBtn.classList.add('disabled-button');
                                  } else if (k == 1) {    // best value
                                      bestValueBtn.disabled = true;
                                      bestValueBtn.classList.add('disabled-button');
                                  } else {        // cheapest
                                      cheapestBtn.disabled = true;
                                      cheapestBtn.classList.add('disabled-button');
                                  }
                              }
                          }
                    }

                });
        }
        catch (err) {
            console.log(err);
        }

        // console.log(shipmentInfo);

        // display the cart items


        // await fetch("http://localhost:3000/cart?user_id=6549b7d806aa0377ef8a5a69")
        // .then(async (response) => {
        //   console.log(
        //     "***********************************************************************"
        //   );
        //   if (!response.ok) {
        //     throw new Error(`HTTP error! Status: ${response.status}`);
        //   }
        //   // console.log(response.json());
        //   return await response.json();
        // }).then(async (data) => {
        //     data.products.sort(
        //         (product1, product2) => product1.product_id - product2.product_id
        //     );

        //     for (let i = 0; i < data.products.length; i++) {
        //         const product = data.products[i];
        //         await fetch(
        //           `http://localhost:3000/filter?productId=${product.product_id}`
        //         ).then(async (response) => {
        //           // console.log(response);
        //           response = await response.json();
        //           products.push(response);
        //           const productHTML = createProductHTML(response, product, [0, 1, 2], [0, 1, 2]);
        //           prods.innerHTML += productHTML;
        //         });
        //     }
        // });
        
        if (!validAddress) {
            return;
        }

        const loadingSpinner = newDiv.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.parentNode.removeChild(loadingSpinner);
        }

        const confirmOrderButtonContainer = document.getElementById('confirmOrderButtonContainer');
        if (confirmOrderButtonContainer) {
            confirmOrderButtonContainer.style.display = 'block';
        }
        refreshPrice(cartPrice);
        // const priceDiv = newDiv.querySelector('.price-text');
        // const priceSpan = document.createElement('span');
        // priceSpan.textContent = '$0.00';
        // priceDiv.parentNode.appendChild(priceSpan);


        // subtotal = 0.5;
        // const subtotalDisplay = document.createElement('h2');
        // subtotalDisplay.textContent = `Price: $${subtotal}`;
        // subtotalDisplay.id = "subtotal-value";
        // newDiv.innerHTML.appendChild(subtotalDisplay);

    });
});

function createProductHTML(product, currCartProduct, etaArr, shippingPriceArr, quantity) {
    // etaArr = [eta for fastest, eta for best value, eta for cheapest]
    // shippingPriceArr = [... fastest, ... best value, ... cheapest] ^


    // Check if variant_data is empty
    let colorsHTML = "";
    if (product.variant_data !== undefined && product.variant_data.length > 0) {
      const variantData = JSON.parse(product.variant_data[0]);
      const colors = Object.values(variantData).flat();
      colorsHTML = `
                  <p>Variants:</p>
                  <ul>
                      ${colors.map((color) => `<li>${color}</li>`).join("")}
                  </ul>
              `;
    }

    console.log("*****!*!*!");
    console.log(product.category);

    const productHTML = `
          <div class="product-container">
              <div class="product-image">
                  <img src="${product.images[0].large}" alt="${product.name}" />
              </div>
              <div class="product-info">
                  <h2>${product.name}</h2>
                  <p>Price: ${product.price}</p>
                  ${colorsHTML}
                  <!-- Number Control -->
                  <div class="number-control">
                  <p style="display: inline-block; margin-right: 10px;">Quantity: </p>
                  <span class="display-number">${
                    quantity
                  }     </span>
                  <button id="fastest_btn_${product.category}" class= "option-button" onclick="toggleShipmentOption('${
                    product.category
                  }','${
                    shippingPriceArr[0]
                  }','${
                    shippingPriceArr[1]
                  }','${
                    shippingPriceArr[2]
                  }',this)">FASTEST
                    <div class="button-info">
                        <span class="arrival-time"> Estimated Arrival: ${etaArr[0]} days</span>
                        <span class="extra-cost"> + $${shippingPriceArr[0]}</span>
                    </div></button>

                  <button id="best_value_btn_${product.category}" class= "option-button" onclick="toggleShipmentOption('${
                    product.category
                  }','${
                    shippingPriceArr[0]
                  }','${
                    shippingPriceArr[1]
                  }','${
                    shippingPriceArr[2]
                  }',this)">BEST VALUE
                    <div class="button-info">
                        <span class="arrival-time"> Estimated Arrival: ${etaArr[1]} days</span>
                        <span class="extra-cost"> + $${shippingPriceArr[1]}</span>
                    </div></button>

                    <button id="cheapest_btn_${product.category}" class= "option-button" onclick="toggleShipmentOption('${
                        product.category
                      }','${
                        shippingPriceArr[0]
                      }','${
                        shippingPriceArr[1]
                      }','${
                        shippingPriceArr[2]
                      }',this)">CHEAPEST
                        <div class="button-info">
                            <span class="arrival-time"> Estimated Arrival: ${etaArr[2]} days</span>
                            <span class="extra-cost"> + $${shippingPriceArr[2]}</span>
                        </div></button>
                  </div>
              </div>
          </div>
      `;
    buttonCount++;
    return productHTML;
}

function toggleShipmentOption(product_id, fastest, bestValue, cheapest, btn) {
    const fastestPrice = parseFloat(fastest);
    const bestValPrice = parseFloat(bestValue);
    const cheapestPrice = parseFloat(cheapest);

    const optionPattern = /^(fastest|best_value|cheapest)_[\w]+$/;
    const pattern = new RegExp(`^.*_${product_id}`);
    let currOption;

    
    const matchOption = btn.id.match(optionPattern);

    let option;
    if (matchOption) {
        option = matchOption[1]; // fastest | best_value | cheapest
    }

    const btns = document.getElementsByTagName('button');
    for (let i = 0; i < btns.length; i++) {
        if (pattern.test(btns[i].id)) {
            if (btns[i].classList.contains('highlighted')) {
                const matchOldOption = btns[i].id.match(optionPattern);
                if (matchOldOption) {
                    if (matchOldOption[1] === option) return;
                    currOption = matchOldOption[1];
                }
            }
            btns[i].classList.remove('highlighted');
        }
    }

    console.log("CURR OPTION: " + currOption);
    console.log("NEW OPTION: " + option);



    console.log("1. " + shippingPrice);

    if (currOption === undefined && option !== undefined) {
        countDeliveryOptionsSelected++;
    }

    if (currOption === option) {
       return;
    }

    if (currOption !== undefined && currOption !== option) {
        if (currOption === 'fastest') {
            shippingPrice -= parseFloat(fastestPrice);
        } else if (currOption === 'best_value') {
            shippingPrice -= parseFloat(bestValPrice);
        } else if (currOption === 'cheapest') {
            shippingPrice -= parseFloat(cheapestPrice);
        }
    }

    shippingPrice = parseFloat(shippingPrice).toFixed(2);
    console.log("2. " + shippingPrice);

    if (currOption !== option) {
        if (option === 'fastest') {
            console.log(parseFloat(shippingPrice) + parseFloat(fastestPrice));
            console.log("452");
            shippingPrice = parseFloat(shippingPrice) + parseFloat(fastestPrice);
        } else if (option === 'best_value') {
            console.log(parseFloat(shippingPrice) + parseFloat(bestValPrice));
            console.log("455");
            shippingPrice = parseFloat(shippingPrice) + parseFloat(bestValPrice);
        } else if (option === 'cheapest') {
            console.log(parseFloat(shippingPrice) + parseFloat(cheapestPrice));
            console.log("458");
            shippingPrice = parseFloat(shippingPrice) + parseFloat(cheapestPrice);
        }
    }

    shippingPrice = parseFloat(shippingPrice).toFixed(2);
    
    console.log("3. " + shippingPrice);

    refreshPrice((parseFloat(shippingPrice) + parseFloat(cartPrice)).toFixed(2));

    // cartPrice = tempCartPrice;
    btn.classList.toggle('highlighted');


    const confirmOrderButton = document.getElementById('confirmButton');
    console.log("confirm button: " + confirmOrderButton);
    console.log("options selected = " + countDeliveryOptionsSelected);
    console.log("num products = " + numProducts);

    if (confirmOrderButton) {
        confirmOrderButton.disabled = (countDeliveryOptionsSelected < numProducts);
    }
}

async function confirmOrder() {
    // update shipping price of each cartProduct
    // update total price of cart (cart price + shipping - the thing in the price-text class/span)
    const optionPattern = /^(fastest|best_value|cheapest)_[\w]+$/;
    const prodIDpattern = /(?<=btn_).*/;
    const confirmation = window.confirm('Are you sure you want to confirm your order?');

    if (confirmation) {
        const totalCartPrice = (parseFloat(shippingPrice) + parseFloat(cartPrice)).toFixed(2);
        // grab shipping price of each item
        const btns = document.getElementsByTagName('button');
        for (let i = 0; i < btns.length; i++) {
            console.log("btn id = " + btns[i].id);
            if (prodIDpattern.test(btns[i].id)) {
                if (btns[i].classList.contains('highlighted')) {
                    const matchOption = btns[i].id.match(optionPattern);
                    if (matchOption) {
                        const option = matchOption[1];
                        const matchProdID = btns[i].id.match(prodIDpattern);
                        const prodID = matchProdID[0];
                        console.log("prodID = " + prodID);
                        console.log("matchOption = " + matchOption[1]);
                        console.log(" ");
                        console.log(prodID)
                        if (option === 'fastest') {
                            cartProductShippingInfo[prodID].chosen_rate = "fastest";
                        } else if (option === 'best_value') {
                            cartProductShippingInfo[prodID].chosen_rate = "best_value";
                        } else if (option === 'cheapest') {
                            cartProductShippingInfo[prodID].chosen_rate = "cheapest";
                        }
                    }
                }
                // btns[i].classList.remove('highlighted');
            }
        }

        console.log("CHECK MAP:");
        for (const product_id in cartProductShippingInfo) {
            console.log(`${product_id}: ${JSON.stringify(cartProductShippingInfo[product_id])}`);
        }


        const req = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cartProductShippingInfo)
        };

        let updatedShippingProducts;
        let purchasedCart;
        let emptyCart;
        // fetch to set shipping Prices, cart total price, to/from (PATCH)
        const updatedShippingInfo = await authorize(`http://localhost:3000/cart/info-confirmation?cart_id=${currMemberCart._id}`, req)
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }

                return await res.json();
            }).then(async (data) => {
                console.log("!*!(*&#)@(*@#()*@#)(*@()#*#@");
                console.log(data);

                updatedShippingProducts = data;
            });
        
                        // fetch to set transaction and purchase cart and make new empty cart (NOTE: NEED TO EVENTUALLY PORT THIS TO AFTER STRIPE PAYMENT)
                // can feed current data straight to the API
        // const transactionReq = {
        //     method: "PATCH",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(updatedShippingProducts)
        // };

        //         console.log("UPDATE SHIPPING INFO - SUCCESS");
        //         console.log();

        // console.log(transactionReq);

        // const purchasedCartEmptyCart = await fetch(`http://localhost:3000/cart/transaction?cart_id=${currMemberCart._id}`, transactionReq)
        //     .then(async (response) => {
        //         if (!response.ok) {
        //             throw new Error(`HTTP error! Status: ${response.status}`);
        //         }                        
        //         return await response.json();
        //     }).then(async (data) => {
        //         purchasedCart = data.purchased_cart;
        //         emptyCart = data.empty_cart;

        //         console.log("UPDATE SHIPPING INFO - SUCCESS");
        //         console.log(data);
        //         console.log();
        //     });

        handleCheckout();
    }

    // window.location.href = 'checkout/checkoutPage.html';
}

function editForm() {
    const right = document.getElementById('right-container-after-form-confirm');
    const nameIn = document.getElementById('full_name');
    const phoneNumberIn = document.getElementById('phoneNumber');
    const addressIn = document.getElementById('address');
    const cityIn = document.getElementById('city');
    const stateIn = document.getElementById('state');
    const zipIn = document.getElementById('zip');
    
    right.remove();
    console.log(document.querySelector('.container'))
    document.querySelector('.container').classList.add('slide-right');
    document.querySelector('.container').classList.remove('slide-left');

    nameIn.removeAttribute('readonly');
    phoneNumberIn.removeAttribute('readonly');
    addressIn.removeAttribute('readonly');
    cityIn.removeAttribute('readonly');
    stateIn.removeAttribute('disabled');
    zipIn.removeAttribute('readonly');
    console.log(667);
    disableForm(false);
}

function editFormOLD() {
    
    const nameIn = document.getElementById('full_name');
    const emailIn = document.getElementById('email');
    const phoneNumberIn = document.getElementById('phoneNumber');
    const addressIn = document.getElementById('address');
    const cityIn = document.getElementById('city');
    const stateIn = document.getElementById('state');
    const zipIn = document.getElementById('zip');

    nameIn.removeAttribute('readonly');
    emailIn.removeAttribute('readonly');
    phoneNumberIn.removeAttribute('readonly');
    addressIn.removeAttribute('readonly');
    cityIn.removeAttribute('readonly');
    stateIn.removeAttribute('disabled');
    zipIn.removeAttribute('readonly');

    disableForm(false);

    const containerToRemove = document.getElementById('right-container-after-form-confirm');
    if (containerToRemove) {
        containerToRemove.remove();
    }

    document.querySelector('.container').classList.remove('slide-left');
    document.querySelector('.container').classList.add('slide-right');

    newDiv = document.createElement('div');
    newDiv.id = 'right-container-after-form-confirm';
    newDiv.innerHTML = `
    <div id="right-container" class="content-container">
        <div class="flex-container">
            <div id="products-container"></div>
            <div class="loading-spinner"></div>
            <div class="price-text"></div>
            <div id="confirmOrderButtonContainer" style="display: none;">
                <button id="confirmButton" class="confirm-button" disabled onclick="confirmOrder()">Confirm Order</button>
            </div>
        </div>
    </div>`;

    newDiv.classList.add('new-content');
    document.body.appendChild(newDiv);
}

async function handleCheckout() {
    try {
    //   const responseGET = await fetch(`http://localhost:3000/cart?user_id=655f9963f9cbae2c21c3bb60`);
    //   if (!responseGET.ok) {
    //     throw new Error(`HTTP error! Status: ${responseGET.status}`);
    //   }
    //   const cartDetails = await responseGET.json();
    //   const checkoutBody = {
    //     "_id": cartDetails._id,
    //     "email": cartDetails.email,
    //     "purchaseTime": cartDetails.purchaseTime,
    //     "numShipped": cartDetails.numShipped,
    //     "products": cartDetails.products,
    //     "__v": cartDetails.__v,
    //     "totalPrice": cartDetails.totalPrice
    //   };

    await authorize(`http://localhost:3000/cart`)
    .then(async (response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        currMemberCart = await response.json();
        return;
    });

      const checkoutResponse = await authorize("http://localhost:3000/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currMemberCart)
      });
      if (!checkoutResponse.ok) {
        const errorDetails = await checkoutResponse.json();
        throw new Error(`Checkout error: ${errorDetails.message}`);
      }
      const checkoutData = await checkoutResponse.json();
      window.location.href = checkoutData.url;
    } catch (error) {
      console.error('Error:', error);
    }
  }

function test(btn) {
    console.log("EEE");
}

function refreshPrice(price) {
    var priceSpan = newDiv.querySelector('.price-text');
    priceSpan.textContent = `Total Price: $${parseFloat(price).toFixed(2)}`;
}

function changeImage(productId, offset, button) {
    const productContainer = button.closest(".product-container");
    const productImage = productContainer.querySelector(".product-image img");
    const product = products.find((p) => p.category === productId);

    let currentImageIndex = product.images.findIndex(
      (image) => image.large === productImage.src
    );

    currentImageIndex += offset;

    if (currentImageIndex < 0) {
      currentImageIndex = product.images.length - 1;
    } else if (currentImageIndex >= product.images.length) {
      currentImageIndex = 0;
    }

    productImage.src = product.images[currentImageIndex].large;
  }
  window.changeImage = changeImage;
  