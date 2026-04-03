import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.ts';
import { authRouter } from './routes/auth.routes.ts';
import { categoryRouter } from './routes/category.routes.ts';
import { productRouter } from './routes/product.routes.ts';
import { cartRouter } from './routes/cart.routes.ts';
import { orderRouter } from './routes/order.routes.ts';
import { isServiceError } from './services/errors.service.ts';

const app = express();

app.use(helmet({
	crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

app.use(cors());
app.use(express.json());
app.use(limiter);
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

const PORT = env.PORT;

app.get('/', (req, res) => {
	res.send('ProDigi API is running...');
});

app.use('/auth', authRouter);
app.use('/categories', categoryRouter);
app.use('/products', productRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);

// Global error handler (maps ServiceError to HTTP response)
// Keep last so it catches errors from routes above
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
	if (isServiceError(err)) {
		return res.status(err.statusCode ?? 500).json({ error: err.message });
	}
	console.error('[Unhandled Error]', err);
	return res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});