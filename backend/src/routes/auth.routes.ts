import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { validate } from '../middleware/validate.ts';
import { registerSchema, loginSchema } from '../utils/validation.ts';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.get('/me', authMiddleware, me);
