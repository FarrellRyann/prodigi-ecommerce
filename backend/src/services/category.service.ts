import { prisma } from '../lib/prisma.ts';
import { ServiceError } from './errors.service.ts';

export const createCategory = async (name: string) => {
  return prisma.category.create({
    data: { name: name.trim() },
  });
};

export const getCategories = async () => {
  return prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
};

export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });

  if (!category) {
    throw new ServiceError('Category not found.', 404);
  }

  return category;
};

export const updateCategory = async (id: string, name: string) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingCategory) {
    throw new ServiceError('Category not found.', 404);
  }

  return prisma.category.update({
    where: { id },
    data: {
      name: name.trim(),
    },
  });
};

export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!category) {
    throw new ServiceError('Category not found.', 404);
  }

  const productsCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productsCount > 0) {
    throw new ServiceError('Category still has products. Move/delete its products first.', 409);
  }

  await prisma.category.delete({ where: { id } });
};

