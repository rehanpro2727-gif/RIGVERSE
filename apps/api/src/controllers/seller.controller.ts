import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

const SellerSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1).optional(),
  type: z.enum(['DISTRIBUTOR', 'RETAILER', 'MARKETPLACE']),
  website: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  logoUrl: z.string().url().optional(),
  region: z.string().optional(),
});

export const createSeller = async (req: Request, res: Response) => {
  const data = SellerSchema.parse(req.body);
  const domain = data.domain || slugify(data.name);
  const seller = await prisma.seller.create({
    data: {
      name: data.name,
      domain,
      type: data.type,
      website: data.website ?? null,
      contactEmail: data.contactEmail ?? null,
      logoUrl: data.logoUrl ?? null,
      region: data.region ?? 'pan-india',
    },
  });
  res.status(201).json({ success: true, data: seller });
};

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const listSellers = async (_req: Request, res: Response) => {
  const sellers = await prisma.seller.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { prices: true } } },
  });
  res.json({ success: true, data: sellers });
};

export const getSeller = async (req: Request, res: Response) => {
  const seller = await prisma.seller.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { prices: true } } },
  });
  if (!seller) throw new AppError('Seller not found', 404);
  res.json({ success: true, data: seller });
};

export const updateSeller = async (req: Request, res: Response) => {
  const data = SellerSchema.partial().parse(req.body);
  const seller = await prisma.seller.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: seller });
};

export const deleteSeller = async (req: Request, res: Response) => {
  await prisma.seller.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
