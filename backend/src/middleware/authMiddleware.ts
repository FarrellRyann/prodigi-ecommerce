import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type JwtPayload = {
  userId: string;
  email: string;
  role: string;
};

type AuthRequest = Request & {
  user?: JwtPayload;
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Token is required.' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({ error: 'JWT_SECRET is not configured.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    if (!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token payload.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
  }
};
