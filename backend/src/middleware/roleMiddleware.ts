import type { NextFunction, Request, Response } from 'express';

type AuthUser = {
  userId: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
};

type AuthRequest = Request & {
  user?: AuthUser;
};

export const requireRole =
  (...allowedRoles: Array<'ADMIN' | 'CUSTOMER'>) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient role.' });
    }

    return next();
  };
