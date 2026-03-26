const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('node:path');
const { authRouter } = require('./routes/auth.routes');
const { categoryRouter } = require('./routes/category.routes');
const { productRouter } = require('./routes/product.routes');
const cartRouter = require('./routes/cart.routes').default;
const orderRouter = require('./routes/order.routes').default;

export {};

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = process.env.PORT || 3000;

app.get('/', (req: import('express').Request, res: import('express').Response) => {
	res.send('API is running...');
});

app.use('/auth', authRouter);
app.use('/categories', categoryRouter);
app.use('/products', productRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});