const { prisma } = require('../lib/prisma') as { prisma: import('../generated/client').PrismaClient };
const { ServiceError } = require('./errors.service') as {
  ServiceError: new (message: string, statusCode?: number) => Error & { statusCode: number };
};

const createCategory = async (name: string) => {
  return prisma.category.create({
    data: { name: name.trim() },
  });
};

const getCategories = async () => {
  return prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
};

const getCategoryById = async (id: string) => {
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

const updateCategory = async (id: string, name: string) => {
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

const deleteCategory = async (id: string) => {
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

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

export {};
