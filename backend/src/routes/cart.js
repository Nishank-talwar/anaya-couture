import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get('/', async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { variant: { include: { product: { include: { images: true } } } } }
  });
  res.json(items);
});

cartRouter.post('/', async (req, res) => {
  const schema = z.object({ variantId: z.string(), qty: z.number().int().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { variantId, qty } = parsed.data;

  const existing = await prisma.cartItem.findFirst({
    where: { userId: req.user.id, variantId }
  });

  const item = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + qty }
      })
    : await prisma.cartItem.create({
        data: { userId: req.user.id, variantId, qty }
      });

  res.json(item);
});

cartRouter.patch('/:id', async (req, res) => {
  const schema = z.object({ qty: z.number().int().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const item = await prisma.cartItem.update({
    where: { id: req.params.id },
    data: { qty: parsed.data.qty }
  });
  res.json(item);
});

cartRouter.delete('/:id', async (req, res) => {
  await prisma.cartItem.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
