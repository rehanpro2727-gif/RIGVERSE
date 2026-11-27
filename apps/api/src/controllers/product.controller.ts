import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const ProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  brand: z.string().optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  specs: z.record(z.string(), z.any()).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  releaseDate: z.string().datetime().optional(),
  price: z.number().positive(),
  mrp: z.number().positive().optional(),
  sellerId: z.string().optional(),
  inStock: z.boolean().default(true),
});

export const createProduct = async (req: Request, res: Response) => {
  const data = ProductSchema.parse(req.body);
  const slug = data.slug || slugify(data.name);
  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      brand: data.brand ?? null,
      category: data.category,
      subcategory: data.subcategory ?? null,
      specs: data.specs ?? {},
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? '',
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
      prices: data.sellerId && data.price != null
        ? {
            create: {
              sellerId: data.sellerId,
              price: data.price,
              originalPrice: data.mrp ?? null,
              inStock: data.inStock,
              contentHash: `${data.sellerId}:${slug}:${Date.now()}`,
              url: data.imageUrl ?? '',
              scrapedAt: new Date(),
            },
          }
        : undefined,
    },
    include: { prices: true },
  });
  res.status(201).json({ success: true, data: product });
};

export const listProducts = async (req: Request, res: Response) => {
  const { category, search, page = '1', limit = '24' } = req.query;
  const take = Math.min(parseInt(limit as string, 10) || 24, 100);
  const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
  const skip = (pageNum - 1) * take;
  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (search) {
    where.name = { contains: search as string, mode: 'insensitive' };
  }
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);
  res.json({ success: true, data: products, meta: { total, page: pageNum, limit: take } });
};

export const getProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const data = ProductSchema.partial().parse(req.body);
  const updateData: Record<string, unknown> = { ...data };
  if (data.name && !data.slug) {
    updateData.slug = slugify(data.name);
  }
  if (data.releaseDate) {
    updateData.releaseDate = new Date(data.releaseDate);
  }
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: updateData,
  });
  res.json({ success: true, data: product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
