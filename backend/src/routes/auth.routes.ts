import express from 'express';
import { register, login, me, logout, getAdminAllUsers, getAdminCustomers, getProfile, updateUsername } from '../controllers/auth.controller.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { requireRole } from '../middleware/roleMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { registerSchema, loginSchema } from '../utils/validation.ts';

export const authRouter = express.Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.get('/me', authMiddleware, me);
authRouter.get('/profile', authMiddleware, getProfile);
authRouter.put('/username', authMiddleware, updateUsername);
authRouter.post('/logout', logout);

// ADMIN: GET /auth/admin/users
authRouter.get('/admin/users', authMiddleware, requireRole('ADMIN'), getAdminAllUsers);
// ADMIN: GET /auth/admin/customers (only users who bought admin's products)
authRouter.get('/admin/customers', authMiddleware, requireRole('ADMIN'), getAdminCustomers);
