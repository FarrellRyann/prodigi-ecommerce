import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { requireRole } from '../middleware/roleMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { createCategorySchema, updateCategorySchema } from '../utils/validation.ts';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.ts';

export const categoryRouter = express.Router();

categoryRouter.get('/', getCategories);
categoryRouter.get('/:id', getCategoryById);
categoryRouter.post('/', authMiddleware, requireRole('ADMIN'), validate(createCategorySchema), createCategory);
categoryRouter.put('/:id', authMiddleware, requireRole('ADMIN'), validate(updateCategorySchema), updateCategory);
categoryRouter.delete('/:id', authMiddleware, requireRole('ADMIN'), deleteCategory);
