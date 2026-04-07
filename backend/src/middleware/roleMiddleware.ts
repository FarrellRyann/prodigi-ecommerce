import type { NextFunction, Request, Response } from 'express';

import { ServiceError } from '../services/errors.service.ts';

type AuthUser = {
  userId: string;
  email: string;
  role: string;
};

type AuthRequest = Request & {
  user?: AuthUser;
};

export const requireRole =
  (allowedRole: 'ADMIN' | 'CUSTOMER') =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role) {
      return next(new ServiceError('Unauthorized.', 401));
    }

    if (role !== allowedRole) {
      return next(new ServiceError('Forbidden.', 403));
    }

    return next();
  };

