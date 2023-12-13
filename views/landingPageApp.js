function checkPos(quantity) {
    console.log(quantity.value)
    if (quantity.value < 1) quantity.value = 1;
}

/**
 * Checks if the user is signed in. If the user is signed in, this
 * function will return the username of the user to display in the
 * top right corner of the screen (replacing the sign in button)
 */
function checkSignedIn() {
    let token = getJwtToken();
    if (token) {
        // don't qualify domain; this will break if server is hosted
        // non-locally or on a different port.
        checkToken().then(function checkResponse(body) {
            console.info("The user is signed in!");
            console.info(body)
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
    let currentSearchText = '';
    let currentPage = 1;

    const pageSize = 5;

    const searchInput = document.getElementById('searchInput');
    const searchResultsElement = document.getElementById('searchResults');


    let lastFetchedProductCount = 0; //how many products we're fetched last


//    const categoryLinks = document.querySelectorAll('.category-dropdown a');
//     categoryLinks.forEach(link => {
//     link.addEventListener('click', (event) => {
//       event.preventDefault(); // Prevent the default anchor action
//       const category = link.getAttribute('data-category'); // Get the category from data attribute
//       categoryButton.textContent = category + ' ▼';
//       searchProducts(category); //calls search function with the category
//     });
//   });

const categoryButton = document.querySelector('.category-button');
    const categoryLinks = document.querySelectorAll('.category-dropdown a');

    categoryLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default anchor action
            const category = link.textContent; // Get the category from link text
            categoryButton.textContent = category + ' ▼'; // Change button text and add the dropdown arrow symbol
            searchProducts(category.toLowerCase()); // Call the search function with the category
        });
    });
  
    //Set up event listener for search bar.
    const searchButtonTwo = document.querySelector('.search-bar .search-button');
    if (searchButtonTwo) {
        searchButtonTwo.addEventListener('click', function() {
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
            url = `http://localhost:3000/filter/category?name=${searchText}&page=${currentPage}&pageSize=${pageSize}`; //searching by category
        } else {
            url = `http://localhost:3000/filter?productId=${searchText}`; //searching for specific product
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

    
    



    window.nextPage = function() { //go to next page
        currentPage += 1;
        searchProducts(currentSearchText);
    };


    searchResultsElement.style.display = 'none';

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

    // Event listener for autocomplete
    searchInput.addEventListener('input', function () {
        const searchText = searchInput.value.trim();
        if (searchText) {
            fetchAutocompleteSuggestions(searchText);
        } else {
            searchResultsElement.innerHTML = '';
            searchResultsElement.style.display = 'none';
        }
    });

    // Set up event listener for search bar.
     // Update the event listener for the search button
     const searchButton = document.querySelector('.search-bar .search-button');
     if (searchButton) {
         searchButton.addEventListener('click', function () {
             const searchText = searchInput.value.trim();
             if (!searchText) {
                 alert('Please enter a search term.');
                 return; // Avoid calling performSearch with empty input
             }
             performSearch(searchText, function() {
                 searchInput.value = ''; 
                 searchResultsElement.innerHTML = '';
                 searchResultsElement.style.display = 'none';
             });
         });
     }
     

    window.nextPage = function () {
        if (currentSearchText) {
            currentPage++;
            performSearch(currentSearchText);
        }
    };

    window.previousPage = function () {
        if (currentPage > 1 && currentSearchText) {
            currentPage--;
            performSearch(currentSearchText);
        }
    };

    async function fetchAutocompleteSuggestions(searchText) {
        try {
            const response = await fetch(`http://localhost:3000/autocomplete?searchText=${searchText}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            displayAutocompleteResults(data);
        } catch (error) {
            console.error('Autocomplete Error:', error);
            searchResultsElement.innerHTML = '';
            searchResultsElement.style.display = 'none';
        }
    }

    function displayAutocompleteResults(results) {
        var searchResultsElement = document.getElementById('searchResults');
        searchResultsElement.innerHTML = "";
        searchResultsElement.style.display = 'block';

        results.forEach(result => {
            var resultElement = document.createElement('p');
            resultElement.textContent = result.name;
            resultElement.onclick = function () {
                addSelectedResult(result.name);
                document.getElementById('searchInput').value = ''; // Clear the search bar
                searchResultsElement.innerHTML = ''; // Clear autocomplete results
                searchResultsElement.style.display = 'none';
            };
            searchResultsElement.appendChild(resultElement);
        });
    }


    function addSelectedResult(name) {
        const selectedResultsContainer = document.getElementById('searchResults');
        console.log(selectedResultsContainer);
        const newInput = document.createElement('div');
        newInput.className = 'selected-result';
        newInput.textContent = name;
        newInput.onclick = function () {
            selectedResultsContainer.removeChild(newInput);
        };
        selectedResultsContainer.appendChild(newInput);

        // Fetch exact product info when a selection is made
        fetchExactProductInfo(name);
        const prevButton = document.querySelector('.previous-button');
        const nextButton = document.querySelector('.next-button');
        if (prevButton) prevButton.classList.add('hidden');
        if (nextButton) nextButton.classList.add('hidden');
    }






    function fetchExactProductInfo(productName) {
        productName = productName.replace(/\+/g, "%2B");
        console.log(productName);
        fetch(`http://localhost:3000/exactName?searchText=${productName}`)
            .then(response => response.json())
            .then(productInfo => {
                productsContainer.innerHTML = createProductHTML(productInfo);
            })
            .catch(error => console.error('Exact Product Fetch Error:', error));
    }

    function performSearch(searchText, callback) {
        if (!searchText.trim()) {
            alert('Please enter a search term.');
            return; // Return here to avoid altering the product display
        }
    
        currentSearchText = searchText;
        const url = `http://localhost:3000/search/?searchText=${searchText}&page=${currentPage}&pageSize=${pageSize}`;
    
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    alert('No results found.');
                    // Do not clear the products container if no results are found
                    // productsContainer.innerHTML = 'No products found.';
                    updateNavigationButtons(0);
                } else {
                    updateProductDisplay(data);
                    checkNextPageData(searchText, currentPage + 1);
                }
                if (callback && typeof callback === 'function') {
                    callback();
                }
            })
            .catch(error => {
                console.error('Search Error:', error);
            });
    }
    
   

    

    function checkNextPageData(searchText, nextPage) {
        const nextPageUrl = `http://localhost:3000/search/?searchText=${searchText}&page=${nextPage}&pageSize=${pageSize}`;
        fetch(nextPageUrl)
            .then(response => response.json())
            .then(nextPageData => {
                const nextButton = document.querySelector('.next-button');
                if (nextButton) {
                    nextButton.classList.toggle('hidden', !nextPageData.length);
                }
            })
            .catch(error => console.error('Next Page Check Error:', error));
    }
    
    function updateProductDisplay(data) {
        productsContainer.innerHTML = '';
        data.forEach(product => {
            productsContainer.innerHTML += createProductHTML(product);
        });
        updateNavigationButtons(data.length);
    }
    
    function updateNavigationButtons(fetchedCount) {
        const prevButton = document.querySelector('.previous-button');
        const nextButton = document.querySelector('.next-button');
    
        if (prevButton) {
            prevButton.classList.toggle('hidden', currentPage === 1);
        }
    }

    function createProductHTML(product) {
        //check if variant_data is empty
        let colorsHTML = '';
        if (product.variant_data.length > 0) {
            try {
                //first attempt to parse the first item as JSON
                const variantData = JSON.parse(product.variant_data[0]);
                const colors = Object.values(variantData).flat();
                colorsHTML = `
                    <p>Variants:</p>
                    <ul>
                        ${colors.map(color => `<li>${color}</li>`).join('')}
                    </ul>
                `;
            } catch (error) {
                //if JSON.parse fails, handle variant_data as an array of strings (this is what it is like when you create a new product as a seller)
                colorsHTML = `
                    <p>Variants:</p>
                    <ul>
                        ${product.variant_data.map(variant => `<li>${variant}</li>`).join('')}
                    </ul>
                `;
            }
        }

        const productHTML = `
        <div class="product-container">
            <div class="product-image">
                <img src="${product.images[0].large}" alt="${product.name}" />
                <div class="image-navigation">
                    <button onclick="changeImage('${product.category}', -1, this)">Previous</button>
                    <button onclick="changeImage('${product.category}', 1, this)">Next</button>
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
            <div class="add-to-cart-button">
                <button class= "add-button" onclick="addProductToCart('${product.category}')">Add to Cart</button>
            </div>
            <div class="number-control">
                <input type="number" id='${product.category}' onclick="checkPos(this)" class="display-number" value="1">
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
    window.addProductToCart = addProductToCart;

    async function addProductToCart(product) {
        let quantity = document.getElementById(product).value;
        console.log(quantity);
        if (
            isNaN(parseInt(quantity)) ||
            parseInt(quantity) < 1
        ) {
            quantity = 1;
        } else {
            console.log("Sending")
            authorize(`http://localhost:3000/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quantity: parseInt(quantity),
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
        profileButton.onclick = function () {
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
