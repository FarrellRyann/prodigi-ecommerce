import type { Request, Response } from 'express';
import * as productService from '../services/product.service.ts';
import { isServiceError } from '../services/errors.service.ts';

type ProductPayload = {
  categoryId?: string;
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  imageUrl?: string | null;
};

const validateNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value);
const parseNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }

  return Number.NaN;
};

const getParamId = (req: Request) => {
  const rawId = req.params.id;
  return typeof rawId === 'string' ? rawId : '';
};

const createProduct = async (req: Request, res: Response) => {
  const { categoryId, name, description, price, stock, imageUrl } = req.body as ProductPayload;
  const requestWithFile = req as Request & { file?: Express.Multer.File };

  if (!categoryId || !name?.trim()) {
    return res.status(400).json({ error: 'categoryId and name are required.' });
  }

  const parsedPrice = parseNumber(price);
  const parsedStock = parseNumber(stock);

  if (!validateNumber(parsedPrice) || !validateNumber(parsedStock)) {
    return res.status(400).json({ error: 'price and stock must be valid numbers.' });
  }

  const safePrice = parsedPrice;
  const safeStock = parsedStock;
  const uploadedImageUrl = requestWithFile.file ? `/uploads/${requestWithFile.file.filename}` : undefined;

  if (safePrice < 0 || safeStock < 0) {
    return res.status(400).json({ error: 'price and stock cannot be negative.' });
  }

  try {
    const product = await productService.createProduct({
      categoryId,
      name,
      description: description ?? null,
      price: safePrice,
      stock: safeStock,
      imageUrl: uploadedImageUrl ?? imageUrl ?? null,
    });

    return res.status(201).json(product);
  } catch (error) {
    if (isServiceError(error)) {
      const serviceError = error as { statusCode: number; message: string };
      return res.status(serviceError.statusCode).json({ error: serviceError.message });
    }

    return res.status(500).json({ error: 'Failed to create product.' });
  }
};

const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await productService.getProducts();

    return res.json(products);
  } catch (error) {
    if (isServiceError(error)) {
      const serviceError = error as { statusCode: number; message: string };
      return res.status(serviceError.statusCode).json({ error: serviceError.message });
    }

    return res.status(500).json({ error: 'Failed to fetch products.' });
  }
};

const getProductById = async (req: Request, res: Response) => {
  const id = getParamId(req);

  if (!id) {
    return res.status(400).json({ error: 'Invalid product id.' });
  }

  try {
    const product = await productService.getProductById(id);

    return res.json(product);
  } catch (error) {
    if (isServiceError(error)) {
      const serviceError = error as { statusCode: number; message: string };
      return res.status(serviceError.statusCode).json({ error: serviceError.message });
    }

    return res.status(500).json({ error: 'Failed to fetch product.' });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  const id = getParamId(req);
  const { categoryId, name, description, price, stock, imageUrl } = req.body as ProductPayload;
  const requestWithFile = req as Request & { file?: Express.Multer.File };

  if (!id) {
    return res.status(400).json({ error: 'Invalid product id.' });
  }

  const hasPriceField = price !== undefined;
  const hasStockField = stock !== undefined;
  const parsedPrice = hasPriceField ? parseNumber(price) : undefined;
  const parsedStock = hasStockField ? parseNumber(stock) : undefined;

  if (hasPriceField) {
    if (!validateNumber(parsedPrice) || (parsedPrice as number) < 0) {
      return res.status(400).json({ error: 'price must be a valid non-negative number.' });
    }
  }

  if (hasStockField) {
    if (!validateNumber(parsedStock) || (parsedStock as number) < 0) {
      return res.status(400).json({ error: 'stock must be a valid non-negative number.' });
    }
  }

  try {
    const updatedProduct = await productService.updateProduct(id, {
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(hasPriceField ? { price: parsedPrice as number } : {}),
      ...(hasStockField ? { stock: parsedStock as number } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(requestWithFile.file ? { imageUrl: `/uploads/${requestWithFile.file.filename}` } : {}),
    });

    return res.json(updatedProduct);
  } catch (error) {
    if (isServiceError(error)) {
      const serviceError = error as { statusCode: number; message: string };
      return res.status(serviceError.statusCode).json({ error: serviceError.message });
    }

    return res.status(500).json({ error: 'Failed to update product.' });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  const id = getParamId(req);

  if (!id) {
    return res.status(400).json({ error: 'Invalid product id.' });
  }

  try {
    await productService.deleteProduct(id);

    return res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    if (isServiceError(error)) {
      const serviceError = error as { statusCode: number; message: string };
      return res.status(serviceError.statusCode).json({ error: serviceError.message });
    }

    return res.status(500).json({ error: 'Failed to delete product.' });
  }
};

export { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
