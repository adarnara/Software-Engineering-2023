// test api token: shippo_test_98bdae79698aa6f42363e805399343db9b796058
// let shippo = require('shippo')('shippo_test_98bdae79698aa6f42363e805399343db9b796058');
// const userRepo = require('../Repository/userRepo.js');


// const productRepo = require("../Repository/ProductRepo.js");
const currMemberEmail = "123email.com";
const currMemberAddress = "123 Epic Drive";
let currMemberCart;
let buttonCount = 0;


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

    await fetch(`http://localhost:3000/cart?user_id=6549b7d806aa0377ef8a5a69`)
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            currMemberCart = await response.json();
            return;
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

        confirmForm();      // !**** THIS DOESN'T WORK :C

        const newDiv = document.createElement('div');
        newDiv.innerHTML = `
        <div id="right-container" class="content-container">
            <div class="flex-container">
                <div id="products-container"></div>
                <div class="loading-spinner"></div>
                <div> Price: </div>
            </div>
        </div>`;
        newDiv.classList.add('new-content');
        document.body.appendChild(newDiv);

        const addressTo = {
            "name": nameIn.value.toString().trim(),
            "street1": addressIn.value.toString().trim(),
            "city": cityIn.value.toString().trim(),
            "state": stateIn.value.toString().trim(),
            "zip": zipIn.value.toString().trim(),
            "country": "US",                        // MAYBE CHANGE FOR INTERNATIONAL SHIPPING LATER?
            "email": emailIn.value.toString().trim()    // maybe add phone later too?
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

        let shipmentInfo;
        var prods = document.getElementById("products-container");
        const products = [];

        try {
            await fetch('http://localhost:3000/cart/ship', req)
                .then(async (res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! Status: ${res.status}`);
                    }

                    return await res.json();
                }).then(async (data) => {
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

                        for (let j = 0; j < shipRates.length; j++) {
                            const currRate = shipRates[j];
                            if (currRate.attributes[0] === 'FASTEST') {
                                shipArr[0] = currRate.amount;
                                etaArr[0] = currRate.estimated_days;
                            } else if (currRate.attributes[0] === 'BESTVALUE') {
                                shipArr[1] = currRate.amount;
                                etaArr[1] = currRate.estimated_days;
                            } else if (currRate.attributes[0] === 'CHEAPEST') {
                                shipArr[2] = currRate.amount;
                                etaArr[2] = currRate.estimated_days;
                            }
                        }

                        console.log("NNNNN:");
                        console.log(`fastest_btn_books7`);
                        // if anything is null, make button unclickable for that option



                        // get quantity of the product
                        let quantity;
                        await fetch(`http://localhost:3000/cart/product?user_id=6549b7d806aa0377ef8a5a69&product_id=${product.product_id}`)
                            .then(async (response) => {
                                response = await response.json();
                                quantity = response.quantity;
                        });
                        
                        
                        await fetch(
                            `http://localhost:3000/search?productId=${product.product_id}`
                          ).then(async (response) => {
                            // console.log(response);
                            response = await response.json();
                            products.push(response);
                            const productHTML = createProductHTML(response, product, etaArr, shipArr, quantity);
                            prods.innerHTML += productHTML;

                            const fastestBtn = document.getElementById(`fastest_btn_${product.product_id}`);
                            const bestValueBtn = document.getElementById(`best_value_btn_${product.product_id}`);
                            const cheapestBtn = document.getElementById(`cheapest_btn_${product.product_id}`);
    
                            console.log("fastestBtn" + " " + fastestBtn);
                            console.log("bestValueBtn" + " " + bestValueBtn);
                            console.log("cheapestBtn" + " " + cheapestBtn);
    
                            for (k = 0; k < 2; k++) {
                                if (shipArr[i] === null || etaArr[i] === null) {
                                    if (i == 0) {   // fastest
                                        fastestBtn.disabled = true;
                                        fastestBtn.classList.add('disabled-button');
                                    } else if (i == 1) {    // best value
                                        bestValueBtn.disabled = true;
                                        bestValueBtn.classList.add('disabled-button');
                                    } else {        // cheapest
                                        cheapestBtn.disabled = true;
                                        cheapestBtn.classList.add('disabled-button');
                                    }
                                }
                            }
                          });
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
        //           `http://localhost:3000/search?productId=${product.product_id}`
        //         ).then(async (response) => {
        //           // console.log(response);
        //           response = await response.json();
        //           products.push(response);
        //           const productHTML = createProductHTML(response, product, [0, 1, 2], [0, 1, 2]);
        //           prods.innerHTML += productHTML;
        //         });
        //     }
        // });

        const loadingSpinner = newDiv.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.parentNode.removeChild(loadingSpinner);
        }

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
    console.log(product._id);

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
                  <button id="fastest_btn_${product._id}" class= "option-button" onclick="test('${
                    product._id
                  }', this); toggleHighlight(this)">FASTEST
                    <div class="button-info">
                        <span class="arrival-time"> Estimated Arrival: ${etaArr[0]} days</span>
                        <span class="extra-cost"> + $${shippingPriceArr[0]}</span>
                    </div></button>

                  <button id="best_value_btn_${product._id}" class= "option-button" onclick="test('${
                    product._id
                  }', this); toggleHighlight(this)">BEST VALUE
                    <div class="button-info">
                        <span class="arrival-time"> Estimated Arrival: ${etaArr[1]} days</span>
                        <span class="extra-cost"> + $${shippingPriceArr[1]}</span>
                    </div></button>

                    <button id="cheapest_btn_${product._id}" class= "option-button" onclick="test('${
                        product._id
                      }', this); toggleHighlight(this)">CHEAPEST
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

function toggleHighlight(btn) {
    const btns = document.getElementsByTagName('button');
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.remove('highlighted');
    }

    btn.classList.toggle('highlighted');
}

function test(btn) {
    console.log("EEE");
}

function changeImage(productId, offset, button) {
    const productContainer = button.closest(".product-container");
    const productImage = productContainer.querySelector(".product-image img");
    const product = products.find((p) => p._id === productId);

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
  