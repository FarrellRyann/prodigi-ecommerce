import { prisma } from '../lib/prisma.ts';
import { ServiceError } from './errors.service.ts';

export const getCart = async (userId: string) => {
  // Cari atau buat cart jika user belum punya
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // Hitung total harga
  const totalAmount = cart.items.reduce((total: number, item: any) => total + item.product.price, 0);

  return { ...cart, totalAmount };
};

export const addToCart = async (userId: string, productId: string) => {
  // Pastikan cart pengguna ada
  let cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // Cek apakah produk digital sudah ada di cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    }
  });

  if (existingItem) {
    throw new ServiceError('Produk sudah ada di dalam keranjang.', 409);
  }

  // Check via libraryItem (source of truth for ownership)
  const libraryEntry = await prisma.libraryItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });

  if (libraryEntry) {
    throw new ServiceError('Produk ini sudah ada di library Anda.', 409);
  }

  // Fallback: also check via orderItems for orders that haven't been fulfilled to library yet
  const ownedProduct = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: ['PAID', 'PROCESSED', 'COMPLETED'] },
      },
    },
    select: { id: true },
  });

  if (ownedProduct) {
    throw new ServiceError('Produk ini sudah Anda miliki. Silakan cek library digital Anda.', 409);
  }

  // Tambahkan produk (Quantity default 1 untuk produk digital)
  const cartItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity: 1, // Produk digital umumnya hanya dibeli 1 buah
    },
    include: {
      product: true,
    },
  });

  return cartItem;
};

export const syncCart = async (userId: string, productIds: string[]) => {
  let cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // Find products already in the cart to avoid duplicates
  const existingItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    select: { productId: true },
  });

  const existingProductIds = new Set(existingItems.map((item: any) => item.productId));

  // Find products already owned via libraryItem (source of truth)
  const libraryItems = await prisma.libraryItem.findMany({
    where: { userId },
    select: { productId: true },
  });

  const libraryProductIds = new Set(libraryItems.map((item: any) => item.productId));

  // Fallback: also check via orderItems
  const ownedItems = await prisma.orderItem.findMany({
    where: {
      order: {
        userId,
        status: { in: ['PAID', 'PROCESSED', 'COMPLETED'] },
      },
    },
    select: { productId: true },
  });

  const ownedProductIds = new Set(ownedItems.map((item: any) => item.productId));

  // Filter out products already in cart, in library, or already owned
  const newProductIds = productIds.filter(
    (id) => !existingProductIds.has(id) && !libraryProductIds.has(id) && !ownedProductIds.has(id)
  );

  if (newProductIds.length > 0) {
    await prisma.cartItem.createMany({
      data: newProductIds.map((productId) => ({
        cartId: cart.id,
        productId,
        quantity: 1,
      })),
      skipDuplicates: true,
    });
  }

  return getCart(userId);
};

export const removeFromCart = async (userId: string, cartItemId: string) => {
  // Pastikan item yang dihapus milik user yang bersangkutan dengan mengecek relasi ke Cart
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem) {
    throw new ServiceError('Item tidak ditemukan di keranjang.', 404);
  }

  if (cartItem.cart.userId !== userId) {
    throw new ServiceError('Tidak memiliki akses untuk menghapus item ini.', 403);
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  return cartItem;
};


