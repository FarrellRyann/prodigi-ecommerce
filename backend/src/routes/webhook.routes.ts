import express from 'express';
import { handleXenditWebhook } from '../controllers/order.controller.ts';

export const webhookRouter = express.Router();

// Canonical webhook endpoint required by Xendit integration spec.
// This route must be public (no JWT auth).
webhookRouter.post('/xendit', handleXenditWebhook);

