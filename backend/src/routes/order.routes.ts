// src/routes/order.routes.ts
import express from 'express';
import { checkout, getOrders, getOrderById, handleXenditWebhook, resendOrderEmail } from '../controllers/order.controller.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

export const orderRouter = express.Router();

// Endpoint webhook publik dari Xendit
orderRouter.post('/webhook/xendit', handleXenditWebhook);

// Middleware Proteksi
orderRouter.use(authMiddleware);

// Endpoint: POST /orders/checkout (Merubah Cart menjadi Invoice Xendit)
orderRouter.post('/checkout', checkout);

// Endpoint: GET /orders (Riwayat Belanja User)
orderRouter.get('/', getOrders);

// Endpoint: GET /orders/:id (Detail Pesanan Tunggal)
orderRouter.get('/:id', getOrderById);

// Endpoint: POST /orders/:orderId/resend-email (Kirim ulang email sukses pembayaran)
orderRouter.post('/:orderId/resend-email', resendOrderEmail);
