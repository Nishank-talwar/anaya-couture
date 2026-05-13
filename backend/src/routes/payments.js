import express, { Router } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { getRazorpayClient } from '../utils/razorpay.js';
import { verifyRazorpaySignature } from '../utils/razorpayWebhook.js';
import { env } from '../config/env.js';

export const paymentsRouter = Router();

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment requests. Please try again shortly.' }
});

function ensureRazorpayConfigured() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret || !env.razorpayWebhookSecret) {
    return false;
  }
  return true;
}

function verifyCheckoutSignature(orderId, paymentId, signature) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(body)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

paymentsRouter.post('/razorpay/order', paymentLimiter, requireAuth, async (req, res) => {
  if (!ensureRazorpayConfigured()) return res.status(503).json({ error: 'Razorpay is not configured' });
  const razorpay = getRazorpayClient();
  if (!razorpay) return res.status(503).json({ error: 'Razorpay is not configured' });

  const schema = z.object({ orderId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: req.user.id }
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.paymentMethod !== 'RAZORPAY') return res.status(400).json({ error: 'Order payment method mismatch' });

  const amountInPaise = order.total * 100;

  const rpOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: order.id
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: {
      razorpayOrderId: rpOrder.id,
      method: 'RAZORPAY',
      status: 'CREATED'
    },
    create: {
      orderId: order.id,
      razorpayOrderId: rpOrder.id,
      method: 'RAZORPAY',
      status: 'CREATED'
    }
  });

  res.json({
    orderId: rpOrder.id,
    keyId: env.razorpayKeyId,
    amount: amountInPaise,
    currency: 'INR'
  });
});

paymentsRouter.post('/razorpay/verify', paymentLimiter, requireAuth, async (req, res) => {
  if (!ensureRazorpayConfigured()) return res.status(503).json({ error: 'Razorpay is not configured' });

  const schema = z.object({
    orderId: z.string(),
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const order = await prisma.order.findFirst({ where: { id: parsed.data.orderId, userId: req.user.id } });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const payment = await prisma.payment.findUnique({ where: { orderId: parsed.data.orderId } });
  if (!payment || payment.razorpayOrderId !== parsed.data.razorpayOrderId) {
    return res.status(400).json({ error: 'Payment order mismatch' });
  }

  const ok = verifyCheckoutSignature(
    parsed.data.razorpayOrderId,
    parsed.data.razorpayPaymentId,
    parsed.data.razorpaySignature
  );
  if (!ok) return res.status(400).json({ error: 'Invalid signature' });

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId: parsed.data.orderId },
      data: {
        razorpayOrderId: parsed.data.razorpayOrderId,
        razorpayPaymentId: parsed.data.razorpayPaymentId,
        razorpaySignature: parsed.data.razorpaySignature,
        status: 'CAPTURED'
      }
    }),
    prisma.order.update({
      where: { id: parsed.data.orderId },
      data: { status: 'PAID' }
    })
  ]);

  res.json({ ok: true });
});

paymentsRouter.post('/razorpay/webhook', paymentLimiter, express.raw({ type: '*/*' }), async (req, res) => {
  if (!ensureRazorpayConfigured()) return res.status(503).json({ error: 'Razorpay is not configured' });

  const signature = req.headers['x-razorpay-signature'];
  const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body || '');
  if (!verifyRazorpaySignature(payload, signature)) return res.status(400).json({ error: 'Invalid signature' });

  const event = JSON.parse(payload);

  const eventType = event?.event;
  const paymentEntity = event?.payload?.payment?.entity;
  const refundEntity = event?.payload?.refund?.entity;

  if (eventType === 'payment.captured' && paymentEntity?.id) {
    await prisma.payment.updateMany({
      where: { razorpayPaymentId: paymentEntity.id },
      data: { status: 'CAPTURED' }
    });
    if (paymentEntity.order_id) {
      await prisma.order.updateMany({
        where: { payment: { razorpayOrderId: paymentEntity.order_id } },
        data: { status: 'PAID' }
      });
    }
    return res.json({ ok: true });
  }

  if (eventType === 'payment.failed' && paymentEntity?.id) {
    await prisma.payment.updateMany({
      where: { razorpayPaymentId: paymentEntity.id },
      data: { status: 'FAILED' }
    });
    return res.json({ ok: true });
  }

  if (eventType === 'payment.refunded') {
    const paymentId = paymentEntity?.id || refundEntity?.payment_id;
    if (paymentId) {
      await prisma.payment.updateMany({
        where: { razorpayPaymentId: paymentId },
        data: { status: 'REFUNDED' }
      });
      await prisma.order.updateMany({
        where: { payment: { razorpayPaymentId: paymentId } },
        data: { status: 'REFUNDED' }
      });
    }
    return res.json({ ok: true });
  }

  return res.json({ ok: true });
});
