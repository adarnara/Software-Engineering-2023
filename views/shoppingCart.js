
const currMemberEmail = "johndoes@gmail.com";

const getCurrMemberCart = async () => {
  try {
    const currMemberCart = await cartRepo.getUserCurrentCart(currMemberEmail);


    console.log("Curr Member: ", JSON.stringify(currMemberCart));
    return currMemberCart;

  } catch (err) {
    console.log(err)
  }
};

function proceedToCheckout() {
  console.log("hi");
  const confirmation = confirm("Are you sure you want to proceed to checkout?");

  if (confirmation) {
    window.location.href = "checkout/checkoutPage.html";
  }
}

function continueShopping()
{
  window.location.href = 'http://127.0.0.1:5500/views/landingPage.html';

}
function handleKeyPress(event, productId, inputElement) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent the default form submission
    changeNumber(productId, inputElement);
  }
}

async function changeNumber(productId, displayNumber) {
  console.log(productId);
  console.log(parseInt(displayNumber.value))
  if (isNaN(parseInt(displayNumber.value)) || parseInt(displayNumber.value) < 0) {
    displayNumber.value = 0;
  } else {
    await fetch(`http://localhost:3000/cart?user_id=6532fa735eac7cbb50adc268`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quantity: parseInt(displayNumber.value),
        email: currMemberEmail,
        product_id: productId
      })
    }).then(res => console.log(res))
    // location.reload();
  }
}
async function deleteProduct(productId) {

  console.log(productId)

  await fetch(`http://localhost:3000/cart/remove?user_id=6532fa735eac7cbb50adc268&product_id=${productId}`,
    {
      method: 'DELETE'
    }
  ).then(res => console.log(res))

  location.reload();

}

document.addEventListener("DOMContentLoaded", async () => {


  const productsContainer = document.getElementById("products-container");
  const products = [];

  await fetch("http://localhost:3000/cart?user_id=6532fa735eac7cbb50adc268")
    .then((response) => {
      console.log("***********************************************************************");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // console.log(response.json());
      return response.json();
    })
    .then(async (data) => {
      console.log('hi');
      console.log("Response from /:", JSON.stringify(data, null, 2));
      data.products.sort((product1, product2) => product1.product_id - product2.product_id);

      for (let i = 0; i < data.products.length; i++) {
        const product = data.products[i];
        await fetch(`http://localhost:3000/search?productId=${product.product_id}`)
          .then(async (response) => {
            // console.log(response);
            response = await response.json();
            console.log(response);
            console.log(product);
            products.push(response);
            console.log(products);
            const productHTML = createProductHTML(response, product);
            productsContainer.innerHTML += productHTML;
          });
      }

      // data.products.forEach(async (product) => {
      //   console.log(product.product_id);
      //   await fetch(`http://localhost:3000/search?productId=${product.product_id}`)
      //     .then(async (response) => {
      //       // console.log(response);
      //       response = await response.json();
      //       console.log(response);
      //       console.log(product);
      //       products.push(response);
      //       console.log(products);
      //       const productHTML = createProductHTML(response, product);
      //       productsContainer.innerHTML += productHTML;
      //     });
      // });
      const subtotalHTML = createSubTotalHTML(data);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = subtotalHTML.trim();

      const subtotalSection = tempDiv.firstChild;
      subtotalSection.id = "subtotal-section";
      productsContainer.parentNode.appendChild(subtotalSection);



      // console.log(data.products);
      //       data.products.forEach(async (product) => {

      //         await fetch(`http://localhost:3000/search?productId=${product.product_id}`)
      //                 .then((response) => {
      //                   console.log(response);
      //                   if (!response.ok) {
      //                     throw new Error(`Uh Oh: ${response.status}`);
      //                   }

      //                   console.log(product);
      //                   products.push(product);

      //                 });




      // //            url = `http://localhost:3000/search?productId=${searchText}`; //searching for specific product





      //         // const productHTML = createProductHTML(product);
      //         // productsContainer.innerHTML += productHTML;
      //       });



      // data.forEach((product) => {
      //   // Push each product into the products array
      //   products.push(product);
      //   const productHTML = createProductHTML(product);
      //   productsContainer.innerHTML += productHTML;
      // });
    })
    .catch((error) => {
      console.error("Error fetching product data:", error);
    });
  

  function createProductHTML(product, currCartProduct) {
    // Check if variant_data is empty
    let colorsHTML = "";
    console.log(product.name);
    console.log(typeof product);
    console.log(product.variant_data);
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
    console.log(product.images);
    const productHTML = `
          <div class="product-container">
              <div class="product-image">
                  <img src="${product.images[0].large}" alt="${product.name}" />
                  <div class="image-navigation">
                      <button onclick="changeImage('${product._id
      }', -1, this)">Previous</button>
                      <button onclick="changeImage('${product._id
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
                  <input type="number" class="display-number" value="${currCartProduct.quantity}" oninput="changeNumber('${product._id}', this)" onkeyup="handleKeyPress(event, '${product._id}', this)">
                  <button class= "delete-button" onclick="deleteProduct('${product._id}')">Remove Item From Cart</button>
                  </div>
              </div>
          </div>
      `;
    console.log(product._id)
    console.log("ooga")
    return productHTML;
  }

  function createSubTotalHTML(data) {
    // Check if variant_data is empty
    console.log("subtotal")
    const emptyCart = `<div class="empty-cart">
      <h1>Your cart is empty!</h1>
      
      <div>
      <button class= "continue-shopping-main" onclick="continueShopping()">Continue Shopping</button>
    </div>
  </div>
      `

    const subtotalHTML = `<div class="subtotal">
      <h1>Subtotal</h1>
      <br>
      <h2>Price: $${data.totalPrice.toFixed(2)}</h2>
      <div>
      <button class="checkout" onclick="proceedToCheckout()">Proceed to Checkout</button>
    </div>
  </div>
      `;
    if (data.products.length == 0) {
      return emptyCart;
    }
    return subtotalHTML;
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
});
