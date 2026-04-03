import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendPaymentSuccessEmail } from '../src/services/notification.service.ts';
import { ServiceError } from '../src/services/errors.service.ts';

// Mock Resend
const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(function () {
      return {
        emails: {
          send: mockSend,
        },
      };
    }),
  };
});

// Mock env
vi.mock('../src/config/env.ts', () => ({
  env: {
    RESEND_API_KEY: 'test_key',
    APP_BASE_URL: 'http://localhost:3000',
  },
}));

describe('Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a payment success email successfully', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

    const payload = {
      to: 'customer@example.com',
      orderId: 'ORD-001',
      items: [
        { name: 'Product A', price: 10000, quantity: 2 },
      ],
      totalAmount: 20000,
    };

    const result = await sendPaymentSuccessEmail(payload);

    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: 'customer@example.com',
      subject: 'Pembayaran Berhasil - Pesanan ORD-001',
      from: 'ProDigi <no-reply@pro-digi.dev>',
    }));
    expect(result).toEqual({ id: 'email-123' });
  });

  it('should throw ServiceError 502 if Resend returns an error', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Invalid API Key' } });

    const payload = {
      to: 'customer@example.com',
      orderId: 'ORD-001',
      items: [],
      totalAmount: 0,
    };

    await expect(sendPaymentSuccessEmail(payload))
      .rejects.toThrow(new ServiceError('Gagal mengirim email: Invalid API Key', 502));
  });
});
