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
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const adminEmails = env.ADMIN_BOOTSTRAP_EMAILS
      ? env.ADMIN_BOOTSTRAP_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
      : [];
    const normalizedEmail = email.trim().toLowerCase();
    const assignedRole = adminEmails.includes(normalizedEmail) ? 'ADMIN' : 'CUSTOMER';

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

    // Non-httponly role cookie for middleware hint
    res.cookie('role', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(201).json({ user, token });
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
