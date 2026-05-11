import crypto from 'crypto';
import { env } from '../config/env.js';

export function verifyRazorpaySignature(payload, signature) {
  const expected = crypto
    .createHmac('sha256', env.razorpayWebhookSecret)
    .update(payload)
    .digest('hex');
  return expected === signature;
}
