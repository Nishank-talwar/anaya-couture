import { Router } from 'express';
import { prisma } from '../db/prisma.js';

export const productsRouter = Router();

productsRouter.get('/', async (req, res) => {
  const { q, category, min, max } = req.query;
  const where = {
    ...(category ? { category: String(category) } : {}),
    ...(q ? { name: { contains: String(q), mode: 'insensitive' } } : {}),
    ...(min || max ? { price: { gte: Number(min || 0), lte: Number(max || 100000) } } : {})
  };

  const products = await prisma.product.findMany({
    where,
    include: { images: true, variants: true }
  });
  res.json(products);
});

productsRouter.get('/:slug', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { images: true, variants: true }
  });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});
