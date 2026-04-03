import { Request, Response } from 'express';
import * as cartService from '../services/cart.service.ts';
import { isServiceError } from '../services/errors.service.ts';

type AuthRequest = Request & {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
};

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const cart = await cartService.getCart(userId);
    res.status(200).json({ data: cart });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    if (!productId) {
      res.status(400).json({ error: 'Product ID harus diisi.' });
      return;
    }

    const item = await cartService.addToCart(userId, productId);
    res.status(201).json({ message: 'Produk ditambahkan ke keranjang.', data: item });
  } catch (error) {
    if (isServiceError(error)) {
      if (error.message === 'Produk ini sudah Anda miliki. Silakan cek library digital Anda.') {
        res.status(error.statusCode).json({
          warning: error.message,
          code: 'PRODUCT_ALREADY_OWNED',
        });
        return;
      }

      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: (error as Error).message });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { itemId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const removedItem = await cartService.removeFromCart(userId, itemId as string);
    res.status(200).json({ message: 'Item berhasil dihapus dari keranjang.', data: removedItem });
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: (error as Error).message });
  }
};
