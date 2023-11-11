const ProductRepository = require('../Repository/ProductRepo');

class ProductController {
  // ... other methods ...

  async getAllProductsForLanding(req, res) {
    try {
      const products = await ProductRepository.getAll();

      // Shuffle the products using Fisher-Yates algorithm
      const shuffledProducts = shuffle(products);

      // Keep 20 randomly chosen items from the shuffled array
      const sectionSize = 7;
      const sectionOfShuffledProducts = getRandomItems(shuffledProducts, sectionSize);

      res.status(200).json(sectionOfShuffledProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products for the landing page." });
    }
  }

  async getExactProduct(req,res) {
    try {
      const productId = req.query.productId;
      const product = await ProductRepository.getProductById(productId);
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch specified product.' });
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const category = req.query.name;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 5;
      const products = await ProductRepository.getProductsByCategory(category, page, pageSize);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch category.' });
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
