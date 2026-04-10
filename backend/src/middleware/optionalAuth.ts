import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type JwtPayload = { userId: string; email: string; role: string };
type AuthRequest = Request & { user?: JwtPayload };

/**
 * Like authMiddleware but does NOT return 401 if no token present.
 * Used for public routes that need to know WHO is calling (e.g. admin scoping on GET /products).
 */
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = req.cookies?.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

  if (!token) return next(); // anonymous — just proceed

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return next();

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    if (decoded.userId) req.user = decoded;
  } catch {
    // invalid / expired token — treat as anonymous
  }

  next();
};
