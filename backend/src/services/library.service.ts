import { prisma } from '../lib/prisma.ts';
import { ServiceError } from './errors.service.ts';

/**
 * Mendapatkan daftar unik produk digital yang telah dibeli oleh user.
 * (Hanya pesanan dengan status 'PAID' yang diperhitungkan)
 */
export const getUserLibrary = async (userId: string) => {
  // Cari semua order items dari order yang sudah dibayar oleh user
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        userId: userId,
        status: { in: ['PAID', 'COMPLETED'] }, // Ambil yang PAID atau COMPLETED
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          // downloadUrl tidak diexpose di list ini untuk keamanan
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Karena user mungkin membeli produk yang sama lebih dari sekali
  // kita lakukan deduplikasi berdasarkan productId
  const uniqueProductsMap = new Map();
  
  for (const item of orderItems) {
    if (!uniqueProductsMap.has(item.productId)) {
      uniqueProductsMap.set(item.productId, {
        productId: item.productId,
        purchasedAt: item.createdAt,
        product: item.product,
      });
    }
  }

  return Array.from(uniqueProductsMap.values());
};

/**
 * Mendapatkan secured link download/akses untuk produk tertentu
 * Mengecek apakah user benar-benar pernah membeli produk ini dan sudah lunas.
 */
export const getDownloadUrl = async (userId: string, productId: string) => {
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: productId,
      order: {
        userId: userId,
        status: { in: ['PAID', 'COMPLETED'] },
      },
    },
    include: {
      product: {
        select: { downloadUrl: true },
      },
    },
  });

  if (!hasPurchased) {
    throw new ServiceError('Anda tidak memiliki akses ke produk ini. Silakan beli terlebih dahulu.', 403);
  }

  if (!hasPurchased.product.downloadUrl) {
    throw new ServiceError('File untuk produk ini belum tersedia, silakan hubungi admin.', 404);
  }

  return { 
    downloadUrl: hasPurchased.product.downloadUrl 
  };
};
