// src/services/order.service.ts
import { prisma } from '../lib/prisma.ts';
import { Xendit } from 'xendit-node';
import { ServiceError } from './errors.service.ts';
import { sendPaymentSuccessEmail } from './notification.service.ts';
import { env } from '../config/env.ts';
import { timingSafeEqual } from 'node:crypto';

// Pastikan Secret Key diset di .env
const xendit = new Xendit({
  secretKey: env.XENDIT_SECRET_KEY,
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
      description: `Pembelian Produk Digital dari .prodigi`,
      successRedirectUrl: `${env.FRONTEND_URL}/order/success?orderId=${order.id}`,
      failureRedirectUrl: `${env.FRONTEND_URL}/order/failed?orderId=${order.id}`,
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

export const getOrderById = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      payment: true,
    },
  });

  if (!order) {
    throw new ServiceError('Pesanan tidak ditemukan.', 404);
  }

  if (order.userId !== userId) {
    throw new ServiceError('Unauthorized access to this order.', 403);
  }

  return order;
};

export const handleXenditInvoiceWebhook = async (
  callbackToken: string | undefined,
  payload: XenditInvoiceWebhookPayload
) => {
  const expectedCallbackToken = env.XENDIT_CALLBACK_TOKEN;

  if (!expectedCallbackToken) {
    throw new ServiceError('XENDIT_CALLBACK_TOKEN is not configured.', 500);
  }

  if (!callbackToken) {
    throw new ServiceError('Invalid Xendit callback token.', 401);
  }

  // Constant-time comparison to reduce timing side-channel risk.
  const expectedBuf = Buffer.from(expectedCallbackToken);
  const receivedBuf = Buffer.from(callbackToken);
  if (expectedBuf.length !== receivedBuf.length || !timingSafeEqual(receivedBuf, expectedBuf)) {
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
    include: { 
      order: {
        include: {
          user: true,
          items: {
            include: { product: true }
          }
        }
      } 
    },
  });

  if (!payment) {
    throw new ServiceError('Payment data not found for this invoice.', 404);
  }

  // Extra sanity check: ensure webhook payload matches the payment/order record we found.
  if (payment.orderId !== externalId) {
    throw new ServiceError('Invalid external_id for this invoice.', 400);
  }
  if (payment.invoiceId && payment.invoiceId !== invoiceId) {
    throw new ServiceError('Invalid invoice id for this invoice.', 400);
  }

  if (invoiceStatus === 'PAID') {
    const alreadyPaid = payment.status === 'PAID' && payment.order.status === 'PAID';
    const paidAt = payload.paid_at ? new Date(payload.paid_at) : payment.paidAt ?? new Date();
    const userId = payment.order.userId;

    await prisma.$transaction(async (tx: any) => {
      // 1) Sync payment/order state
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paidAt,
          paymentUrl: payload.invoice_url || payment.paymentUrl,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' },
      });

      // 2) Unlock entitlements in Library/Subscription
      for (const item of payment.order.items) {
        const productId = item.productId as string;
        const product = item.product as any;

        const accessExpiryDays = product.accessExpiryDays as number | null | undefined;
        const calculatedExpiresAt =
          accessExpiryDays != null
            ? new Date(paidAt.getTime() + accessExpiryDays * 24 * 60 * 60 * 1000)
            : null;

        const existingLibrary = await tx.libraryItem.findUnique({
          where: { userId_productId: { userId, productId } },
          select: { expiresAt: true },
        });

        let expiresAt = calculatedExpiresAt;
        // If previous entitlement is perpetual, never shorten it.
        if (existingLibrary?.expiresAt === null) {
          expiresAt = null;
        } else if (calculatedExpiresAt && existingLibrary?.expiresAt && calculatedExpiresAt < existingLibrary.expiresAt) {
          // Extend (or keep) the latest expiry.
          expiresAt = existingLibrary.expiresAt;
        }

        await tx.libraryItem.upsert({
          where: { userId_productId: { userId, productId } },
          create: {
            userId,
            productId,
            orderItemId: item.id,
            purchasedAt: paidAt,
            expiresAt,
            accessUrlSnapshot: product.accessUrl,
            downloadUrlSnapshot: product.downloadUrl,
          },
          update: {
            orderItemId: item.id,
            purchasedAt: paidAt,
            expiresAt,
            accessUrlSnapshot: product.accessUrl,
            downloadUrlSnapshot: product.downloadUrl,
          },
        });

        if (product.productType === 'SUBSCRIPTION') {
          const existingSubscription = await tx.subscription.findUnique({
            where: { userId_productId: { userId, productId } },
            select: { endsAt: true, startsAt: true },
          });

          let endsAt = calculatedExpiresAt;
          if (existingSubscription?.endsAt === null) {
            endsAt = null;
          } else if (calculatedExpiresAt && existingSubscription?.endsAt && calculatedExpiresAt < existingSubscription.endsAt) {
            endsAt = existingSubscription.endsAt;
          }

          const startsAt = existingSubscription?.startsAt ?? paidAt;

          await tx.subscription.upsert({
            where: { userId_productId: { userId, productId } },
            create: {
              userId,
              productId,
              orderId: payment.orderId,
              startsAt: paidAt,
              endsAt,
              status: 'ACTIVE',
            },
            update: {
              orderId: payment.orderId,
              startsAt,
              endsAt,
              status: 'ACTIVE',
            },
          });
        }
      }
    });

    // Kirim email notifikasi sukses hanya untuk webhook pertama (avoid spam).
    if (!alreadyPaid) {
      try {
        const emailItems = payment.order.items.map((item: any) => ({
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
        }));

        await sendPaymentSuccessEmail({
          to: payment.order.user.email,
          orderId: payment.orderId,
          items: emailItems,
          totalAmount: payment.order.totalAmount,
        });
      } catch (emailError) {
        console.error('[Notification Error] Gagal mengirim email sukses pembayaran:', emailError);
      }
    }

    return {
      acknowledged: true,
      idempotent: alreadyPaid,
      message: alreadyPaid ? 'Webhook already processed.' : 'Payment marked as PAID.',
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

export const resendOrderEmail = async (userId: string, orderId: string, userEmail: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) {
    throw new ServiceError('Pesanan tidak ditemukan.', 404);
  }

  if (order.status !== 'PAID' && order.status !== 'COMPLETED') {
    throw new ServiceError('Email hanya dapat dikirim ulang untuk pesanan yang sudah dibayar.', 400);
  }

  const emailItems = order.items.map((item: any) => ({
    name: (item.product as any).name,
    price: item.price,
    quantity: item.quantity,
  }));

  await sendPaymentSuccessEmail({
    to: userEmail,
    orderId: order.id,
    items: emailItems,
    totalAmount: order.totalAmount,
  });
};

