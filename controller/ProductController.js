const ProductRepository = require('/repository/ProductRepo');

class ProductController {

  async getAllProducts(req, res) {
    try {
      const products = await ProductRepository.getAll();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products." });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await ProductRepository.getById(req.params.id);
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ message: "Product not found." });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product." });
    }
  }

  // Other methods for create, update, delete, etc.
}

module.exports = new ProductController();