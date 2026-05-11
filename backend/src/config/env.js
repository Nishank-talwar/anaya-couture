import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 5050,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  cookieSecret: process.env.COOKIE_SECRET || 'change_me',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};
