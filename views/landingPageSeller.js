
function checkPos(quantity) {
    console.log(quantity.value)
    if (quantity.value < 1)
        quantity.value = 1;
}

/**
 * Checks if the user is signed in. If the user is signed in, this
 * function will return the username of the user to display in the
 * top right corner of the screen (replacing the sign in button)
 */
function checkSignedIn() {
    let token = sessionStorage.getItem("token");
    if (token) {
        // don't qualify domain; this will break if server is hosted
        // non-locally or on a different port.
        fetch("/token", {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        }).then(response => {
            console.log(`Response`);
            console.log(response);
            if (response.headers.get("Content-Type") === "application/json") {
                response.json().then(x => {
                    console.log("Body:");
                    console.log(x);
                });
            }
        }).catch(err => console.error(err));

        // modify the DOM, specifically at a `<div>` element with:
        // getElementById("sign-in-user")

    } else {
        return false;
    }
}
function getCookie(cookieName) {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName + "=")) {
            return cookie.substring(cookieName.length + 1);
        }
    }

    return null;
}

document.addEventListener("DOMContentLoaded", () => {

    const productsContainer = document.getElementById("products-container");
    const products = [];
    let currentEditProduct = '';

    // Find out if the user is signed in.
    checkSignedIn();
    displaySellerProducts();

    //Set up event listener for search bar.
    const searchButton = document.querySelector('.search-bar .search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            currentPage = 1
            const searchText = document.querySelector('.search-bar input[type="text"]').value;
            const pattern = /^(books|ipad|tshirts|laptop)\d*$/;
            if (pattern.test(searchText)) { //only continues if the search was valid
                currentSearchText = searchText; // Store the current search text
                searchProducts(searchText);
            } else {
                var errorMessage = document.getElementById('error-message');
                errorMessage.classList.remove('hidden');
                productsContainer.innerHTML = ''; //Clear the products container
                products.length = 0; //Reset the products array
            }
        });
    }
    //Searches for and displays requested products
    function searchProducts(searchText) {
        currentSearchText = searchText; //stores in global variable so that it can be accessed in next and previous method
        let url = '';
        if (['books', 'ipad', 'laptop', 'tshirts'].includes(searchText.toLowerCase())) {
            url = `http://localhost:3000/search/category?name=${searchText}&page=${currentPage}&pageSize=${pageSize}`; //searching by category
        } else {
            url = `http://localhost:3000/search?productId=${searchText}`; //searching for specific product
        }
        fetch(url) //Fetch requested product(s)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                lastFetchedProductCount = data.length;
                let singleSearch = false;

                productsContainer.innerHTML = ''; //Clear the products container
                products.length = 0; //Reset the products array

                if (Array.isArray(data)) { //add new products and display
                    data.forEach((product) => {
                        products.push(product);
                        productsContainer.innerHTML += createProductHTML(product);
                    });
                } else { //add single product and display
                    singleSearch = true;
                    products.push(data)
                    productsContainer.innerHTML += createProductHTML(data);
                }

                //logic to hide or reveal next/previous button when searching
                const prevButton = document.querySelector('.previous-button');
                const nextButton = document.querySelector('.next-button');
                if (!singleSearch) {
                    if (prevButton) {
                        prevButton.classList.toggle('hidden', currentPage === 1); //hide previous button if on the first page
                    }
                    if (nextButton) {
                        //hide next button if the amount of products found is less then the page can fit (meaning theres no more products to display on the next page)
                        nextButton.classList.toggle('hidden', lastFetchedProductCount < pageSize);
                    }
                } else {
                    prevButton.classList.toggle('hidden', true);
                    nextButton.classList.toggle('hidden', true);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    function displaySellerProducts(){
        authorize('http://localhost:3000/seller')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            productsContainer.innerHTML = ''; //Clear the products container
            products.length = 0; //Reset the products array
            if(!Array.isArray(data)){
                // display HTML to say no products
            }
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
    }
    

    //event listener for create product button
    document.getElementById("createProductBtn").addEventListener("click", function() {
        document.getElementById("productModal").style.display = 'block';
    });
    
   //modal pop up for creating product
    var modal = document.getElementById("productModal");
    var btn = document.getElementById("createProductBtn");
    var span = document.getElementsByClassName("close")[0];
    btn.onclick = function() { //clicked create button
        modal.style.display = "block";
    }
    span.onclick = function() { //clicked X button
        modal.style.display = "none";
    }
    window.onclick = function(event) { //clicked off of modal pop up
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    //event listener for create submit button
    const form = document.getElementById('productForm');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const productData = await createProductJSON();
        authorize('http://localhost:3000/seller/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Result:', data);
            displaySellerProducts();
        })
        .catch(error => {
            console.error('Error:', error);
        });
        modal.style.display = "none";
    });
    
    //create a product JSON based on the currently inputted parameters. 
    async function createProductJSON() {
        let productData = {};
        const selectedProductType = document.getElementById('productType').value;
    
        try {
            const response = await authorize(`http://localhost:3000/search/categoryLargest?category=${selectedProductType}`); //gets the id of the last product in the categoru
            const largestId = await response.json() + 1; //add one to largest id to get new unique id
            const fullId = selectedProductType + largestId; //combine category name and id number

            // Initialize productData with default values
            productData = {
                "category": fullId,
                "name": document.getElementById('productName').value,
                "price": document.getElementById('productPrice').value,
                "stars": document.getElementById('stars').value,
                "rating_count": document.getElementById('ratingCount').value,
                "feature_bullets": [],
                "images": [],
                "variant_data": [],
                "seller_data": {
                    "company": "",
                    "bio": "",
                    "website": "",
                    "phone": "",
                    "email": "",
                    "firstName": "",
                    "lastName": "",
                    "warehouse_address": {
                        "street1": "",
                        "street2": "",
                        "street3": "",
                        "city": "",
                        "state": "",
                        "zip": "",
                        "country": "",
                    },
                },
                "length": Math.floor((Math.random() * 400 + 100)) / 100,
                "width": Math.floor((Math.random() * 400 + 100)) / 100,
                "height": Math.floor((Math.random() * 400 + 100)) / 100,
                "distance_unit": "in",
                "weight": Math.floor((Math.random() * 400 + 100)) / 100,
                "mass_unit": "lb",
            };

            //handle image files
            const imageFiles = document.getElementById('images').files;
            if (imageFiles) {
                for (let i = 0; i < imageFiles.length; i++) {
                    const base64String = await readFileAsDataURL(imageFiles[i]);
                    productData.images.push({
                        hiRes: null,
                        thumb: null,
                        large: base64String,
                        main: [null],
                        variant: null,
                        lowRes: null,
                        shoppableScene: null,
                    });
                }
            } else {
                console.log("There were no images input.");
            }
    
            //handling feature bullets -> assuming featureBullets is a comma-separated input
            const featureBulletInputs = document.getElementById('featureBullets').value.split(',');
            productData.feature_bullets = featureBulletInputs.map(bullet => bullet.trim());
    
            //variant data similar to feature bullets
            const variantDataInputs = document.getElementById('variantData').value.split(',');
            productData.variant_data = variantDataInputs.map(variant => variant.trim());
    
            return productData;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
    
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => resolve(event.target.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }
    
    

    function createProductHTML(product) {
        //check if variant_data is empty
        let colorsHTML = '';
        if (product.variant_data.length > 0) {
            // try {
            //     //attempt to parse the first item as JSON
            //     const variantData = JSON.parse(product.variant_data[0]);
            //     const colors = Object.values(variantData).flat();
            //     colorsHTML = `
            //         <p>Variants:</p>
            //         <ul>
            //             ${colors.map(color => `<li>${color}</li>`).join('')}
            //         </ul>
            //     `;
            // } catch (error) {
                //if JSON.parse fails, handle variant_data as an array of strings (this is what it is like when you create a new product as a seller)
                colorsHTML = `
                    <p>Variants:</p>
                    <ul>
                        ${product.variant_data.map(variant => `<li>${variant}</li>`).join('')}
                    </ul>
                `;
            // }
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
                <p>Price: $${product.price}</p>
                <p>Stars: ${product.stars}</p>
                <p>Ratings: ${product.rating_count}</p>
                <p>Features:</p>
                <ul>
                    ${product.feature_bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
                </ul>
                ${colorsHTML}
            </div>
            <div class="add-to-cart-button">
                <button class= "delete-button" onclick="deleteProduct('${product._id}')">Delete Product</button>
            </div>
            <div class="add-to-cart-button">
                <button class= "edit-button" onclick="editProduct('${product._id}')">Edit Product</button>
            </div>
        </div>
    `;
        return productHTML;
    }
    window.deleteProduct = deleteProduct;
    window.editProduct = editProduct;

    function deleteProduct(product){
        authorize('http://localhost:3000/seller/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        })
        .then(response => response.json())
        .then(data => {
            displaySellerProducts();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    //modal pop up for editing product
    var editmodal = document.getElementById("editModal");
    var editspan = document.getElementsByClassName("editclose")[0];
    editspan.onclick = function() { //clicked X button
        editmodal.style.display = "none";
    }
    window.onclick = function(event) { //clicked off of modal pop up
        if (event.target == editmodal) {
            editmodal.style.display = "none";
        }
    }

    function editProduct(productId){
        editmodal.style.display = "block";
        currentEditProduct = productId;
    }

    //event listener for EDIT submit button
    const editform = document.getElementById('editForm');
    editform.addEventListener('submit', async function(event) {
        event.preventDefault();
        const editFormData = await getEditFormInputs(currentEditProduct);
        authorize('http://localhost:3000/seller/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editFormData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Result:', data);
            displaySellerProducts();
        })
        .catch(error => {
            console.error('Error:', error);
        });
        editmodal.style.display = "none";
    });

    async function getEditFormInputs(){
        formData = {
            "_id": currentEditProduct,
            "name": document.getElementById('editproductName').value,
            "price": document.getElementById('editproductPrice').value,
            "stars": document.getElementById('editstars').value,
            "rating_count": document.getElementById('editratingCount').value,
            "feature_bullets": [],
            "images": [],
            "variant_data": [],
        };

        //handle image files
        const editimageFiles = document.getElementById('editimages').files;
        if (editimageFiles) {
            for (let i = 0; i < editimageFiles.length; i++) {
                const base64String = await readFileAsDataURL(editimageFiles[i]);
                formData.images.push({
                    hiRes: null,
                    thumb: null,
                    large: base64String,
                    main: [null],
                    variant: null,
                    lowRes: null,
                    shoppableScene: null,
                });
            }
        } else {
            console.log("There were no images input.");
        }

        //handling feature bullets -> assuming featureBullets is a comma-separated input
        const featureBulletInputs = document.getElementById('editfeatureBullets').value.split(',');
        formData.feature_bullets = featureBulletInputs.map(bullet => bullet.trim());

        //variant data similar to feature bullets
        const variantDataInputs = document.getElementById('editvariantData').value.split(',');
        formData.variant_data = variantDataInputs.map(variant => variant.trim());

        return formData;
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
    window.addProductToCart = addProductToCart;

    const currMemberEmail = "mm3201@scarletmail.rutgers.edu";
    function addProductToCart(product) {

        let quantity = document.getElementById(product).value;

        console.log(quantity);
        if (
            isNaN(parseInt(quantity)) ||
            parseInt(quantity) < 1
        ) {
            quantity = 1;
        } else {
            console.log("Sending")
            fetch(`http://localhost:3000/cart/add?user_id=655f9963f9cbae2c21c3bb60`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quantity: parseInt(quantity),
                    email: currMemberEmail,
                    product_id: product
                })
            }).then(res => console.log(res))
        }



    }

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


        document.getElementById("shopping-icon").appendChild(profileButton);

        const logoutButton = document.createElement("button");
        logoutButton.className = "go-to-page-button";
        logoutButton.innerHTML = '<img src="../public/Images/logout-button-again.png" alt="Logout" />';
        logoutButton.onclick = logout;

        document.getElementById("shopping-icon").appendChild(logoutButton);
    }
}

// Set up the web page
setup();
