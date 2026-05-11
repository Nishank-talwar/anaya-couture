import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';

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

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(env.port, () => {
  console.log(`✦ Anaya API running on :${env.port}`);
});
