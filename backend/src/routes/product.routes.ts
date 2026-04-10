import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { optionalAuth } from '../middleware/optionalAuth.ts';
import { requireRole } from '../middleware/roleMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { createProductSchema, updateProductSchema } from '../utils/validation.ts';
import { uploadImage } from '../utils/multer.ts';
import {
  createProduct,
  getProducts,
  getProductById,
  getAdminProducts,
  updateProduct,
  deleteProduct,
  getRecommendedProducts,
} from '../controllers/product.controller.ts';

export const productRouter = express.Router();

// Public routes — no auth, all products visible (shop, home)
productRouter.get('/', getProducts);
productRouter.get('/recommendations', getRecommendedProducts);

// Admin-scoped route — authMiddleware guarantees req.user, always scoped to this admin's products
productRouter.get('/admin/mine', authMiddleware, requireRole('ADMIN'), getAdminProducts);

productRouter.get('/:id', optionalAuth, getProductById);
productRouter.post('/', authMiddleware, requireRole('ADMIN'), uploadImage.single('image'), validate(createProductSchema), createProduct);
productRouter.put('/:id', authMiddleware, requireRole('ADMIN'), uploadImage.single('image'), validate(updateProductSchema), updateProduct);
productRouter.delete('/:id', authMiddleware, requireRole('ADMIN'), deleteProduct);
