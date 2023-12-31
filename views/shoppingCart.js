function checkPos(quantity) {
  console.log(quantity.value);
  if (quantity.value < 1) quantity.value = 1;
}
let subtotal;

// Go to checkout page when 'Proceed to Checkout' button is clicked
function proceedToCheckout() {
  const confirmation = confirm("Are you sure you want to proceed to checkout?");

  if (confirmation) {
    window.location.href = "shippingPage.html";
  }
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

async function addProductToCart(product, button) {
  let quantity = document.getElementById(product).value;
  const currUser = await checkToken();
  console.log(quantity);
  if (isNaN(parseInt(quantity)) || parseInt(quantity) < 1) {
    quantity = 1;
  } else {
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
          product_id: product,
        }),
      }
    ).then((res) => console.log(res));
  }

  var prods = document.getElementById("products-container");
  var productContainer = button.closest(".deleted-product-container");
  var quant = {
    quantity: quantity,
  };
  productContainer.remove();
  await authorize(`http://localhost:3000/filter?productId=${product}`).then(
    async (response) => {
      // console.log(response);
      response = await response.json();
      console.log(response);
      const productHTML = createProductHTML(response[0], quant);
      prods.innerHTML += productHTML;
    }
  );
  await authorize("http://localhost:3000/cart")
    .then((response) => {
      console.log(
        "***********************************************************************"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // console.log(response.json());
      return response.json();
    })
    .then(async (data) => {
      subtotal = data.totalPrice;
      const subtotalElement = document.getElementById("subtotal-value");
      subtotalElement.textContent = `Price: $${subtotal.toFixed(2)}`;
    });
}

function toggleDeletedProducts() {
  var deletedProductsContainer = document.getElementById(
    "deleted-products-container"
  );
  var button = document.querySelector(".hidden-button");
  
  deletedProductsContainer.classList.toggle("hidden");
  if (deletedProductsContainer.classList.contains("hidden")) {
    button.textContent = "Products Removed From Cart";
    button.style.backgroundColor = "#808080"
  } else {
    button.textContent = "Products Removed From Cart";
    button.style.backgroundColor = "#2980b9"
  }
}
// Update product quantity based on arrow input
async function changeNumber(productId, displayNumber) {
  const req = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity: parseInt(displayNumber.value),
      product_id: productId,
    }),
  };
  console.log(req);
  if (
    isNaN(parseInt(displayNumber.value)) ||
    parseInt(displayNumber.value) < 1
  ) {
    displayNumber.value = 1;
  } else {
    await authorize(
      `http://localhost:3000/cart`,
      req
    ).then((res) => console.log(res));
    await authorize("http://localhost:3000/cart")
      .then((response) => {
        console.log(
          "***********************************************************************"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // console.log(response.json());
        return response.json();
      })
      .then(async (data) => {
        subtotal = data.totalPrice;
        const subtotalElement = document.getElementById("subtotal-value");
        subtotalElement.textContent = `Price: $${subtotal}`;
      });
    // location.reload();
  }
}

//Delete product when 'Remove Item From Cart' button is pressed
async function deleteProduct(productId, button) {
  console.log(productId);

  await authorize(
    `http://localhost:3000/cart/remove?product_id=${productId}`,
    {
      method: "DELETE",
    }
  ).then((res) => console.log(res));

  var deletedContainer = document.getElementById("deleted-products-container");
  var productContainer = button.closest(".product-container");

  productContainer.remove();
  await authorize(`http://localhost:3000/filter?productId=${productId}`).then(
    async (response) => {
      // console.log(response);
      response = await response.json();
      console.log(response);
      const productHTML = createDeletedProductHTML(response[0]);
      deletedContainer.innerHTML += productHTML;
    }
  );
  await authorize("http://localhost:3000/cart")
    .then((response) => {
      console.log(
        "***********************************************************************"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // console.log(response.json());
      return response.json();
    })
    .then(async (data) => {
      subtotal = data.totalPrice;
      const subtotalElement = document.getElementById("subtotal-value");
      subtotalElement.textContent = `Price: $${subtotal.toFixed(2)}`;
    });
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
                      product.category
                    }', -1, this)">Previous</button>
                    <button onclick="changeImage('${
                      product.category
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
                <p style="display: inline-block; margin-right: 10px;">Quantity: </p>
                <input type="number" class="display-number" value="${
                  currCartProduct.quantity
                }" oninput="changeNumber('${
    product.category
  }', this)" onkeyup="handleKeyPress(event, '${product.category}', this)">
                <button class= "delete-button" onclick="deleteProduct('${
                  product.category
                }', this)">Remove Item From Cart</button>
                </div>
            </div>
        </div>
    `;
  return productHTML;
}

function createDeletedProductHTML(product) {
  // Check if variant_data is empty
  let colorsHTML = "";
  if (product.variant_data.length > 0) {
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
  <div class="deleted-product-container">
      <div class="product-image">
          <img src="${product.images[0].large}" alt="${product.name}" />
          <div class="image-navigation">
              <button onclick="changeImage('${
                product.category
              }', -1, this)">Previous</button>
              <button onclick="changeImage('${
                product.category
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
      </div>
      <div class="add-to-cart-button">
          <button class= "add-button" onclick="addProductToCart('${
            product.category
          }', this)">Add Quantity</br> to Cart</button>
      </div>
      <div class="number-control">
          <input type="number" id='${
            product.category
          }' onclick="checkPos(this)" class="display-number" value="1">
      </div>
  </div>
`;
  return productHTML;
}

