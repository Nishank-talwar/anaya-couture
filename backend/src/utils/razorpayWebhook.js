import crypto from 'crypto';
import { env } from '../config/env.js';

function timingSafeHexEqual(expected, received) {
  if (!expected || !received || expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
}

export function verifyRazorpayWebhookSignature(payload, signature) {
  if (!payload || !signature || !env.razorpayWebhookSecret) return false;
  const expected = crypto
    .createHmac('sha256', env.razorpayWebhookSecret)
    .update(payload)
    .digest('hex');
  return timingSafeHexEqual(expected, signature);
}

export function verifyRazorpayCheckoutSignature(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature || !env.razorpayKeySecret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(body)
    .digest('hex');
  return timingSafeHexEqual(expected, signature);
}
