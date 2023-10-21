const ProductRepository = require('../Repository/ProductRepo');

class ProductController {
  // ... other methods ...

  async getAllProductsForLanding() {
    try {
      const products = await ProductRepository.getAll();

      // Shuffle the products using Fisher-Yates algorithm
      const shuffledProducts = shuffle(products);

      // Keep 20 randomly chosen items from the shuffled array
      const sectionSize = 20;
      const sectionOfShuffledProducts = getRandomItems(shuffledProducts, sectionSize);

      return sectionOfShuffledProducts;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductController();

// Fisher-Yates shuffle algorithm
function shuffle(arr) {
  var i = arr.length, j, temp;
  while (--i > 0) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
  return arr;
}

// Function to get 20 randomly chosen items from an array
function getRandomItems(arr, count) {
  if (arr.length <= count) {
    return arr;
  }

  const shuffled = arr.slice(); //create a copy to avoid memory errors
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
