import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { uploadImage } from '../utils/multer.ts';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.ts';

export const productRouter = express.Router();

productRouter.get('/', getProducts);
productRouter.get('/:id', getProductById);
productRouter.post('/', authMiddleware, uploadImage.single('image'), createProduct);
productRouter.put('/:id', authMiddleware, uploadImage.single('image'), updateProduct);
productRouter.delete('/:id', authMiddleware, deleteProduct);
