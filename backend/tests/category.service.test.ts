import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as categoryService from '../src/services/category.service.ts';
import { prisma } from '../src/lib/prisma.ts';
import { ServiceError } from '../src/services/errors.service.ts';

// Mock the prisma instance
vi.mock('../src/lib/prisma.ts', () => ({
  prisma: {
    category: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
  },
}));

describe('Category Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryData = { id: 'cat-1', name: 'Electronics' };
      (prisma.category.create as any).mockResolvedValue(categoryData);

      const result = await categoryService.createCategory('Electronics');

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Electronics' },
      });
      expect(result).toEqual(categoryData);
    });

    it('should trim the category name', async () => {
      (prisma.category.create as any).mockResolvedValue({ id: 'cat-1', name: 'Electronics' });

      await categoryService.createCategory('  Electronics  ');

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Electronics' },
      });
    });
  });

  describe('getCategories', () => {
    it('should return all categories with product counts', async () => {
      const categoriesData = [{ id: 'cat-1', name: 'Electronics', _count: { products: 5 } }];
      (prisma.category.findMany as any).mockResolvedValue(categoriesData);

      const result = await categoryService.getCategories();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
      expect(result).toEqual(categoriesData);
    });
  });

  describe('getCategoryById', () => {
    it('should return category with products if found', async () => {
      const categoryData = { id: 'cat-1', name: 'Electronics', products: [] };
      (prisma.category.findUnique as any).mockResolvedValue(categoryData);

      const result = await categoryService.getCategoryById('cat-1');

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        include: { products: true },
      });
      expect(result).toEqual(categoryData);
    });

    it('should throw ServiceError 404 if not found', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(null);

      await expect(categoryService.getCategoryById('none'))
        .rejects.toThrow(new ServiceError('Category not found.', 404));
    });
  });

  describe('updateCategory', () => {
    it('should update and return category if found', async () => {
      const categoryData = { id: 'cat-1', name: 'New Name' };
      (prisma.category.findUnique as any).mockResolvedValue({ id: 'cat-1' });
      (prisma.category.update as any).mockResolvedValue(categoryData);

      const result = await categoryService.updateCategory('cat-1', 'New Name');

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: { name: 'New Name' },
      });
      expect(result).toEqual(categoryData);
    });

    it('should throw ServiceError 404 if not found', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(null);

      await expect(categoryService.updateCategory('none', 'Name'))
        .rejects.toThrow(new ServiceError('Category not found.', 404));
    });
  });

  describe('deleteCategory', () => {
    it('should delete category if found and has no products', async () => {
      (prisma.category.findUnique as any).mockResolvedValue({ id: 'cat-1' });
      (prisma.product.count as any).mockResolvedValue(0);
      (prisma.category.delete as any).mockResolvedValue({});

      await categoryService.deleteCategory('cat-1');

      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 'cat-1' } });
    });

    it('should throw ServiceError 404 if not found', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(null);

      await expect(categoryService.deleteCategory('none'))
        .rejects.toThrow(new ServiceError('Category not found.', 404));
    });

    it('should throw ServiceError 409 if category has products', async () => {
      (prisma.category.findUnique as any).mockResolvedValue({ id: 'cat-1' });
      (prisma.product.count as any).mockResolvedValue(5);

      await expect(categoryService.deleteCategory('cat-1'))
        .rejects.toThrow(new ServiceError('Category still has products. Move/delete its products first.', 409));
    });
  });
});
