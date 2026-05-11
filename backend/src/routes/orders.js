import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.get('/', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: true, payment: true }
  });
  res.json(orders);
});

ordersRouter.post('/', async (req, res) => {
  const schema = z.object({
    items: z.array(z.object({ variantId: z.string(), qty: z.number().int().min(1), price: z.number().int() })),
    subtotal: z.number().int(),
    tax: z.number().int(),
    shipping: z.number().int(),
    discount: z.number().int(),
    total: z.number().int(),
    paymentMethod: z.enum(['RAZORPAY', 'COD'])
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      subtotal: parsed.data.subtotal,
      tax: parsed.data.tax,
      shipping: parsed.data.shipping,
      discount: parsed.data.discount,
      total: parsed.data.total,
      paymentMethod: parsed.data.paymentMethod,
      items: {
        create: parsed.data.items.map(i => ({
          variantId: i.variantId,
          qty: i.qty,
          price: i.price
        }))
      }
    },
    include: { items: true }
  });

  res.json(order);
});