export const getAllOrdersAdmin = async () => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, email: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
      payment: { select: { status: true, paidAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return orders;
};


// ADMIN: Cancel an order (only PENDING orders)
export const cancelOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) throw new ServiceError('Order not found.', 404);
  if (order.status === 'PAID' || order.status === 'COMPLETED') {
    throw new ServiceError('Cannot cancel a paid or completed order.', 400);
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
    if (order.payment) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: 'CANCELLED' },
      });
    }
  });

  return { message: 'Order cancelled successfully.', orderId };
};

// USER: Cancel own pending order
export const cancelUserOrder = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) throw new ServiceError('Order not found.', 404);
  if (order.userId !== userId) throw new ServiceError('Unauthorized.', 403);
  if (order.status === 'PAID' || order.status === 'COMPLETED') {
    throw new ServiceError('Cannot cancel a paid or completed order.', 400);
  }
  if (order.status === 'CANCELLED') {
    return { message: 'Order is already cancelled.', orderId };
  }

  // Try to expire the Xendit invoice so it can't be paid after cancellation
  if (order.payment?.invoiceId) {
    try {
      await invoiceClient.expireInvoice({ invoiceId: order.payment.invoiceId });
    } catch (err) {
      console.error('[cancelUserOrder] Failed to expire Xendit invoice:', err);
      // Continue with local cancellation even if Xendit API fails
    }
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
    if (order.payment) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: 'CANCELLED' },
      });
    }
  });

  return { message: 'Order cancelled successfully.', orderId };
};

// USER: Proactively sync order status from Xendit (for local dev where webhook can't reach)
// Checks actual Xendit invoice status and runs fulfillment if PAID
export const syncOrderStatus = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payment: true,
      user: true,
      items: { include: { product: true } },
    },
  });

  if (!order) throw new ServiceError('Order not found.', 404);
  if (order.userId !== userId) throw new ServiceError('Unauthorized.', 403);

  // Already processed
  if (order.status === 'PAID' || order.status === 'COMPLETED') {
    return { status: order.status, message: 'Order already processed.' };
  }

  if (!order.payment?.invoiceId) {
    console.warn('[syncOrderStatus] No invoiceId found for order:', orderId);
    return { status: order.status, message: 'No payment record found.' };
  }

  console.log(`[syncOrderStatus] Calling Xendit for invoiceId: ${order.payment.invoiceId}`);

  // Call Xendit API to get invoice status
  let invoiceData: any;
  try {
    invoiceData = await invoiceClient.getInvoiceById({ invoiceId: order.payment.invoiceId });
    console.log(`[syncOrderStatus] Xendit response for order ${orderId}:`, JSON.stringify({
      id: invoiceData?.id,
      status: invoiceData?.status,
      paid_at: invoiceData?.paidAt,
      paid_amount: invoiceData?.paidAmount,
    }));
  } catch (err) {
    console.error('[syncOrderStatus] Xendit API error:', err);
    return { status: order.status, message: 'Could not reach payment provider.' };
  }

  if (invoiceData?.status === 'PAID' || invoiceData?.status === 'SETTLED') {
    console.log(`[syncOrderStatus] Fulfilling order ${orderId} with Xendit status: ${invoiceData.status}`);
    // Run the same fulfillment logic as the webhook handler
    await handleXenditInvoiceWebhook(env.XENDIT_CALLBACK_TOKEN, {
      id: invoiceData.id,
      external_id: order.id,
      status: 'PAID', // normalize to PAID
      paid_amount: invoiceData.paidAmount,
      paid_at: invoiceData.paidAt,
      invoice_url: invoiceData.invoiceUrl,
    });
    return { status: 'PAID', message: 'Payment confirmed and library updated.' };
  }

  if (invoiceData?.status === 'EXPIRED') {
    await prisma.$transaction(async (tx: any) => {
      await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });
      await tx.payment.update({ where: { id: order.payment!.id }, data: { status: 'EXPIRED' } });
    });
    return { status: 'CANCELLED', message: 'Invoice expired.' };
  }

  console.warn(`[syncOrderStatus] Unhandled Xendit status "${invoiceData?.status}" for order ${orderId}`);
  return { status: order.status, message: `Xendit status: ${invoiceData?.status ?? 'unknown'}` };
};
