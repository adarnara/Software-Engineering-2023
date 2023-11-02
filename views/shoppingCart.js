
const currMemberEmail = "johndoes23@gmail.com";

const getCurrMemberCart = async () => {
  try {
    const currMemberCart = await cartRepo.getUserCurrentCart(currMemberEmail);
    

    console.log("Curr Member: ", JSON.stringify(currMemberCart));
    return currMemberCart;
    
  } catch (err) {
    console.log(err)
  }
};

document.addEventListener("DOMContentLoaded", () => {
  
  const productsContainer = document.getElementById("products-container");
  const products = [];
  const continueShoppingBtn = document.querySelector('.continue-shopping');
  if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', function() {
        // Redirect the user to the landing page
        window.location.href = 'http://127.0.0.1:5500/views/landingPage.html';
    });
}
  fetch("http://localhost:3000/cart?user_id=6532fa735eac7cbb50adc268")
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

      data.products.forEach(async (product) => {
        await fetch(`http://localhost:3000/search?productId=${product.product_id}`)
        .then(async (response) => {
          // console.log(response.json());
          response = await response.json();
          console.log(response);
          console.log(product);
          products.push(response);
          console.log(products);
          const productHTML = createProductHTML(response);
          productsContainer.innerHTML += productHTML;
        });
      });



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

  function createProductHTML(product) {
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
        </div>
    `;

    return productHTML;
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
