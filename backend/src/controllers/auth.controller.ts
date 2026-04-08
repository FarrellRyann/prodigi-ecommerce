import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.ts';
import { env } from '../config/env.ts';

type AuthRequest = Request & {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
};

const createToken = (user: { id: string; email: string; role: string }) => {
  const jwtSecret = env.JWT_SECRET;

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: '1d' }
  );
};

export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body as { email?: string; password?: string; role?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const assignedRole = (role === 'ADMIN' || role === 'CUSTOMER') ? role : 'CUSTOMER';
    const normalizedEmail = email.trim().toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: assignedRole,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ user });
  } catch (error: unknown) {
    const prismaError = error as { code?: string; message?: string };

    if (prismaError?.code === 'P2002') {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    console.error('[register] failed:', error);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Non-httponly role cookie for middleware role-based routing hint
    res.cookie('role', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to login.' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.clearCookie('role', { httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return res.json({ message: 'Logged out successfully.' });
};

// ADMIN: Get all users with order counts and total spend
export const getAdminAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          where: { status: { in: ['PAID', 'COMPLETED'] } },
          select: { totalAmount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      orderCount: u._count.orders,
      totalSpent: u.orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0),
    }));

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error('[getAdminAllUsers]', error);
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
};
// User: Get own profile with stats
export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, libraryItems: true } },
        orders: {
          where: { status: { in: ['PAID', 'COMPLETED', 'PROCESSED', 'PENDING'] } },
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            items: {
              select: {
                quantity: true,
                price: true,
                product: { select: { name: true, imageUrl: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });

    const paidOrders = await prisma.order.findMany({
      where: { userId: req.user.userId, status: { in: ['PAID', 'COMPLETED'] } },
      select: { totalAmount: true },
    });
    const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      orderCount: user._count.orders,
      libraryCount: user._count.libraryItems,
      totalSpent,
      recentOrders: user.orders,
    });
  } catch (error) {
    console.error('[getProfile]', error);
    return res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};
