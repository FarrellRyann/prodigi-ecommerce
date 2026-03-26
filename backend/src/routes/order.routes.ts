// src/routes/order.routes.ts
import express from 'express';
import * as orderController from '../controllers/order.controller';
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Endpoint webhook publik dari Xendit
router.post('/webhook/xendit', orderController.handleXenditWebhook);

// Middleware Proteksi
router.use(authMiddleware);

// Endpoint: POST /api/orders/checkout (Merubah Cart menjadi Invoice Xendit)
router.post('/checkout', orderController.checkout);

// Endpoint: GET /api/orders (Riwayat Belanja User)
router.get('/', orderController.getOrders);

export default router;
