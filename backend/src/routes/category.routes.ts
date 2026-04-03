import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
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
categoryRouter.post('/', authMiddleware, validate(createCategorySchema), createCategory);
categoryRouter.put('/:id', authMiddleware, validate(updateCategorySchema), updateCategory);
categoryRouter.delete('/:id', authMiddleware, deleteCategory);
