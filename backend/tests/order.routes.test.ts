import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { orderRouter } from '../src/routes/order.routes.ts';
import * as orderService from '../src/services/order.service.ts';

// Mock the service
vi.mock('../src/services/order.service.ts');

// Mock prisma
vi.mock('../src/lib/prisma.ts', () => ({
  prisma: {}
}));

// Mock authMiddleware
vi.mock('../src/middleware/authMiddleware.ts', () => ({
  authMiddleware: (req: any, res: any, next: any) => next()
}));

// Mock env
vi.mock('../src/config/env.ts', () => ({
  env: {
    NODE_ENV: 'test',
    JWT_SECRET: 'test_secret',
    XENDIT_CALLBACK_TOKEN: 'test_token',
    RESEND_API_KEY: 'test_resend_key'
  }
}));

const app = express();
app.use(express.json());
app.use('/orders', orderRouter);

describe('Order Routes Integration (Webhook)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /orders/webhook/xendit should process webhook', async () => {
    const mockResult = { acknowledged: true, message: 'Payment marked as PAID.' };
    (orderService.handleXenditInvoiceWebhook as any).mockResolvedValue(mockResult);

    const payload = {
      id: 'inv-1',
      external_id: 'ord-1',
      status: 'PAID'
    };

    const response = await request(app)
      .post('/orders/webhook/xendit')
      .set('x-callback-token', 'test_token')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResult);
    expect(orderService.handleXenditInvoiceWebhook).toHaveBeenCalled();
  });
});
