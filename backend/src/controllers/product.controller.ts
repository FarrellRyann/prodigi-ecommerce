import type { Request, Response } from 'express';
import * as productService from '../services/product.service.ts';
import { isServiceError } from '../services/errors.service.ts';

type ProductPayload = {
  categoryId?: string;
  name?: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
  downloadUrl?: string | null;
  productType?: string | null;
  accessUrl?: string | null;
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
  const { categoryId, name, description, price, imageUrl, downloadUrl, productType, accessUrl } = req.body as ProductPayload;
  const requestWithFile = req as Request & { file?: Express.Multer.File };

  if (!categoryId || !name?.trim()) {
    return res.status(400).json({ error: 'categoryId and name are required.' });
  }

  const parsedPrice = parseNumber(price);

  if (!validateNumber(parsedPrice)) {
    return res.status(400).json({ error: 'price must be a valid number.' });
  }

  const safePrice = parsedPrice;
  const uploadedImageUrl = requestWithFile.file ? `/uploads/${requestWithFile.file.filename}` : undefined;

  if (safePrice < 0) {
    return res.status(400).json({ error: 'price cannot be negative.' });
  }

  try {
    const product = await productService.createProduct({
      categoryId,
      name,
      description: description ?? null,
      price: safePrice,
      imageUrl: uploadedImageUrl ?? imageUrl ?? null,
      downloadUrl: downloadUrl ?? null,
      productType: productType ?? undefined,
      accessUrl: accessUrl ?? null,
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("[createProduct] Error:", error);
    if (isServiceError(error)) {
      const serviceError = error as { statusCode: number; message: string };
      return res.status(serviceError.statusCode).json({ error: serviceError.message });
    }

    const msg = error instanceof Error ? error.message : String(error);
    console.error("[createProduct] Prisma error:", msg);
    return res.status(500).json({ error: 'Failed to create product.' });
  }
};

const getProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId, search } = req.query;

    const products = await productService.getProducts({
      categoryId: typeof categoryId === 'string' ? categoryId : undefined,
      search: typeof search === 'string' ? search : undefined,
    });

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
  const { categoryId, name, description, price, imageUrl } = req.body as ProductPayload;
  const requestWithFile = req as Request & { file?: Express.Multer.File };

  if (!id) {
    return res.status(400).json({ error: 'Invalid product id.' });
  }

  const hasPriceField = price !== undefined;
  const parsedPrice = hasPriceField ? parseNumber(price) : undefined;

  if (hasPriceField) {
    if (!validateNumber(parsedPrice) || (parsedPrice as number) < 0) {
      return res.status(400).json({ error: 'price must be a valid non-negative number.' });
    }
  }

  try {
    const updatedProduct = await productService.updateProduct(id, {
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(hasPriceField ? { price: parsedPrice as number } : {}),
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

const getRecommendedProducts = async (_req: Request, res: Response) => {
  try {
    const products = await productService.getRecommendedProducts(3);
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch recommendations.' });
  }
};

export { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getRecommendedProducts };
