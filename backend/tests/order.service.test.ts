import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as orderService from '../src/services/order.service.ts';
import { prisma } from '../src/lib/prisma.ts';
import { env } from '../src/config/env.ts';
import { sendPaymentSuccessEmail } from '../src/services/notification.service.ts';
import { ServiceError } from '../src/services/errors.service.ts';

// Mock the prisma instance
vi.mock('../src/lib/prisma.ts', () => ({
  prisma: {
    payment: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    order: {
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

// Mock the env
vi.mock('../src/config/env.ts', () => ({
  env: {
    XENDIT_CALLBACK_TOKEN: 'test_token',
  },
}));

// Mock notification service
vi.mock('../src/services/notification.service.ts', () => ({
  sendPaymentSuccessEmail: vi.fn().mockResolvedValue({ id: 'email-id' }),
}));

describe('Order Service - handleXenditInvoiceWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw ServiceError 401 if callback token is invalid', async () => {
    await expect(orderService.handleXenditInvoiceWebhook('wrong_token', {}))
      .rejects.toThrow(new ServiceError('Invalid Xendit callback token.', 401));
  });

  it('should throw ServiceError 400 if payload is missing key fields', async () => {
    await expect(orderService.handleXenditInvoiceWebhook('test_token', { id: 'inv-1' }))
      .rejects.toThrow(new ServiceError('Invalid webhook payload from Xendit.', 400));
  });

  it('should throw ServiceError 404 if payment data not found', async () => {
    (prisma.payment.findFirst as any).mockResolvedValue(null);

    const payload = {
      id: 'inv-1',
      external_id: 'ord-1',
      status: 'PAID'
    };

    await expect(orderService.handleXenditInvoiceWebhook('test_token', payload))
      .rejects.toThrow(new ServiceError('Payment data not found for this invoice.', 404));
  });

  it('should handle PAID status and send notification email', async () => {
    const mockPayment = {
      id: 'pay-1',
      orderId: 'ord-1',
      status: 'PENDING',
      paymentUrl: 'http://old-url',
      order: {
        id: 'ord-1',
        status: 'PENDING',
        totalAmount: 50000,
        user: { email: 'user@example.com' },
        items: [
          { 
            price: 50000, 
            quantity: 1, 
            product: { name: 'Digital Product' } 
          }
        ]
      }
    };

    (prisma.payment.findFirst as any).mockResolvedValue(mockPayment);
    (prisma.payment.update as any).mockResolvedValue({ ...mockPayment, status: 'PAID' });
    (prisma.order.update as any).mockResolvedValue({ ...mockPayment.order, status: 'PAID' });

    const payload = {
      id: 'inv-1',
      external_id: 'ord-1',
      status: 'PAID',
      paid_amount: 50000,
      paid_at: '2026-04-03T00:00:00.000Z'
    };

    const result = await orderService.handleXenditInvoiceWebhook('test_token', payload);

    expect(prisma.payment.update).toHaveBeenCalled();
    expect(prisma.order.update).toHaveBeenCalled();
    expect(sendPaymentSuccessEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      orderId: 'ord-1',
      items: [{ name: 'Digital Product', price: 50000, quantity: 1 }],
      totalAmount: 50000
    });

    expect(result).toEqual({
      acknowledged: true,
      idempotent: false,
      message: 'Payment marked as PAID.',
      orderId: 'ord-1',
      amount: 50000,
    });
  });

  it('should return idempotent response if already PAID', async () => {
    const mockPayment = {
      id: 'pay-1',
      orderId: 'ord-1',
      status: 'PAID',
      order: {
        status: 'PAID',
      }
    };

    (prisma.payment.findFirst as any).mockResolvedValue(mockPayment);

    const payload = {
      id: 'inv-1',
      external_id: 'ord-1',
      status: 'PAID',
    };

    const result = await orderService.handleXenditInvoiceWebhook('test_token', payload);

    expect(prisma.payment.update).not.toHaveBeenCalled();
    expect(result).toEqual({
      acknowledged: true,
      idempotent: true,
      message: 'Webhook already processed.',
    });
  });

  it('should handle EXPIRED status', async () => {
    const mockPayment = {
      id: 'pay-1',
      orderId: 'ord-1',
      status: 'PENDING',
      order: { id: 'ord-1' }
    };

    (prisma.payment.findFirst as any).mockResolvedValue(mockPayment);

    const payload = {
      id: 'inv-1',
      external_id: 'ord-1',
      status: 'EXPIRED'
    };

    const result = await orderService.handleXenditInvoiceWebhook('test_token', payload);

    expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay-1' },
        data: { status: 'EXPIRED' }
    });
    expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord-1' },
        data: { status: 'CANCELLED' }
    });
    expect(result).toEqual({
      acknowledged: true,
      idempotent: false,
      message: 'Payment marked as EXPIRED.',
      orderId: 'ord-1',
    });
  });
});
