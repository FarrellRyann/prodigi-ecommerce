import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', authMiddleware, me);
