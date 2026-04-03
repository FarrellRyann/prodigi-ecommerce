import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
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
categoryRouter.post('/', authMiddleware, createCategory);
categoryRouter.put('/:id', authMiddleware, updateCategory);
categoryRouter.delete('/:id', authMiddleware, deleteCategory);
