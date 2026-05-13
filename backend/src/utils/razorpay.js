import Razorpay from 'razorpay';
import { env } from '../config/env.js';

let razorpayClient = null;

export function getRazorpayClient() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) return null;
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret
    });
  }
  return razorpayClient;
}
