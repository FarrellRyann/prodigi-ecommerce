import express from 'express';
import * as cartController from '../controllers/cart.controller';
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Semua API Cart membutuhkan user yang sudah login (authMiddleware)
router.use(authMiddleware);

// Endpoint: GET /api/cart (mendapatkan seluruh isi cart user)
router.get('/', cartController.getCart);

// Endpoint: POST /api/cart (menambahkan produk digital ke cart)
// Body: { productId: string }
router.post('/', cartController.addToCart);

// Endpoint: DELETE /api/cart/:itemId (menghapus produk dari cart)
// Params: itemId adalah ID CartItem yang ingin diremove
router.delete('/:itemId', cartController.removeFromCart);

export default router;
