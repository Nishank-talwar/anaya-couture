import express from 'express';
import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { razorpay } from '../utils/razorpay.js';
import { verifyRazorpaySignature } from '../utils/razorpayWebhook.js';
import { env } from '../config/env.js';

export const paymentsRouter = Router();

function verifyCheckoutSignature(orderId, paymentId, signature) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(body)
    .digest('hex');
  return expected === signature;
}

paymentsRouter.post('/razorpay/order', requireAuth, async (req, res) => {
  const schema = z.object({ orderId: z.string(), amount: z.number().int() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const rpOrder = await razorpay.orders.create({
    amount: parsed.data.amount * 100,
    currency: 'INR',
    receipt: order.id
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { razorpayOrderId: rpOrder.id, method: 'RAZORPAY', status: 'CREATED' },
    create: { orderId: order.id, razorpayOrderId: rpOrder.id, method: 'RAZORPAY', status: 'CREATED' }
  });

  res.json({ orderId: rpOrder.id, keyId: env.razorpayKeyId });
});

paymentsRouter.post('/razorpay/verify', requireAuth, async (req, res) => {
  const schema = z.object({
    orderId: z.string(),
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const ok = verifyCheckoutSignature(parsed.data.razorpayOrderId, parsed.data.razorpayPaymentId, parsed.data.razorpaySignature);
  if (!ok) return res.status(400).json({ error: 'Invalid signature' });

  await prisma.payment.update({
    where: { orderId: parsed.data.orderId },
    data: {
      razorpayOrderId: parsed.data.razorpayOrderId,
      razorpayPaymentId: parsed.data.razorpayPaymentId,
      razorpaySignature: parsed.data.razorpaySignature,
      status: 'CAPTURED'
    }
  });

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { status: 'PAID' }
  });

  res.json({ ok: true });
});

paymentsRouter.post('/razorpay/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const payload = req.body.toString('utf8');
  if (!verifyRazorpaySignature(payload, signature)) return res.status(400).json({ error: 'Invalid signature' });

  const event = JSON.parse(payload);
  if (event.event === 'payment.captured') {
    const paymentId = event.payload.payment.entity.id;
    await prisma.payment.updateMany({
      where: { razorpayPaymentId: paymentId },
      data: { status: 'CAPTURED' }
    });
  }

  res.json({ ok: true });
});
