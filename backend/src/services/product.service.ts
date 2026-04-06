import { prisma } from '../lib/prisma.ts';
import { ServiceError } from './errors.service.ts';

type ProductPayload = {
  categoryId?: string;
  name?: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
  downloadUrl?: string | null;
};

export const createProduct = async (payload: {
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  downloadUrl?: string | null;
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
    },
    include: {
      category: true,
    },
  });
};

export const getProducts = async () => {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
    },
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

export const updateProduct = async (id: string, payload: ProductPayload) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingProduct) {
    throw new ServiceError('Product not found.', 404);
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
    },
    include: {
      category: true,
    },
  });
};

export const deleteProduct = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingProduct) {
    throw new ServiceError('Product not found.', 404);
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

