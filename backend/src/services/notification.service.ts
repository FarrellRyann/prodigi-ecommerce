import { Resend } from 'resend';
import { ServiceError } from './errors.service.ts';
import { env } from '../config/env.ts';

const resend = new Resend(env.RESEND_API_KEY);
const appBaseUrl = env.APP_BASE_URL;

type OrderItemEmail = {
  name: string;
  price: number;
  quantity: number;
};

type PaymentSuccessEmailInput = {
  to: string;
  orderId: string;
  items: OrderItemEmail[];
  totalAmount: number;
};

export const sendPaymentSuccessEmail = async (payload: PaymentSuccessEmailInput) => {
  if (!resend) {
    throw new ServiceError('Email service is not configured (missing RESEND_API_KEY).', 500);
  }

  const { to, orderId, items, totalAmount } = payload;

  const libraryUrl = `${appBaseUrl}/library`;
  const orderUrl = `${appBaseUrl}/orders/${orderId}`;

  const itemLines = items
    .map((item) => `${item.name} x${item.quantity} - Rp ${item.price.toLocaleString('id-ID')}`)
    .join('<br />');

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Pembayaran Berhasil</h2>
      <p>Terima kasih! Pembayaran Anda untuk pesanan <strong>${orderId}</strong> telah berhasil.</p>
      <p><strong>Detail Pesanan:</strong><br />${itemLines}</p>
      <p><strong>Total:</strong> Rp ${totalAmount.toLocaleString('id-ID')}</p>
      <p>Akses produk digital Anda di <a href="${libraryUrl}">Library Digital</a> atau lihat detail pesanan di <a href="${orderUrl}">halaman pesanan</a>.</p>
      <p>Jika Anda tidak melakukan transaksi ini, segera hubungi dukungan kami.</p>
    </div>
  `;

  const text = `Pembayaran berhasil untuk pesanan ${orderId}. Total Rp ${totalAmount.toLocaleString('id-ID')}.

Item:
${items.map((i) => `- ${i.name} x${i.quantity} - Rp ${i.price.toLocaleString('id-ID')}`).join('\n')}

Akses produk: ${libraryUrl}
Detail pesanan: ${orderUrl}
`;

  const response = await resend.emails.send({
    from: 'ProDigi <no-reply@pro-digi.dev>',
    to,
    subject: `Pembayaran Berhasil - Pesanan ${orderId}`,
    html,
    text,
  });

  if (response.error) {
    throw new ServiceError(`Gagal mengirim email: ${response.error.message || response.error}`, 502);
  }

  return response.data;
};
