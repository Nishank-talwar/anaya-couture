import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { cartRouter } from './routes/cart.js';
import { ordersRouter } from './routes/orders.js';
import { wishlistRouter } from './routes/wishlist.js';
import { adminRouter } from './routes/admin.js';
import { paymentsRouter } from './routes/payments.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser(env.cookieSecret));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'anaya-api' });
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/admin', adminRouter);
app.use('/api/payments', paymentsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(env.port, () => {
  console.log(`✦ Anaya API running on :${env.port}`);
});
