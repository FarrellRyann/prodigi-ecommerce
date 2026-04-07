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

// Product
export const createProductSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional().nullable(),
  price: z.coerce.number().int().positive('Price must be a positive integer'),
  productType: z.enum(['FILE', 'COURSE', 'SUBSCRIPTION']).optional().default('FILE'),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  downloadUrl: z.string().url('Invalid download URL').optional().nullable(),
  accessUrl: z.string().url('Invalid access URL').optional().nullable(),
});

export const updateProductSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').optional(),
  name: z.string().min(1, 'Product name cannot be empty').optional(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().int().positive('Price must be a positive integer').optional(),
  productType: z.enum(['FILE', 'COURSE', 'SUBSCRIPTION']).optional(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  downloadUrl: z.string().url('Invalid download URL').optional().nullable(),
  accessUrl: z.string().url('Invalid access URL').optional().nullable(),
});

// Cart
export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});
