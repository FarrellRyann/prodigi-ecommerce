import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as productService from '../src/services/product.service.ts';
import { prisma } from '../src/lib/prisma.ts';
import { ServiceError } from '../src/services/errors.service.ts';

// Mock the prisma instance
vi.mock('../src/lib/prisma.ts', () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
    },
    product: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Product Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should throw 404 if category not found', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(null);

      await expect(productService.createProduct({
        categoryId: 'cat-1',
        name: 'Product 1',
        price: 10000,
        stock: 10
      })).rejects.toThrow(new ServiceError('Category not found.', 404));
    });

    it('should create a product', async () => {
      (prisma.category.findUnique as any).mockResolvedValue({ id: 'cat-1' });
      
      const mockProduct = { id: 'prod-1', categoryId: 'cat-1', name: 'Product 1', price: 10000, stock: 10, description: null, imageUrl: null };
      (prisma.product.create as any).mockResolvedValue(mockProduct);

      const result = await productService.createProduct({
        categoryId: 'cat-1',
        name: ' Product 1 ',
        price: 10000,
        stock: 10
      });

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          categoryId: 'cat-1',
          name: 'Product 1',
          description: null,
          price: 10000,
          stock: 10,
          imageUrl: null,
        },
        include: { category: true }
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getProducts', () => {
    it('should return products', async () => {
      const mockProducts = [{ id: 'prod-1' }];
      (prisma.product.findMany as any).mockResolvedValue(mockProducts);

      const result = await productService.getProducts();

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getProductById', () => {
    it('should throw 404 if product not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      await expect(productService.getProductById('invalid')).rejects.toThrow(new ServiceError('Product not found.', 404));
    });

    it('should return a product', async () => {
      const mockProduct = { id: 'prod-1' };
      (prisma.product.findUnique as any).mockResolvedValue(mockProduct);

      const result = await productService.getProductById('prod-1');

      expect(result).toEqual(mockProduct);
    });
  });

  describe('updateProduct', () => {
    it('should throw 404 if product not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      await expect(productService.updateProduct('prod-1', {})).rejects.toThrow(new ServiceError('Product not found.', 404));
    });

    it('should throw 404 if new category not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValue({ id: 'prod-1' });
      (prisma.category.findUnique as any).mockResolvedValue(null);

      await expect(productService.updateProduct('prod-1', { categoryId: 'cat-2' })).rejects.toThrow(new ServiceError('Category not found.', 404));
    });

    it('should update the product', async () => {
      (prisma.product.findUnique as any).mockResolvedValue({ id: 'prod-1' });
      const updatedProduct = { id: 'prod-1', name: 'Updated' };
      (prisma.product.update as any).mockResolvedValue(updatedProduct);

      const result = await productService.updateProduct('prod-1', { name: ' Updated ', price: 20000 });

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { name: 'Updated', price: 20000 },
        include: { category: true },
      });
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should throw 404 if product not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      await expect(productService.deleteProduct('prod-1')).rejects.toThrow(new ServiceError('Product not found.', 404));
    });

    it('should delete the product', async () => {
      (prisma.product.findUnique as any).mockResolvedValue({ id: 'prod-1' });
      (prisma.product.delete as any).mockResolvedValue({});

      await productService.deleteProduct('prod-1');

      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
    });

    it('should throw 409 if prisma error P2003', async () => {
      (prisma.product.findUnique as any).mockResolvedValue({ id: 'prod-1' });
      (prisma.product.delete as any).mockRejectedValue({ code: 'P2003' });

      await expect(productService.deleteProduct('prod-1')).rejects.toThrow(new ServiceError('Product is used by another record (cart/order). Delete related data first.', 409));
    });
  });
});
