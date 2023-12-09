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
    const searchButton = document.querySelector('.search-bar .search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            performSearch(searchInput.value.trim());
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

    function performSearch(searchText) {
        if (!searchText) {
            alert('No results found.');
            return;
        }
        currentSearchText = searchText;
        const url = `http://localhost:3000/search/?searchText=${searchText}&page=${currentPage}&pageSize=${pageSize}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                updateProductDisplay(data);
            })
            .catch(error => {
                console.error('Search Error:', error);
                alert('No results found.');
                return;
            });
        let url2 = `http://localhost:3000/search/?searchText=${searchText}&page=${currentPage}&pageSize=${pageSize + 1}`;
        fetch(url2)
            .then(response => response.json())
            .then(data => {
                updateProductDisplay(data);
            })
            .catch(error => {

                nextButton.classList.toggle('hidden');
            });
    }

    function updateProductDisplay(data) {
        if (!data.length) {
            alert('No results found.');
            return;
        }
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
        if (nextButton) {
            nextButton.classList.toggle('hidden', fetchedCount < pageSize);
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

function navigateToPage(route) {
    // Use window.location to navigate to the desired page
    window.location.href = route;
}
// Set up the web page
setup();

