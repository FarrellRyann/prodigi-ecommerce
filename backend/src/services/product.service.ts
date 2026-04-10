import { prisma } from '../lib/prisma.ts';
import { ServiceError } from './errors.service.ts';

type ProductPayload = {
  categoryId?: string;
  name?: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
  downloadUrl?: string | null;
  tags?: string[];
};

export const createProduct = async (payload: {
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  downloadUrl?: string | null;
  productType?: string | null;
  accessUrl?: string | null;
  tags?: string[];
  adminId?: string | null;
}) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new ServiceError('Category not found.', 404);
  }

  return prisma.product.create({
    data: {
      categoryId: payload.categoryId,
      name: payload.name.trim(),
      description: payload.description ?? null,
      price: payload.price,
      imageUrl: payload.imageUrl ?? null,
      downloadUrl: payload.downloadUrl ?? null,
      ...(payload.productType ? { productType: payload.productType as any } : {}),
      accessUrl: payload.accessUrl ?? null,
      tags: payload.tags ?? [],
      ...(payload.adminId ? { adminId: payload.adminId } : {}),
    },
    include: { category: true },
  });
};

export const getProducts = async (filters: { categoryId?: string; search?: string; adminId?: string } = {}) => {
  const { categoryId, search, adminId } = filters;
  
  return prisma.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      } : {}),
      // Strict admin scoping: only this admin's products (no legacy null fallback)
      ...(adminId ? { adminId: adminId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });
};


export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!product) {
    throw new ServiceError('Product not found.', 404);
  }

  return product;
};

export const updateProduct = async (id: string, payload: ProductPayload, requestingAdminId?: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { id: true, adminId: true },
  });

  if (!existingProduct) {
    throw new ServiceError('Product not found.', 404);
  }

  // Ownership check: only the creating admin can update
  if (existingProduct.adminId && requestingAdminId && existingProduct.adminId !== requestingAdminId) {
    throw new ServiceError('You do not have permission to update this product.', 403);
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new ServiceError('Category not found.', 404);
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
      ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.price !== undefined ? { price: payload.price } : {}),
      ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
      ...(payload.downloadUrl !== undefined ? { downloadUrl: payload.downloadUrl } : {}),
      ...(payload.tags !== undefined ? { tags: payload.tags } : {}),
    },
    include: { category: true },
  });
};

export const deleteProduct = async (id: string, requestingAdminId?: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { id: true, adminId: true },
  });

  if (!existingProduct) {
    throw new ServiceError('Product not found.', 404);
  }

  // Ownership check: only the creating admin can delete
  if (existingProduct.adminId && requestingAdminId && existingProduct.adminId !== requestingAdminId) {
    throw new ServiceError('You do not have permission to delete this product.', 403);
  }

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };

    if (prismaError.code === 'P2003') {
      throw new ServiceError('Product is used by another record (cart/order). Delete related data first.', 409);
    }

    throw error;
  }
};

export const getRecommendedProducts = async (limit = 3) => {
  // Simple randomized logic or latest products
  return prisma.product.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
    },
  });
};
