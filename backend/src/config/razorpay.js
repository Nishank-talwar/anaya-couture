import { env } from '../config/env.js';

env.razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
env.razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
env.razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
