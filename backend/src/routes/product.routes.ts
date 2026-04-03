import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { createProductSchema, updateProductSchema } from '../utils/validation.ts';
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
productRouter.post('/', authMiddleware, uploadImage.single('image'), validate(createProductSchema), createProduct);
productRouter.put('/:id', authMiddleware, uploadImage.single('image'), validate(updateProductSchema), updateProduct);
productRouter.delete('/:id', authMiddleware, deleteProduct);
