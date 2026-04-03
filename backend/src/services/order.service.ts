// src/services/order.service.ts
import { prisma } from '../lib/prisma.ts';
import { Xendit } from 'xendit-node';
import { ServiceError } from './errors.service.ts';

// Pastikan Secret Key diset di .env
const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || 'xnd_development_dummy_key_isi_dari_dashboard_xendit',
});

const invoiceClient = xendit.Invoice; // SDK Xendit terbaru memanggil melalui namespace xendit.Invoice

type XenditInvoiceWebhookPayload = {
  id?: string;
  external_id?: string;
  status?: string;
  paid_amount?: number;
  paid_at?: string;
  invoice_url?: string;
};

export const createOrderFromCart = async (userId: string, userEmail: string) => {
  // 1. Ambil Keranjang User
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Keranjang belanja Anda kosong.');
  }

  // 2. Hitung Total Pembayaran
  let totalAmount = 0;
  cart.items.forEach((item: any) => {
    totalAmount += item.product.price * item.quantity;
  });

  // 3. Gunakan Prisma Transaction untuk memastikan kelancaran pembuatan data
  const result = await prisma.$transaction(async (tx: any) => {
    // 3A. Buat Order Baru
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
      },
    });

    // 3B. Pindahkan CartItem ke OrderItem
    const orderItemsData = cart.items.map((cartItem: any) => ({
      orderId: order.id,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: cartItem.product.price,
    }));

    await tx.orderItem.createMany({
      data: orderItemsData,
    });

    // 3C. Hapus/Kosongkan Keranjang
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // 4. Generate URL Pembayaran Xendit (Invoice Method)
    const invoiceRequestData: any = {
      externalId: order.id,
      amount: totalAmount,
      payerEmail: userEmail,
      description: `Pembelian Produk Digital dari E-Commerce Anda`,
    };

    // Panggil Xendit SDK secara async di dalam blok (Perlu ditangani dengan await secara perlahan)
    const invoiceResponse = await invoiceClient.createInvoice({
      data: invoiceRequestData
    });

    // 5. Simpan Data Pembayaran/Link Xendit ke Tabel Payment
    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: 'XENDIT_INVOICE',
        invoiceId: invoiceResponse.id,
        paymentUrl: invoiceResponse.invoiceUrl, // Ini URL web yang dibungkus Xendit untuk dibayar UI
        status: 'PENDING',
      },
    });

    return { order, paymentUrl: payment.paymentUrl };
  });

  return result;
};

// Fungsi lain (Melihat list pesanan yang sudah ada)
export const getUserOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return orders;
};

// Handle Xendit webhook for invoice events
export const handleXenditWebhook = async (payload: {
  id: string; // invoice id
  external_id: string; // we set as order id
  status: string;
  paid_at?: string;
}) => {
  const { id: invoiceId, external_id: externalId, status, paid_at } = payload;

  // idempotency: if payment already terminal, skip
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { invoiceId },
        { orderId: externalId },
      ],
    },
  });

  if (!payment) {
    // unknown invoice, ignore but return success to avoid retries storm
    return;
  }

  // If already processed to terminal state, do nothing
  if (payment.status === 'PAID' || payment.status === 'EXPIRED' || payment.status === 'FAILED') {
    return;
  }

  // Map Xendit status to internal
  let paymentStatus: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' = 'PENDING';
  let orderStatus: 'PENDING' | 'PAID' | 'PROCESSED' | 'COMPLETED' | 'CANCELLED' = 'PENDING';

  if (status === 'PAID') {
    paymentStatus = 'PAID';
    orderStatus = 'PAID';
  } else if (status === 'EXPIRED') {
    paymentStatus = 'EXPIRED';
    orderStatus = 'CANCELLED';
  } else if (status === 'FAILED') {
    paymentStatus = 'FAILED';
    orderStatus = 'CANCELLED';
  } else {
    // For other statuses, keep pending
    paymentStatus = 'PENDING';
    orderStatus = 'PENDING';
  }

  const paidAtDate = paid_at ? new Date(paid_at) : new Date();

  await prisma.$transaction(async (tx: any) => {
    await tx.payment.update({
      where: { orderId: externalId },
      data: {
        status: paymentStatus,
        paidAt: paymentStatus === 'PAID' ? paidAtDate : null,
      },
    });

    await tx.order.update({
      where: { id: externalId },
      data: {
        status: orderStatus,
      },
    });
  });
};
export const handleXenditInvoiceWebhook = async (
  callbackToken: string | undefined,
  payload: XenditInvoiceWebhookPayload
) => {
  const expectedCallbackToken = process.env.XENDIT_CALLBACK_TOKEN;

  if (!expectedCallbackToken) {
    throw new ServiceError('XENDIT_CALLBACK_TOKEN is not configured.', 500);
  }

  if (!callbackToken || callbackToken !== expectedCallbackToken) {
    throw new ServiceError('Invalid Xendit callback token.', 401);
  }

  const invoiceId = payload.id;
  const externalId = payload.external_id;
  const invoiceStatus = payload.status;

  if (!invoiceId || !externalId || !invoiceStatus) {
    throw new ServiceError('Invalid webhook payload from Xendit.', 400);
  }

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { invoiceId },
        { orderId: externalId },
      ],
    },
    include: { order: true },
  });

  if (!payment) {
    throw new ServiceError('Payment data not found for this invoice.', 404);
  }

  if (invoiceStatus === 'PAID') {
    // Idempotency guard: avoid duplicate side effects for repeated callbacks.
    if (payment.status === 'PAID' && payment.order.status === 'PAID') {
      return {
        acknowledged: true,
        idempotent: true,
        message: 'Webhook already processed.',
      };
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paidAt: payload.paid_at ? new Date(payload.paid_at) : new Date(),
          paymentUrl: payload.invoice_url || payment.paymentUrl,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' },
      });
    });

    return {
      acknowledged: true,
      idempotent: false,
      message: 'Payment marked as PAID.',
      orderId: payment.orderId,
      amount: payload.paid_amount,
    };
  }

  if (invoiceStatus === 'EXPIRED') {
    await prisma.$transaction(async (tx: any) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'EXPIRED' },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'CANCELLED' },
      });
    });

    return {
      acknowledged: true,
      idempotent: false,
      message: 'Payment marked as EXPIRED.',
      orderId: payment.orderId,
    };
  }

  if (invoiceStatus === 'FAILED') {
    await prisma.$transaction(async (tx: any) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'CANCELLED' },
      });
    });

    return {
      acknowledged: true,
      idempotent: false,
      message: 'Payment marked as FAILED.',
      orderId: payment.orderId,
    };
  }

  return {
    acknowledged: true,
    idempotent: true,
    message: `Unhandled invoice status: ${invoiceStatus}`,
    orderId: payment.orderId,
  };
};
