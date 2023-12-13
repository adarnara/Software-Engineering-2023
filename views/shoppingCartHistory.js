const currMemberEmail = "mm3201@scarletmail.rutgers.edu";

function checkPos(quantity) {
  console.log(quantity.value);
  if (quantity.value < 1) quantity.value = 1;
}

// Go to landing page page when 'Continue Shopping' button is clicked
function continueShopping() {
  window.location.href = "/views/landingPage.html";
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
  console.log(currCartProduct);
console.log(currCartProduct.quantity);
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
  if (currCartProduct.transaction.tracking_status === "UNKNOWN")
  {
    currCartProduct.transaction.tracking_status = "Not Yet Shipped"
  }
let currStatus = "../public/Images/check.png";
if (    currCartProduct.transaction.tracking_status !== "Shipped!")
{
  currStatus = "../public/Images/x.png";
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
            </div><div class="shipment-status">
            <img src="../public/Images/usps.png" style="width: 100px; height: 100px; margin-left: 30px" alt="USPS Logo" />
            <p id = "tracking" margin-right: 100px;>Shipping Status: </br><a href = "${currCartProduct.transaction.tracking_url_provider}" class="shipped-icon" target="_blank">${currCartProduct.transaction.tracking_status}</a></p>
            </br>
            <img src="${currStatus}" style="width: 100px; height: 100px; margin-left: 30px" alt="USPS Logo" />
        </div>
        </div>
    `;
    console.log(currCartProduct)
  return productHTML;
}


function createCartButtonHTML(cartData, numShipped) {
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
  let width = (numShipped/cartData.products.length) * 100
  const color = `hsl(${(120 * width) / 100}, 100%, 50%)`;

  const buttonHTML = `
  <button id="button_${cartData.purchaseTime}" class='cart-history-button' onclick="toggleCart('${cartData.purchaseTime}')">
  <div>
    Purchase of $${cartData.totalPrice.toFixed(2)} on ${localFormattedDate}
  </div>
  <div class="progress-bar" style="width: 100%; background-color: #f0f0f0; border-radius: 5px; overflow: hidden;">
    <div class="progress" id="progressBar" style="width: ${width}%; height: 50px; background-color: ${color}; transition: width 2s ease-in-out;">
    </div>
  </div>
  <div class="text-inside-progress">
    Shipped: ${numShipped} / ${cartData.products.length}
  </div>
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
  const currUser = await checkToken()

    console.log("Sending");
    await authorize(
      `http://localhost:3000/cart/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: parseInt(quantity),
          email: currUser.email,
          product_id: product,
        }),
      }
    ).then((res) => console.log(res));

}


// What happens when the page is loaded
document.addEventListener("DOMContentLoaded", async () => {
  const products = [];

  await authorize("http://localhost:3000/cartHistory")
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
          (laterCart, earlierCart) =>  laterCart.purchaseTime - earlierCart.purchaseTime
          );
          data.reverse();
      data.forEach(async (e) => {
        let numShipped = 0;
        console.log(e);
        // create buttons with shopping cart time
        var cartHistoryContainer = document.getElementById("products-history-container");
        try{

          for (let i = 0; i < e.products.length; i++) {
            var product = e.products[i];
            if (product.transaction.tracking_status !== "UNKNOWN")
              numShipped++;
          }
        }
        catch (e)
        {
          console.log(e)
        }
        var cartButton = createCartButtonHTML(e, numShipped);
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
          await authorize(
            `http://localhost:3000/filter?productId=${product.product_id}`
          ).then(async (response) => {
            
            response = await response.json();
            products.push(response);
            var productHTML = createProductHTML(response[0], product);
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

      document.getElementById("shopping-icon").innerHTML = 
      `<a href="/views/shoppingCartHistory.html">
      <img src="../public/Images/shoppingCartHistory.png" alt="shoppingCart" />
      <span style="font-weight: bold; font-size: 20px"></span>
    </a>` + 
          '<a href="/views/shoppingCart.html" style="text-decoration: none; color: inherit;">' +
          '<img src="../public/Images/shoppingCartIcon.png" alt="shoppingCart" />' +
          '<span style="font-weight: bold; font-size: 20px;"></span>' +
          '</a>';

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
