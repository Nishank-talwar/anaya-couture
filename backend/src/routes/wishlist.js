import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get('/', async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    include: { product: { include: { images: true } } }
  });
  res.json(items);
});

wishlistRouter.post('/:productId', async (req, res) => {
  const existing = await prisma.wishlistItem.findFirst({
    where: { userId: req.user.id, productId: req.params.productId }
  });
  if (existing) return res.json(existing);

  const item = await prisma.wishlistItem.create({
    data: { userId: req.user.id, productId: req.params.productId }
  });
  res.json(item);
});

wishlistRouter.delete('/:productId', async (req, res) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.user.id, productId: req.params.productId }
  });
  res.json({ ok: true });
});
