import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { categoryRouter } from '../src/routes/category.routes.ts';
import * as categoryService from '../src/services/category.service.ts';

// Mock the service
vi.mock('../src/services/category.service.ts');

// Mock prisma
vi.mock('../src/lib/prisma.ts', () => ({
  prisma: {}
}));

// Mock authMiddleware
vi.mock('../src/middleware/authMiddleware.ts', () => ({
  authMiddleware: (req: any, res: any, next: any) => next()
}));

// Mock env
vi.mock('../src/config/env.ts', () => ({
  env: {
    NODE_ENV: 'test',
    JWT_SECRET: 'test_secret'
  }
}));

const app = express();
app.use(express.json());
app.use('/categories', categoryRouter);

describe('Category Routes Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /categories should return list of categories', async () => {
    const mockCategories = [{ id: '1', name: 'Electronics', _count: { products: 0 } }];
    (categoryService.getCategories as any).mockResolvedValue(mockCategories);

    const response = await request(app).get('/categories');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCategories);
    expect(categoryService.getCategories).toHaveBeenCalled();
  });

  it('POST /categories should create a category', async () => {
    const mockCategory = { id: '1', name: 'Electronics' };
    (categoryService.createCategory as any).mockResolvedValue(mockCategory);

    const response = await request(app)
      .post('/categories')
      .send({ name: 'Electronics' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockCategory);
    expect(categoryService.createCategory).toHaveBeenCalledWith('Electronics');
  });

  it('GET /categories/:id should return a category', async () => {
    const mockCategory = { id: '1', name: 'Electronics', products: [] };
    (categoryService.getCategoryById as any).mockResolvedValue(mockCategory);

    const response = await request(app).get('/categories/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCategory);
    expect(categoryService.getCategoryById).toHaveBeenCalledWith('1');
  });
});
