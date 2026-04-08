import { z } from 'zod';

export const xenditWebhookSchema = z.object({
  id: z.string(),
  external_id: z.string(),
  status: z.string(),
  paid_amount: z.number().optional(),
  paid_at: z.string().optional(),
  invoice_url: z.string().optional(),
});

export const checkoutSchema = z.object({
  // Add any body fields if needed in the future, currently it uses cart from DB
});

// Auth
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['ADMIN', 'CUSTOMER']).optional().default('CUSTOMER'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Category
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

// Helper: treat empty string the same as null for optional URL fields
const optionalUrl = (msg: string) =>
  z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.string().url(msg).nullable().optional()
  );

// Product
export const createProductSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Product name is required'),
  description: z.preprocess((v) => (v === '' ? null : v), z.string().nullable().optional()),
  price: z.coerce.number().int().positive('Price must be a positive integer'),
  productType: z.enum(['FILE', 'COURSE', 'SUBSCRIPTION']).optional().default('FILE'),
  imageUrl: optionalUrl('Invalid image URL'),
  downloadUrl: optionalUrl('Invalid download URL'),
  accessUrl: optionalUrl('Invalid access URL'),
});

export const updateProductSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').optional(),
  name: z.string().min(1, 'Product name cannot be empty').optional(),
  description: z.preprocess((v) => (v === '' ? null : v), z.string().nullable().optional()),
  price: z.coerce.number().int().positive('Price must be a positive integer').optional(),
  productType: z.enum(['FILE', 'COURSE', 'SUBSCRIPTION']).optional(),
  imageUrl: optionalUrl('Invalid image URL'),
  downloadUrl: optionalUrl('Invalid download URL'),
  accessUrl: optionalUrl('Invalid access URL'),
});

// Cart
export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});
