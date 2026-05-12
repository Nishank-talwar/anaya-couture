import express from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { razorpay } from '../utils/razorpay.js';
import { verifyRazorpayCheckoutSignature, verifyRazorpayWebhookSignature } from '../utils/razorpayWebhook.js';
import { env } from '../config/env.js';

export const paymentsRouter = Router();

paymentsRouter.post('/razorpay/order', requireAuth, async (req, res) => {
  const schema = z.object({ orderId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: req.user.id }
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.paymentMethod !== 'RAZORPAY') return res.status(400).json({ error: 'Order payment method is not Razorpay' });
  if (!env.razorpayKeyId || !env.razorpayKeySecret) return res.status(500).json({ error: 'Razorpay is not configured' });

  const rpOrder = await razorpay.orders.create({
    amount: order.total * 100,
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

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: req.user.id },
    include: { payment: true }
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!order.payment || order.payment.razorpayOrderId !== parsed.data.razorpayOrderId) {
    return res.status(400).json({ error: 'Invalid Razorpay order reference' });
  }

  const ok = verifyRazorpayCheckoutSignature(parsed.data.razorpayOrderId, parsed.data.razorpayPaymentId, parsed.data.razorpaySignature);
  if (!ok) return res.status(400).json({ error: 'Invalid signature' });

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { orderId: parsed.data.orderId },
      data: {
        razorpayOrderId: parsed.data.razorpayOrderId,
        razorpayPaymentId: parsed.data.razorpayPaymentId,
        razorpaySignature: parsed.data.razorpaySignature,
        status: 'CAPTURED'
      }
    });

    await tx.order.update({
      where: { id: parsed.data.orderId },
      data: { status: 'PAID' }
    });
  });

  res.json({ ok: true });
});

paymentsRouter.post('/razorpay/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (typeof signature !== 'string') return res.status(400).json({ error: 'Missing signature' });
  if (!env.razorpayWebhookSecret) return res.status(500).json({ error: 'Razorpay webhook is not configured' });

  const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
  if (!verifyRazorpayWebhookSignature(payload, signature)) return res.status(400).json({ error: 'Invalid signature' });

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const paymentEntity = event?.payload?.payment?.entity;
  const razorpayOrderId = paymentEntity?.order_id;
  const razorpayPaymentId = paymentEntity?.id;
  if (!razorpayOrderId && !razorpayPaymentId) return res.json({ ok: true });

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        razorpayOrderId ? { razorpayOrderId } : undefined,
        razorpayPaymentId ? { razorpayPaymentId } : undefined
      ].filter(Boolean)
    },
    select: { orderId: true }
  });

  if (!payment) return res.json({ ok: true });

  if (event.event === 'payment.captured') {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: payment.orderId },
        data: {
          status: 'CAPTURED',
          razorpayOrderId: razorpayOrderId || undefined,
          razorpayPaymentId: razorpayPaymentId || undefined
        }
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' }
      });
    });
  } else if (event.event === 'payment.failed') {
    await prisma.payment.update({
      where: { orderId: payment.orderId },
      data: {
        status: 'FAILED',
        razorpayOrderId: razorpayOrderId || undefined,
        razorpayPaymentId: razorpayPaymentId || undefined
      }
    });
  } else if (event.event === 'payment.refunded') {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: payment.orderId },
        data: {
          status: 'REFUNDED',
          razorpayOrderId: razorpayOrderId || undefined,
          razorpayPaymentId: razorpayPaymentId || undefined
        }
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'REFUNDED' }
      });
    });
  }

  res.json({ ok: true });
});
