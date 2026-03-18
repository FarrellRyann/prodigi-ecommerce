const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadImage } = require('../utils/multer');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

const productRouter = express.Router();

productRouter.get('/', getProducts);
productRouter.get('/:id', getProductById);
productRouter.post('/', authMiddleware, uploadImage.single('image'), createProduct);
productRouter.put('/:id', authMiddleware, uploadImage.single('image'), updateProduct);
productRouter.delete('/:id', authMiddleware, deleteProduct);

module.exports = { productRouter };

export {};
