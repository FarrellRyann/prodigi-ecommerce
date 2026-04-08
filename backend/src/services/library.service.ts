import { prisma } from '../lib/prisma.ts';
import { ServiceError } from './errors.service.ts';
import { generateSignedUrl } from './file.service.ts';


const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Mendapatkan daftar unik produk digital yang telah dibeli oleh user.
 * (Hanya pesanan dengan status 'PAID' yang diperhitungkan)
 */
export const getUserLibrary = async (userId: string) => {
  const now = new Date();

  // Source of truth baru: LibraryItem (lebih efisien untuk expiry)
  const libraryItems = await prisma.libraryItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          productType: true,
        },
      },
    },
    orderBy: { purchasedAt: 'desc' },
  });

  const productIdsInLibrary = new Set(libraryItems.map((li) => li.productId));

  // Fallback untuk data lama (sebelum entitas LibraryItem ada)
  // Jika LibraryItem belum terisi untuk sebuah produk, ambil dari OrderItem.
  const fallbackOrderItems = await prisma.orderItem.findMany({
    where: {
      productId: { notIn: Array.from(productIdsInLibrary) },
      order: {
        userId,
        status: { in: ['PAID', 'COMPLETED'] },
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          productType: true,
          accessExpiryDays: true,
        },
      },
      order: {
        select: {
          payment: { select: { paidAt: true } },
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const mergedByProductId = new Map<string, any>();

  for (const li of libraryItems) {
    mergedByProductId.set(li.productId, {
      productId: li.productId,
      purchasedAt: li.purchasedAt,
      expiresAt: li.expiresAt,
      isExpired: !!li.expiresAt && li.expiresAt.getTime() < now.getTime(),
      product: li.product,
    });
  }

  // Dedup fallback berdasarkan productId (ambil purchasedAt paling "baru")
  for (const item of fallbackOrderItems) {
    const purchasedAt = item.order.payment?.paidAt ?? item.order.createdAt;
    const accessExpiryDays = item.product.accessExpiryDays;
    const expiresAt = accessExpiryDays != null ? new Date(purchasedAt.getTime() + accessExpiryDays * MS_PER_DAY) : null;

    if (!mergedByProductId.has(item.productId)) {
      mergedByProductId.set(item.productId, {
        productId: item.productId,
        purchasedAt,
        expiresAt,
        isExpired: !!expiresAt && expiresAt.getTime() < now.getTime(),
        product: item.product,
      });
    }
  }

  return Array.from(mergedByProductId.values()).sort((a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime());
};

/**
 * Mendapatkan secured link download/akses untuk produk tertentu
 * Mengecek apakah user benar-benar pernah membeli produk ini dan sudah lunas.
 */
export const getAccessUrl = async (userId: string, productId: string) => {
  const now = new Date();

  // Prefer LibraryItem (entitlement + expiry snapshots)
  const libraryItem = await prisma.libraryItem.findUnique({
    where: { userId_productId: { userId, productId } },
    include: { product: true },
  });

  if (libraryItem) {
    if (libraryItem.expiresAt && libraryItem.expiresAt.getTime() < now.getTime()) {
      throw new ServiceError('Akses produk ini sudah berakhir.', 403);
    }

    if (libraryItem.product.productType === 'FILE') {
      if (!libraryItem.downloadUrlSnapshot) {
        throw new ServiceError('File untuk produk ini belum tersedia, silakan hubungi admin.', 404);
      }
      const signedUrl = await generateSignedUrl(libraryItem.downloadUrlSnapshot);
      return { url: signedUrl };
    }

    if (libraryItem.product.productType === 'COURSE' || libraryItem.product.productType === 'SUBSCRIPTION') {
      if (!libraryItem.accessUrlSnapshot) {
        throw new ServiceError('Akses untuk produk ini belum tersedia, silakan hubungi admin.', 404);
      }
      const signedUrl = await generateSignedUrl(libraryItem.accessUrlSnapshot);
      return { url: signedUrl };
    }


    throw new ServiceError('Unknown product type.', 400);
  }

  // Fallback untuk data lama (sebelum LibraryItem dibuat)
  const purchase = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: ['PAID', 'COMPLETED'] },
      },
    },
    include: {
      product: {
        select: {
          productType: true,
          downloadUrl: true,
          accessUrl: true,
          accessExpiryDays: true,
        },
      },
      order: {
        select: {
          payment: { select: { paidAt: true } },
          createdAt: true,
        },
      },
    },
  });

  if (!purchase) {
    throw new ServiceError('Anda tidak memiliki akses ke produk ini. Silakan beli terlebih dahulu.', 403);
  }

  const purchasedAt = purchase.order.payment?.paidAt ?? purchase.order.createdAt;
  const expiresAt =
    purchase.product.accessExpiryDays != null ? new Date(purchasedAt.getTime() + purchase.product.accessExpiryDays * MS_PER_DAY) : null;

  if (expiresAt && expiresAt.getTime() < now.getTime()) {
    throw new ServiceError('Akses produk ini sudah berakhir.', 403);
  }

  if (purchase.product.productType === 'FILE') {
    if (!purchase.product.downloadUrl) {
      throw new ServiceError('File untuk produk ini belum tersedia, silakan hubungi admin.', 404);
    }
    return { url: purchase.product.downloadUrl };
  }

  if (purchase.product.productType === 'COURSE' || purchase.product.productType === 'SUBSCRIPTION') {
    if (!purchase.product.accessUrl) {
      throw new ServiceError('Akses untuk produk ini belum tersedia, silakan hubungi admin.', 404);
    }
    return { url: purchase.product.accessUrl };
  }

  throw new ServiceError('Unknown product type.', 400);
};

export const getDownloadUrl = async (userId: string, productId: string) => {
  const { url } = await getAccessUrl(userId, productId);
  return { downloadUrl: url };
};
