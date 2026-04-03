import type { Request, Response } from 'express';
import * as categoryService from '../services/category.service.ts';
import { isServiceError } from '../services/errors.service.ts';

const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  try {
    const category = await categoryService.createCategory(name);

    return res.status(201).json(category);
  } catch (error) {
    if (isServiceError(error)) {
      const serviceError = error as { statusCode: number; message: string };
      return res.status(serviceError.statusCode).json({ error: serviceError.message });
    }

    return res.status(500).json({ error: 'Failed to create category.' });
  }
};

const getParamId = (req: Request) => {
  const rawId = req.params.id;
  return typeof rawId === 'string' ? rawId : '';
};

const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await categoryService.getCategories();

    return res.json(categories);
  } catch (error) {
    if (isServiceError(error)) {
      const serviceError = error as { statusCode: number; message: string };
      return res.status(serviceError.statusCode).json({ error: serviceError.message });
    }

    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};

const getCategoryById = async (req: Request, res: Response) => {
  const id = getParamId(req);

  if (!id) {
    return res.status(400).json({ error: 'Invalid category id.' });
  }

  try {
    const category = await categoryService.getCategoryById(id);

    return res.json(category);
  } catch (error) {
    if (isServiceError(error)) {
      const serviceError = error as { statusCode: number; message: string };
      return res.status(serviceError.statusCode).json({ error: serviceError.message });
    }

    return res.status(500).json({ error: 'Failed to fetch category.' });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  const id = getParamId(req);
  const { name } = req.body as { name?: string };

  if (!id) {
    return res.status(400).json({ error: 'Invalid category id.' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  try {
    const updatedCategory = await categoryService.updateCategory(id, name);

    return res.json(updatedCategory);
  } catch (error) {
    if (isServiceError(error)) {
      const serviceError = error as { statusCode: number; message: string };
      return res.status(serviceError.statusCode).json({ error: serviceError.message });
    }

    return res.status(500).json({ error: 'Failed to update category.' });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  const id = getParamId(req);

  if (!id) {
    return res.status(400).json({ error: 'Invalid category id.' });
  }

  try {
    await categoryService.deleteCategory(id);

    return res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    if (isServiceError(error)) {
      const serviceError = error as { statusCode: number; message: string };
      return res.status(serviceError.statusCode).json({ error: serviceError.message });
    }

    return res.status(500).json({ error: 'Failed to delete category.' });
  }
};

export { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