function createSubTotalHTML(data) {
  const emptyWithoutDeleted = `<div class="empty-cart">
    <h1>Your cart is empty!</h1>
    <div>
    <button class= "continue-shopping-main" onclick="continueShopping()">Continue Shopping</button>
    </div>
   </div>`;
  subtotal = data.totalPrice.toFixed(2);
  const emptyCart = `<div class="subtotal">
  <h1>Your cart is empty!</h1>
  <div>
  <button class= "continue-shopping-small" onclick="continueShopping()">Continue Shopping</button>
  </div>
   </div>
    `;
  const subtotalHTML = `<div class="subtotal">
      <h1>Subtotal</h1>
      <br>
      <h2 id = "subtotal-value">Price: $${subtotal}</h2>
      <div>
        <button class="checkout"  onclick="proceedToCheckout()">Proceed to Checkout</button>
      </div>
     </div>
      `;
      console.log(data.products.length == 0 && data.deletedProducts.length == 0);
  if (data.products.length == 0 && data.deletedProducts.length == 0) {
    return emptyWithoutDeleted;
  }
  return subtotalHTML;
}

document.addEventListener("DOMContentLoaded", async () => {
  const productsContainer = document.getElementById("products-container");
  const deletedProductsContainer = document.getElementById(
    "deleted-products-container"
  );

  const products = [];
    await authorize("http://localhost:3000/cart")
    .then((response) => {
      console.log(
        "***********************************************************************"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // console.log(response.json());
      return response.json();
    })
    .then(async (data) => {
      console.log("Response from /:", JSON.stringify(data, null, 2));
      data.products.sort(
        (product1, product2) => product1.product_id - product2.product_id
      );

      const hiddenButton = document.getElementById(
        "hidden-button"
      );
      if (data.deletedProducts.length == 0 && data.products.length == 0)
        {
          hiddenButton.remove();
        }
      for (let i = 0; i < data.products.length; i++) {
        let product = data.products[i];
        console.log(product)
        await authorize(
          `http://localhost:3000/filter?productId=${product.product_id}`
        ).then(async (response) => {
          // console.log(response);
          response = await response.json();
          console.log(response);
          products.push(response);
          const productHTML = createProductHTML(response[0], product);
          productsContainer.innerHTML += productHTML;
        });
      }
      console.log(data);
      for (let i = 0; i < data.deletedProducts.length; i++) {
        const product = data.deletedProducts[i];
        await authorize(`http://localhost:3000/filter?productId=${product}`).then(
          async (response) => {
            // console.log(response);
            response = await response.json();
            products.push(response);
            console.log(response);
            console.log(product);
            const productHTML = createDeletedProductHTML(response[0]);
            deletedProductsContainer.innerHTML += productHTML;
          }
        );
      }

      const subtotalHTML = createSubTotalHTML(data);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = subtotalHTML.trim();

      const subtotalSection = tempDiv.firstChild;
      subtotalSection.id = "subtotal-section";
      productsContainer.parentNode.appendChild(subtotalSection);
    })
    .catch((error) => {
      console.error("Error fetching product data:", error);
    });

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
      `<a href="http://127.0.0.1:5500/views/shoppingCartHistory.html">
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