import express from 'express';
import { getLibrary, getLibraryProductAccess, getLibraryProductDownload } from '../controllers/library.controller.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

export const libraryRouter = express.Router();

// Semua rute library wajib login (authenticated)
libraryRouter.use(authMiddleware);

// Endpoint: GET /library (Mendapatkan semua produk yang sudah dibeli)
libraryRouter.get('/', getLibrary);

// Endpoint: GET /library/:productId/download (Mendapatkan akses download produk yang dibeli)
libraryRouter.get('/:productId/download', getLibraryProductDownload);

// Endpoint: GET /library/:productId/access (Mendapatkan URL akses produk yang dibeli)
libraryRouter.get('/:productId/access', getLibraryProductAccess);
