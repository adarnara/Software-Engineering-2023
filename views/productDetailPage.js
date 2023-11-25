document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');

    fetch(`http://localhost:3000/search?productId=${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }
            return response.json();
        })
        .then(product => {
            console.log("Fetched product data:",product);
            displayProductDetails(product);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('product-detail-container').innerHTML = `Error loading product details: ${error.message}`;
        });
});

function displayProductDetails(product) {
    const container = document.getElementById('product-detail-container');
    
    let featuresHTML = product.features && product.features.length > 0 
        ? `<ul>${product.features.map(f => `<li>${f}</li>`).join('')}</ul>` 
        : '<p>No features available.</p>';

    let variantsHTML = product.variants && product.variants.length > 0 
        ? `<ul>${product.variants.map(v => `<li>${v}</li>`).join('')}</ul>` 
        : '<p>No variants available.</p>';

    
    if (product.features && product.features.length > 0) {
        featuresHTML = `<ul>${product.features.map(feature => `<li>${feature}</li>`).join('')}</ul>`;
    } else {
        featuresHTML = '<p>No features available.</p>';
    }

    
    if (product.variants && product.variants.length > 0) {
        variantsHTML = `<ul>${product.variants.map(variant => `<li>${variant}</li>`).join('')}</ul>`;
    } else {
        variantsHTML = '<p>No variants available.</p>';
    }

    
    container.innerHTML = `
    <h2>${product.name}</h2>
    <p class="product-detail"><strong>Price:</strong> ${product.price || 'Not available'}</p>
    <p class="product-detail"><strong>Stars:</strong> ${product.stars || 'Not rated'}</p>
    <p class="product-detail"><strong>Rating Count:</strong> ${product.rating_count || 'No ratings'}</p>
    <h3>Features:</h3>
    ${featuresHTML}
    <h3>Variants:</h3>
    ${variantsHTML}
    <!-- Add more product details as needed -->
`;
}