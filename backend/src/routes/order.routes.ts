// src/routes/order.routes.ts
import express from 'express';
import { checkout, getOrders, getOrderById, handleXenditWebhook, resendOrderEmail, getAdminAllOrders, cancelOrderAdmin, syncOrderStatusController, cancelOrderUser } from '../controllers/order.controller.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { requireRole } from '../middleware/roleMiddleware.ts';

export const orderRouter = express.Router();

// Endpoint webhook publik dari Xendit (no auth)
orderRouter.post('/webhook/xendit', handleXenditWebhook);

// Middleware Proteksi
orderRouter.use(authMiddleware);

// ADMIN Endpoints
orderRouter.get('/admin/all', requireRole('ADMIN'), getAdminAllOrders);
orderRouter.patch('/admin/:id/cancel', requireRole('ADMIN'), cancelOrderAdmin);

// USER Endpoints
orderRouter.post('/checkout', checkout);
orderRouter.get('/', getOrders);
orderRouter.get('/:id', getOrderById);
orderRouter.post('/:id/sync', syncOrderStatusController);
orderRouter.patch('/:id/cancel', cancelOrderUser);
orderRouter.post('/:orderId/resend-email', resendOrderEmail);

