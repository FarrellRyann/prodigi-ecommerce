import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cartService from '../src/services/cart.service.ts';
import { prisma } from '../src/lib/prisma.ts';
import { ServiceError } from '../src/services/errors.service.ts';

// Mock the prisma instance
vi.mock('../src/lib/prisma.ts', () => ({
  prisma: {
    cart: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    cartItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    orderItem: {
      findFirst: vi.fn(),
    }
  },
}));

describe('Cart Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return existing cart and calculate total', async () => {
      const mockCart = {
        id: 'cart-1',
        userId: 'user-1',
        items: [
          { product: { price: 10000 } },
          { product: { price: 20000 } }
        ]
      };
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);

      const result = await cartService.getCart('user-1');

      expect(result).toEqual({ ...mockCart, totalAmount: 30000 });
      expect(prisma.cart.create).not.toHaveBeenCalled();
    });

    it('should create cart if not exists', async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(null);
      const mockCart = { id: 'cart-1', userId: 'user-1', items: [] };
      (prisma.cart.create as any).mockResolvedValue(mockCart);

      const result = await cartService.getCart('user-1');

      expect(prisma.cart.create).toHaveBeenCalledWith(expect.objectContaining({ data: { userId: 'user-1' } }));
      expect(result).toEqual({ ...mockCart, totalAmount: 0 });
    });
  });

  describe('addToCart', () => {
    it('should throw 409 if item already in cart', async () => {
      (prisma.cart.findUnique as any).mockResolvedValue({ id: 'cart-1' });
      (prisma.cartItem.findUnique as any).mockResolvedValue({ id: 'item-1' });

      await expect(cartService.addToCart('user-1', 'prod-1')).rejects.toThrow(new ServiceError('Produk sudah ada di dalam keranjang.', 409));
    });

    it('should throw 409 if product already owned', async () => {
      (prisma.cart.findUnique as any).mockResolvedValue({ id: 'cart-1' });
      (prisma.cartItem.findUnique as any).mockResolvedValue(null);
      (prisma.orderItem.findFirst as any).mockResolvedValue({ id: 'order-item-1' });

      await expect(cartService.addToCart('user-1', 'prod-1')).rejects.toThrow(new ServiceError('Produk ini sudah Anda miliki. Silakan cek library digital Anda.', 409));
    });

    it('should add item to cart', async () => {
      (prisma.cart.findUnique as any).mockResolvedValue({ id: 'cart-1' });
      (prisma.cartItem.findUnique as any).mockResolvedValue(null);
      (prisma.orderItem.findFirst as any).mockResolvedValue(null);
      const mockCartItem = { id: 'item-1', productId: 'prod-1' };
      (prisma.cartItem.create as any).mockResolvedValue(mockCartItem);

      const result = await cartService.addToCart('user-1', 'prod-1');

      expect(prisma.cartItem.create).toHaveBeenCalledWith(expect.objectContaining({
        data: { cartId: 'cart-1', productId: 'prod-1', quantity: 1 }
      }));
      expect(result).toEqual(mockCartItem);
    });
  });

  describe('removeFromCart', () => {
    it('should throw 404 if item not found', async () => {
      (prisma.cartItem.findUnique as any).mockResolvedValue(null);

      await expect(cartService.removeFromCart('user-1', 'item-1')).rejects.toThrow(new ServiceError('Item tidak ditemukan di keranjang.', 404));
    });

    it('should throw 403 if unauthorized', async () => {
      (prisma.cartItem.findUnique as any).mockResolvedValue({
        id: 'item-1',
        cart: { userId: 'other-user' }
      });

      await expect(cartService.removeFromCart('user-1', 'item-1')).rejects.toThrow(new ServiceError('Tidak memiliki akses untuk menghapus item ini.', 403));
    });

    it('should remove item', async () => {
      (prisma.cartItem.findUnique as any).mockResolvedValue({
        id: 'item-1',
        cart: { userId: 'user-1' }
      });
      const mockItem = { id: 'item-1' };
      (prisma.cartItem.delete as any).mockResolvedValue(mockItem);

      const result = await cartService.removeFromCart('user-1', 'item-1');

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: 'item-1' } });
    });
  });
});
