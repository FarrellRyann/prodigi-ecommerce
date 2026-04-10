import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as orderService from '../services/order.service.ts';
import { isServiceError } from '../services/errors.service.ts';
import { xenditWebhookSchema } from '../utils/validation.ts';

// Add cancelOrderAdmin and syncOrderStatus
export const cancelOrderAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await orderService.cancelOrder(id as string);
    res.status(200).json(result);
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
};

export const syncOrderStatusController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) { res.status(401).json({ error: 'Unauthorized.' }); return; }
    const result = await orderService.syncOrderStatus(id as string, userId);
    res.status(200).json(result);
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to sync order status.' });
  }
};

export const cancelOrderUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) { res.status(401).json({ error: 'Unauthorized.' }); return; }
    const result = await orderService.cancelUserOrder(id as string, userId);
    res.status(200).json(result);
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
};

type AuthRequest = Request & {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
};

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userEmail = req.user?.email; // Perbaikan email agar sesuai Token (atau request body kamu)

    if (!userId || !userEmail) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { paymentUrl } = await orderService.createOrderFromCart(userId, userEmail);

    res.status(201).json({
      message: 'Checkout sukses, silakan arahkan pengguna ke Link Pembayaran Xendit.',
      paymentUrl,
    });
  } catch (error) {
    const message = (error as Error).message;
    console.error('[checkout] Error:', message);
    if (message === 'Keranjang belanja Anda kosong.') {
      res.status(400).json({ error: message });
      return;
    }
    // Pass through service-level errors (e.g. Xendit failed)
    res.status(500).json({ error: message || 'Checkout gagal, periksa kembali pesanan Anda.' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const orders = await orderService.getUserOrders(userId);
    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const order = await orderService.getOrderById(id as string, userId);
    res.status(200).json({ data: order });
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: (error as Error).message });
  }
};

// ADMIN: Get all orders scoped to admin's products
export const getAdminAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) { res.status(401).json({ error: 'Unauthorized.' }); return; }
    const orders = await orderService.getAllOrdersAdmin(adminId);
    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Webhook Xendit Invoice
export const handleXenditWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const callbackToken = req.header('x-callback-token') || req.header('X-CALLBACK-TOKEN');
    
    // Validate request body
    const validatedBody = xenditWebhookSchema.parse(req.body);

    const result = await orderService.handleXenditInvoiceWebhook(callbackToken, validatedBody);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
       res.status(400).json({ error: 'Invalid webhook payload.', details: error.errors });
       return;
    }

    if (isServiceError(error)) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.error('[Error di Xendit Webhook Controller]:', error);
    res.status(500).json({ error: 'Webhook processing failed.' });
  }
};

export const resendOrderEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userEmail = req.user?.email;
    const { orderId } = req.params as { orderId: string };

    if (!userId || !userEmail) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    if (!orderId) {
      res.status(400).json({ error: 'Order ID is required.' });
      return;
    }

    await orderService.resendOrderEmail(userId, orderId, userEmail);
    res.status(200).json({ message: 'Email berhasil dikirim ulang.' });
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Gagal mengirim ulang email.' });
  }
};
