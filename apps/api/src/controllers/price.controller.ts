import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

const PriceRecordSchema = z.object({
  productId: z.string(),
  sellerId: z.string(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  inStock: z.boolean().default(true),
  stockQty: z.number().int().nonnegative().optional(),
  scrapedAt: z.string().datetime().optional(),
  url: z.string().url().optional(),
  currency: z.string().default('INR'),
  contentHash: z.string().optional(),
});

export const createPriceRecord = async (req: Request, res: Response) => {
  const data = PriceRecordSchema.parse(req.body);
  const record = await prisma.priceRecord.create({
    data: {
      productId: data.productId,
      sellerId: data.sellerId,
      price: data.price,
      originalPrice: data.originalPrice ?? null,
      inStock: data.inStock,
      stockQty: data.stockQty ?? null,
      scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : new Date(),
      url: data.url ?? '',
      currency: data.currency,
      contentHash: data.contentHash ?? `${data.productId}:${data.sellerId}:${Date.now()}`,
    },
    include: { product: true, seller: true },
  });
  res.status(201).json({ success: true, data: record });
};

export const listPriceRecords = async (req: Request, res: Response) => {
  const { productId, sellerId } = req.query;
  const where: Record<string, unknown> = {};
  if (productId) where.productId = productId as string;
  if (sellerId) where.sellerId = sellerId as string;
  const records = await prisma.priceRecord.findMany({
    where,
    orderBy: { scrapedAt: 'desc' },
    include: { product: true, seller: true },
  });
  res.json({ success: true, data: records });
};

export const getPriceRecord = async (req: Request, res: Response) => {
  const record = await prisma.priceRecord.findUnique({
    where: { id: req.params.id },
    include: { product: true, seller: true },
  });
  if (!record) throw new AppError('Price record not found', 404);
  res.json({ success: true, data: record });
};

export const deletePriceRecord = async (req: Request, res: Response) => {
  await prisma.priceRecord.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
