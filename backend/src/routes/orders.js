import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

const orderSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().optional(),
    productId: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    qty: z.number().int().min(1),
    price: z.number().int().optional()
  })).min(1),
  discount: z.number().int().min(0).optional(),
  paymentMethod: z.enum(['RAZORPAY', 'COD']),
  shippingAddress: z.object({
    name: z.string().min(2),
    phone: z.string().min(5),
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    postal: z.string().min(3)
  }).optional()
});

async function resolveVariant(item) {
  if (item.variantId) {
    return prisma.variant.findUnique({
      where: { id: item.variantId },
      include: { product: true }
    });
  }

  if (!item.productId) return null;

  return prisma.variant.findFirst({
    where: {
      productId: item.productId,
      ...(item.size ? { size: item.size } : {}),
      ...(item.color ? { color: item.color } : {})
    },
    include: { product: true },
    orderBy: { id: 'asc' }
  });
}

ordersRouter.get('/', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: {
      items: { include: { variant: { include: { product: { include: { images: true } } } } } },
      payment: true,
      shippingAddr: true
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

ordersRouter.post('/', async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const resolvedItems = [];
  for (const item of parsed.data.items) {
    const variant = await resolveVariant(item);
    if (!variant) return res.status(400).json({ error: 'Variant not found for one or more items' });

    resolvedItems.push({
      variantId: variant.id,
      qty: item.qty,
      price: variant.product.price
    });
  }

  const subtotal = resolvedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = Math.min(parsed.data.discount || 0, subtotal);
  const taxableAmount = Math.max(subtotal - discount, 0);
  const tax = Math.floor(taxableAmount * 0.05);
  const shipping = taxableAmount >= 1999 ? 0 : 99;
  const total = taxableAmount + tax + shipping;

  let shippingAddrId;
  if (parsed.data.shippingAddress) {
    const createdAddress = await prisma.address.create({
      data: {
        userId: req.user.id,
        label: 'Shipping',
        ...parsed.data.shippingAddress
      }
    });
    shippingAddrId = createdAddress.id;
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: req.user.id,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        paymentMethod: parsed.data.paymentMethod,
        shippingAddrId,
        status: parsed.data.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
        items: {
          create: resolvedItems
        }
      },
      include: {
        items: { include: { variant: true } },
        shippingAddr: true
      }
    });

    await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
    return created;
  });

  res.json(order);
});
