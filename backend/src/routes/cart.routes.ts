import express from 'express';
import * as cartController from '../controllers/cart.controller.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { addToCartSchema } from '../utils/validation.ts';

export const cartRouter = express.Router();

// Semua API Cart membutuhkan user yang sudah login (authMiddleware)
cartRouter.use(authMiddleware);

// Endpoint: GET /api/cart (mendapatkan seluruh isi cart user)
cartRouter.get('/', cartController.getCart);

// Endpoint: POST /api/cart (menambahkan produk digital ke cart)
// Body: { productId: string }
cartRouter.post('/', validate(addToCartSchema), cartController.addToCart);

// Endpoint: DELETE /api/cart/:itemId (menghapus produk dari cart)
// Params: itemId adalah ID CartItem yang ingin diremove
cartRouter.delete('/:itemId', cartController.removeFromCart);
// Endpoint: POST /api/cart/sync (synchronize local cart with backend)
cartRouter.post('/sync', cartController.syncCart);
