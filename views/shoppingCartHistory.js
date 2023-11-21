const currMemberEmail = "123email.com";

function checkPos(quantity) {
  console.log(quantity.value);
  if (quantity.value < 1) quantity.value = 1;
}

// Go to landing page page when 'Continue Shopping' button is clicked
function continueShopping() {
  window.location.href = "http://127.0.0.1:5500/views/landingPage.html";
}

// Update product quantity in database upon text input
function handleKeyPress(event, productId, inputElement) {
  if (event.key === "Enter" || event.key === "Backspace") {
    event.preventDefault(); // Prevent the default form submission
    changeNumber(productId, inputElement);
  }
}


function createProductHTML(product, currCartProduct) {
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
  const productHTML = `
        <div class="product-container">
            <div class="product-image">
                <img src="${product.images[0].large}" alt="${product.name}" />
                <div class="image-navigation">
                    <button onclick="changeImage('${
                      product._id
                    }', -1, this)">Previous</button>
                    <button onclick="changeImage('${
                      product._id
                    }', 1, this)">Next</button>
                </div>
            </div>
            <div class="product-info">
                <h2>${product.name}</h2>
                <p>Price: ${product.price}</p>
                <p>Stars: ${product.stars}</p>
                <p>Features: ${product.rating_count}</p>
                <ul>
                    ${product.feature_bullets
                      .map((bullet) => `<li>${bullet}</li>`)
                      .join("")}
                </ul>
                ${colorsHTML}
                <!-- Number Control -->
                <div class="number-control">
                <p style="display: inline-block; margin-right: 10px;">Quantity: ${currCartProduct.quantity}</p>
                
                <button class= "readd-button" onclick="addProductToCart('${
                  product._id
                }', this)">Re-add to Current Cart</button>
                </div>
            </div>
        </div>
    `;
  return productHTML;
}


function createCartButtonHTML(cartData) {
  // Check if variant_data is empty
  // let colorsHTML = "";
  // if (product.variant_data !== undefined && product.variant_data.length > 0) {
  //   const variantData = JSON.parse(product.variant_data[0]);
  //   const colors = Object.values(variantData).flat();
  //   colorsHTML = `
  //               <p>Variants:</p>
  //               <ul>
  //                   ${colors.map((color) => `<li>${color}</li>`).join("")}
  //               </ul>
  //           `;
  // }

  
  // return newButton;
  let unixTimestamp = cartData.purchaseTime;
  let date = new Date(unixTimestamp);

  // This will give you the date in local timezone
  let localFormattedDate = date.toLocaleString();
  // console.log(localFormattedDate);

  
  const buttonHTML = `
    <button id = "button_${cartData.purchaseTime}"class = 'cart-history-button' onclick = "toggleCart('${cartData.purchaseTime}')">
      Purchase of $${cartData.totalPrice} on ${localFormattedDate}
    </button>
    <div id = "${cartData.purchaseTime}" class = "hidden">


    </div>
  `
  return buttonHTML;

}

function toggleCart(purchaseTime) {
  var cartButton = document.getElementById(
    "button_" + purchaseTime
  );

  var cartByTime = document.getElementById(
    purchaseTime
  );

  cartByTime.classList.toggle("hidden");
  if (cartByTime.classList.contains("hidden")) {
    cartButton.style.backgroundColor = "#808080"
  } else {
    cartButton.style.backgroundColor = "#2980b9"
  }
}


async function addProductToCart(product, button) {
  let quantity = 1;

    console.log("Sending");
    await fetch(
      `http://localhost:3000/cart/add?user_id=6549b7d806aa0377ef8a5a69`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: parseInt(quantity),
          email: currMemberEmail,
          product_id: product,
        }),
      }
    ).then((res) => console.log(res));

}


// What happens when the page is loaded
document.addEventListener("DOMContentLoaded", async () => {
  const products = [];

  await fetch("http://localhost:3000/cartHistory?user_id=6549b7d806aa0377ef8a5a69")
    .then((response) => {
      // console.log(
      //   "***********************************************************************"
      // );
      // console.log(response);
      if (!response.ok) {
        // no displaying cart data
        const displayEmpty = document.getElementById("empty-history-display");
        displayEmpty.style.display = "flex";
        throw new Error(`HTTP error! Status: ${response.status}`);
        // return;
      }

      // console.log(response.json());
      return response.json();
    })
    .then(async (data) => {

      if(data.length == 0) {
        const displayEmpty = document.getElementById("empty-history-display");
        displayEmpty.style.display = "flex";
        return;
      }

      // sort carts by purchase time in descending order
      data.sort(
          (laterCart, earlierCart) => earlierCart.purchaseTime - laterCart.purchaseTime
          );

      data.forEach((e) => {
        // create buttons with shopping cart time
        var cartHistoryContainer = document.getElementById("products-history-container");
        var cartButton = createCartButtonHTML(e);
        cartHistoryContainer.innerHTML += cartButton;

        // for each shopping cart, fill it with product data
        // var cartHistoryProductContainer = document.getElementById(e.purchaseTime);
        // https://stackoverflow.com/questions/8196240/setting-innerhtml-why-wont-it-update-the-dom
        /* 
            "In case it's not clear from the above, if you want to change innerHTML, you can just assign to it directly: 
            document.getElementById("my_div").innerHTML = "Hello";
            You don't need, and can't use, an intermediary variable."
        */
        for (let i = 0; i < e.products.length; i++) {
          var product = e.products[i];

          fetch(
            `http://localhost:3000/search?productId=${product.product_id}`
          ).then(async (response) => {
            
            response = await response.json();
            // console.log(response);
            products.push(response);
            var productHTML = createProductHTML(response, product);
            document.getElementById(e.purchaseTime).innerHTML += productHTML;
            // cartHistoryProductContainer.innerHTML += "brog";

            // console.log(cartHistoryProductContainer)
          });
        }

      });
    }
    
    );

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
});
