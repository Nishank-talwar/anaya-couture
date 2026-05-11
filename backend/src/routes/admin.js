import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/orders', async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: true, user: true, payment: true }
  });
  res.json(orders);
});

adminRouter.patch('/orders/:id', async (req, res) => {
  const schema = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status }
  });
  res.json(order);
});

adminRouter.post('/products', async (req, res) => {
  const schema = z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    category: z.string(),
    subcategory: z.string(),
    price: z.number().int(),
    original: z.number().int(),
    tags: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    variants: z.array(z.object({ size: z.string(), color: z.string(), colorHex: z.string().optional(), stock: z.number().int(), sku: z.string() }))
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      category: parsed.data.category,
      subcategory: parsed.data.subcategory,
      price: parsed.data.price,
      original: parsed.data.original,
      tags: parsed.data.tags,
      images: { create: parsed.data.images.map((url, idx) => ({ url, sort: idx })) },
      variants: { create: parsed.data.variants }
    },
    include: { images: true, variants: true }
  });

  res.json(product);
});
