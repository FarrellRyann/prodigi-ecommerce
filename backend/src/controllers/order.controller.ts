import { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as orderService from '../services/order.service.ts';
import { isServiceError } from '../services/errors.service.ts';
import { xenditWebhookSchema } from '../utils/validation.ts';

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
    if (message === 'Keranjang belanja Anda kosong.') {
      res.status(400).json({ error: message });
      return;
    }
    console.error('[Error di Order Controller]:', error); // Logger debugging Xendit Error
    res.status(500).json({ error: 'Checkout gagal, periksa kembali pesanan Anda.' });
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
