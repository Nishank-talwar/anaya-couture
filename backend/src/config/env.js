import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const requiredInProduction = ['DATABASE_URL', 'JWT_SECRET', 'COOKIE_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'];

function validateRequiredEnv() {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length === 0) return;

  const message = `Missing required environment variables: ${missing.join(', ')}`;
  if (isProd) throw new Error(message);
  console.warn(`[env] ${message}`);
}

validateRequiredEnv();

export const env = {
  port: process.env.PORT || 5050,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  cookieSecret: process.env.COOKIE_SECRET || 'change_me',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  cookieSecure: isProd,
  cookieSameSite: isProd ? 'none' : 'lax'
};
