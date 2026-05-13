import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const cartRouter = Router();

cartRouter.use(requireAuth);

const cartInputSchema = z.object({
  variantId: z.string().optional(),
  productId: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  qty: z.number().int().min(1)
});

async function resolveVariantId(input) {
  if (input.variantId) return input.variantId;
  if (!input.productId) return null;

  const variant = await prisma.variant.findFirst({
    where: {
      productId: input.productId,
      ...(input.size ? { size: input.size } : {}),
      ...(input.color ? { color: input.color } : {})
    },
    orderBy: { id: 'asc' }
  });

  return variant?.id || null;
}

cartRouter.get('/', async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { variant: { include: { product: { include: { images: true } } } } }
  });
  res.json(items);
});

cartRouter.post('/', async (req, res) => {
  const parsed = cartInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const variantId = await resolveVariantId(parsed.data);
  if (!variantId) return res.status(400).json({ error: 'Variant not found for selected product options' });

  const existing = await prisma.cartItem.findFirst({
    where: { userId: req.user.id, variantId }
  });

  const item = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + parsed.data.qty }
      })
    : await prisma.cartItem.create({
        data: { userId: req.user.id, variantId, qty: parsed.data.qty }
      });

  const itemWithVariant = await prisma.cartItem.findUnique({
    where: { id: item.id },
    include: { variant: { include: { product: { include: { images: true } } } } }
  });

  res.json(itemWithVariant);
});

cartRouter.patch('/:id', async (req, res) => {
  const schema = z.object({ qty: z.number().int().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  const updated = await prisma.cartItem.update({
    where: { id: req.params.id },
    data: { qty: parsed.data.qty }
  });
  res.json(updated);
});

cartRouter.delete('/:id', async (req, res) => {
  const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  await prisma.cartItem.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
