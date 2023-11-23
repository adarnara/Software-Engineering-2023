const currMemberEmail = "mm3201@scarletmail.rutgers.edu";
function checkPos(quantity) {
  console.log(quantity.value);
  if (quantity.value < 1) quantity.value = 1;
}
let subtotal;
// Get the current Member's cart
const getCurrMemberCart = async () => {
  try {
    const currMemberCart = await cartRepo.getUserCurrentCart(currMemberEmail);

    console.log("Curr Member: ", JSON.stringify(currMemberCart));
    return currMemberCart;
  } catch (err) {
    console.log(err);
  }
};

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

  console.log(quantity);
  if (isNaN(parseInt(quantity)) || parseInt(quantity) < 1) {
    quantity = 1;
  } else {
    console.log("Sending");
    await fetch(
      `http://localhost:3000/cart/add?user_id=655f9963f9cbae2c21c3bb60`,
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

  var prods = document.getElementById("products-container");
  var productContainer = button.closest(".deleted-product-container");
  var quant = {
    quantity: quantity,
  };
  productContainer.remove();
  await fetch(`http://localhost:3000/search?productId=${product}`).then(
    async (response) => {
      // console.log(response);
      response = await response.json();
      console.log(response);
      const productHTML = createProductHTML(response, quant);
      prods.innerHTML += productHTML;
    }
  );
  await fetch("http://localhost:3000/cart?user_id=655f9963f9cbae2c21c3bb60")
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
      email: currMemberEmail,
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
    await fetch(
      `http://localhost:3000/cart?user_id=655f9963f9cbae2c21c3bb60`,
      req
    ).then((res) => console.log(res));
    await fetch("http://localhost:3000/cart?user_id=655f9963f9cbae2c21c3bb60")
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

  await fetch(
    `http://localhost:3000/cart/remove?user_id=655f9963f9cbae2c21c3bb60&product_id=${productId}`,
    {
      method: "DELETE",
    }
  ).then((res) => console.log(res));

  var deletedContainer = document.getElementById("deleted-products-container");
  var productContainer = button.closest(".product-container");

  productContainer.remove();
  await fetch(`http://localhost:3000/search?productId=${productId}`).then(
    async (response) => {
      // console.log(response);
      response = await response.json();
      console.log(response);
      const productHTML = createDeletedProductHTML(response);
      deletedContainer.innerHTML += productHTML;
    }
  );
  await fetch("http://localhost:3000/cart?user_id=655f9963f9cbae2c21c3bb60")
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
                <p style="display: inline-block; margin-right: 10px;">Quantity: </p>
                <input type="number" class="display-number" value="${
                  currCartProduct.quantity
                }" oninput="changeNumber('${
    product._id
  }', this)" onkeyup="handleKeyPress(event, '${product._id}', this)">
                <button class= "delete-button" onclick="deleteProduct('${
                  product._id
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
      </div>
      <div class="add-to-cart-button">
          <button class= "add-button" onclick="addProductToCart('${
            product._id
          }', this)">Add Quantity</br> to Cart</button>
      </div>
      <div class="number-control">
          <input type="number" id='${
            product._id
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

  await fetch("http://localhost:3000/cart?user_id=655f9963f9cbae2c21c3bb60")
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

      for (let i = 0; i < data.products.length; i++) {
        const product = data.products[i];
        await fetch(
          `http://localhost:3000/search?productId=${product.product_id}`
        ).then(async (response) => {
          // console.log(response);
          response = await response.json();
          products.push(response);
          const productHTML = createProductHTML(response, product);
          productsContainer.innerHTML += productHTML;
        });
      }
      console.log(data);
      for (let i = 0; i < data.deletedProducts.length; i++) {
        const product = data.deletedProducts[i];
        await fetch(`http://localhost:3000/search?productId=${product}`).then(
          async (response) => {
            // console.log(response);
            response = await response.json();
            products.push(response);
            console.log(response);
            console.log(product);
            const productHTML = createDeletedProductHTML(response);
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
