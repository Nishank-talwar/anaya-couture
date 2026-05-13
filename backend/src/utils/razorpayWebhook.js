import crypto from 'crypto';
import { env } from '../config/env.js';

export function verifyRazorpaySignature(payload, signature) {
  if (typeof signature !== 'string' || !signature) return false;
  const expected = crypto
    .createHmac('sha256', env.razorpayWebhookSecret)
    .update(payload)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
