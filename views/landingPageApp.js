document.addEventListener("DOMContentLoaded", () => {
    
    const productsContainer = document.getElementById("products-container");
    const products = [];

    //Search Button functionality
    const searchButton = document.querySelector('.search-bar .search-button');
    if (searchButton) {
        searchButton.addEventListener('click', async function() {
            const searchText = document.querySelector('.search-bar input[type="text"]').value; //get the text in the search bar
            fetch(`http://localhost:3000/search?productId=${searchText}`) //fetch requested product
            .then(response => response.json())
            .then(data => {
                console.log(data); 
                products.forEach((product) => { //remove all products from page
                    const productHTML = createProductHTML(product);
                    productsContainer.innerHTML -= productHTML;
                    products.pop();
                })
                products.push(data); //add new product and display it
                const productHTML = createProductHTML(data);
                productsContainer.innerHTML += productHTML;
            })
            .catch(error => {
                console.error(JSON.stringify({ error: 'Error fetching data!' }));
            });
        });
    }

    fetch('http://localhost:3000/')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // console.log('Response from /:', JSON.stringify(data, null, 2));

            data.forEach((product) => {
                // Push each product into the products array
                products.push(product);
                const productHTML = createProductHTML(product);
                productsContainer.innerHTML += productHTML;
            });
        })
        .catch(error => {
            console.error('Error fetching product data:', error);
        });

    function createProductHTML(product) {
        // Check if variant_data is empty
        let colorsHTML = '';
        if (product.variant_data.length > 0) {
            const variantData = JSON.parse(product.variant_data[0]);
            const colors = Object.values(variantData).flat();
            colorsHTML = `
                <p>Variants:</p>
                <ul>
                    ${colors.map((color) => `<li>${color}</li>`).join('')}
                </ul>
            `;
        }

        const productHTML = `
        <div class="product-container">
            <div class="product-image">
                <img src="${product.images[0].large}" alt="${product.name}" />
                <div class="image-navigation">
                    <button onclick="changeImage('${product._id}', -1, this)">Previous</button>
                    <button onclick="changeImage('${product._id}', 1, this)">Next</button>
                </div>
            </div>
            <div class="product-info">
                <h2>${product.name}</h2>
                <p>Price: ${product.price}</p>
                <p>Stars: ${product.stars}</p>
                <p>Features: ${product.rating_count}</p>
                <ul>
                    ${product.feature_bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
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
        const product = products.find(p => p._id === productId);

        let currentImageIndex = product.images.findIndex(image => image.large === productImage.src);

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
