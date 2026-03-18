import type { Request, Response } from 'express';

const bcrypt = require('bcrypt') as typeof import('bcrypt');
const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');
const { prisma } = require('../lib/prisma') as { prisma: import('../generated/client').PrismaClient };

type AuthRequest = Request & {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
};

const createToken = (user: { id: string; email: string; role: string }) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured.');
  }

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

const register = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
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

    return res.status(201).json({ user, token });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };

    if (prismaError.code === 'P2002') {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    return res.status(500).json({ error: 'Failed to register user.' });
  }
};

const login = async (req: Request, res: Response) => {
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

const me = async (req: AuthRequest, res: Response) => {
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

module.exports = {
  register,
  login,
  me,
};
