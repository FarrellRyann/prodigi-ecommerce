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
  tags?: string[];
  licenseKey?: string | null;
};

const validateNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value);

// Tags can come as comma-separated string (FormData) or array (JSON)
const parseTags = (raw: unknown): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return (raw as string[]).map(t => t.trim()).filter(Boolean);
  if (typeof raw === 'string') return raw.split(',').map(t => t.trim()).filter(Boolean);
  return [];
};

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
  const reqWithUser = req as Request & { file?: Express.Multer.File; user?: { userId: string; role: string } };
  const { categoryId, name, description, price, imageUrl, downloadUrl, productType, accessUrl } = req.body as ProductPayload;

  if (!categoryId || !name?.trim()) {
    return res.status(400).json({ error: 'categoryId and name are required.' });
  }

  const parsedPrice = parseNumber(price);

  if (!validateNumber(parsedPrice)) {
    return res.status(400).json({ error: 'price must be a valid number.' });
  }

  const safePrice = parsedPrice;
  const uploadedImageUrl = reqWithUser.file ? `/uploads/${reqWithUser.file.filename}` : undefined;

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
      tags: parseTags(req.body.tags),
      adminId: reqWithUser.user?.role === 'ADMIN' ? reqWithUser.user.userId : null,
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
  const reqWithUser = req as Request & { user?: { userId: string; role: string } };
  try {
    const { categoryId, search, scope } = req.query;

    // Only apply admin scoping when ?scope=admin is explicitly requested by admin panel
    const isAdminScope = scope === 'admin' && reqWithUser.user?.role === 'ADMIN';
    const adminId = isAdminScope ? reqWithUser.user?.userId : undefined;

    const products = await productService.getProducts({
      categoryId: typeof categoryId === 'string' ? categoryId : undefined,
      search: typeof search === 'string' ? search : undefined,
      adminId,
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

// ADMIN: Get only this admin's own products (requires full authMiddleware — req.user is guaranteed)
const getAdminProducts = async (req: Request, res: Response) => {
  const reqWithUser = req as Request & { user?: { userId: string; role: string } };
  const adminId = reqWithUser.user?.userId;

  if (!adminId) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const { categoryId, search } = req.query;
    const products = await productService.getProducts({
      categoryId: typeof categoryId === 'string' ? categoryId : undefined,
      search: typeof search === 'string' ? search : undefined,
      adminId, // strict — no null fallback
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


const updateProduct = async (req: Request, res: Response) => {
  const id = getParamId(req);
  const reqWithUser = req as Request & { file?: Express.Multer.File; user?: { userId: string; role: string } };
  const { categoryId, name, description, price, imageUrl } = req.body as ProductPayload;

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
    // Image resolution: new upload > explicit imageUrl > keep existing (don't pass)
    const resolvedImageUrl = reqWithUser.file
      ? `/uploads/${reqWithUser.file.filename}`
      : imageUrl !== undefined
        ? imageUrl
        : undefined;

    const updatedProduct = await productService.updateProduct(
      id,
      {
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(hasPriceField ? { price: parsedPrice as number } : {}),
        ...(resolvedImageUrl !== undefined ? { imageUrl: resolvedImageUrl } : {}),
        ...(req.body.tags !== undefined ? { tags: parseTags(req.body.tags) } : {}),
      },
      reqWithUser.user?.userId,  // ownership check
    );

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
  const reqWithUser = req as Request & { user?: { userId: string; role: string } };

  if (!id) {
    return res.status(400).json({ error: 'Invalid product id.' });
  }

  try {
    await productService.deleteProduct(id, reqWithUser.user?.userId);

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

export { createProduct, getProducts, getProductById, getAdminProducts, updateProduct, deleteProduct, getRecommendedProducts };
