import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, login, me } from '../src/controllers/auth.controller.ts';
import { prisma } from '../src/lib/prisma.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.ts';

// Mock Prisma
vi.mock('../src/lib/prisma.ts', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

// Mock jwt
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}));

// Mock process.env locally for tests if needed, but we already use config/env
// Wait, auth.controller uses process.env.JWT_SECRET directly. Let's mock process.env
const originalEnv = process.env;

describe('Auth Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, JWT_SECRET: 'test-secret' };
    
    req = {
      body: {},
      user: undefined,
    };
    
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('register', () => {
    it('should return 400 if email or password missing', async () => {
      req.body = { email: 'test@test.com' }; // missing password
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email and password are required.' });
    });

    it('should return 409 if email already registered', async () => {
      req.body = { email: 'test@test.com', password: 'password123' };
      (bcrypt.hash as any).mockResolvedValue('hashed_password');
      (prisma.user.create as any).mockRejectedValue({ code: 'P2002' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already registered.' });
    });

    it('should register successfully and return user and token', async () => {
      req.body = { email: 'test@test.com', password: 'password123' };
      const mockUser = { id: 'user-1', email: 'test@test.com', role: 'CUSTOMER' };
      
      (bcrypt.hash as any).mockResolvedValue('hashed_password');
      (prisma.user.create as any).mockResolvedValue(mockUser);
      (jwt.sign as any).mockReturnValue('mock_token');

      await register(req, res);

      expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: { email: 'test@test.com', password: 'hashed_password' }
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser, token: 'mock_token' });
    });
  });

  describe('login', () => {
    it('should return 400 if email or password missing', async () => {
      req.body = { email: 'test@test.com' }; // missing password
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email and password are required.' });
    });

    it('should return 401 if user not found', async () => {
      req.body = { email: 'test@test.com', password: 'password123' };
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email or password.' });
    });

    it('should return 401 if password invalid', async () => {
      req.body = { email: 'test@test.com', password: 'password123' };
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'user-1', password: 'hashed_password' });
      (bcrypt.compare as any).mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email or password.' });
    });

    it('should login successfully and return token', async () => {
      req.body = { email: 'test@test.com', password: 'password123' };
      const mockUser = { id: 'user-1', email: 'test@test.com', password: 'hashed_password', role: 'CUSTOMER' };
      
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      (jwt.sign as any).mockReturnValue('mock_token');

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: 'mock_token',
        user: { id: 'user-1', email: 'test@test.com', role: 'CUSTOMER' }
      });
    });
  });

  describe('me', () => {
    it('should return 401 if not authorized', async () => {
      await me(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized.' });
    });

    it('should return 404 if user not found', async () => {
      req.user = { userId: 'user-1' };
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found.' });
    });

    it('should return user profile', async () => {
      req.user = { userId: 'user-1' };
      const mockUser = { id: 'user-1', email: 'test@test.com', role: 'CUSTOMER' };
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      await me(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.any(Object)
      });
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });
});
