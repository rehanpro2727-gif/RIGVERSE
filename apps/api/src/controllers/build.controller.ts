import { Request, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

const BuildComponentSchema = z.object({
  productId: z.string(),
  category: z.string(),
  position: z.string().optional(),
  rotation: z.string().optional(),
  mountPointId: z.string().optional(),
  locked: z.boolean().default(false),
  hidden: z.boolean().default(false),
});

const BuildSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  stage: z.enum(['FORGE', 'STUDIO', 'SHOWCASE']).default('FORGE'),
  visibility: z.enum(['PRIVATE', 'SHARED', 'PUBLIC']).default('PRIVATE'),
  components: z.array(BuildComponentSchema).default([]),
  accessories: z.array(z.record(z.string(), z.any())).default([]),
  totals: z.record(z.string(), z.any()).default({}),
  compatReport: z.record(z.string(), z.any()).optional(),
  sceneState: z.record(z.string(), z.any()).default({}),
  isPublic: z.boolean().default(false),
});

export const createBuild = async (req: Request, res: Response) => {
  const data = BuildSchema.parse(req.body);
  const authReq = req as any;
  const userId = authReq.userId;
  const build = await prisma.build.create({
    data: {
      title: data.title || data.name || 'Untitled Build',
      stage: data.stage,
      visibility: data.visibility,
      userId: userId ?? null,
      components: data.components,
      accessories: data.accessories,
      totals: data.totals,
      ...(data.compatReport !== undefined
        && { compatReport: data.compatReport === null ? Prisma.JsonNull : (data.compatReport as unknown as Prisma.InputJsonValue) }),
      sceneState: data.sceneState,
    },
  });
  res.status(201).json({ success: true, data: build });
};

export const listBuilds = async (req: Request, res: Response) => {
  const authReq = req as any;
  const userId = authReq.userId;
  const { stage, visibility, page = '1', limit = '24' } = req.query;
  const take = Math.min(parseInt(limit as string, 10) || 24, 100);
  const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
  const skip = (pageNum - 1) * take;
  const where: Record<string, unknown> = {};
  if (stage) where.stage = stage;
  if (visibility) where.visibility = visibility;
  if (userId) where.userId = userId;
  else where.visibility = { not: 'PRIVATE' };
  const [builds, total] = await prisma.$transaction([
    prisma.build.findMany({ where, skip, take, orderBy: { updatedAt: 'desc' } }),
    prisma.build.count({ where }),
  ]);
  res.json({ success: true, data: builds, meta: { total, page: pageNum, limit: take } });
};

export const getBuild = async (req: Request, res: Response) => {
  const build = await prisma.build.findUnique({
    where: { id: req.params.id },
  });
  if (!build) throw new AppError('Build not found', 404);
  res.json({ success: true, data: build });
};

export const updateBuild = async (req: Request, res: Response) => {
  const data = BuildSchema.partial().parse(req.body);
  const build = await prisma.build.update({
    where: { id: req.params.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.stage !== undefined && { stage: data.stage }),
      ...(data.visibility !== undefined && { visibility: data.visibility }),
      ...(data.components !== undefined && { components: data.components }),
      ...(data.accessories !== undefined && { accessories: data.accessories }),
      ...(data.totals !== undefined && { totals: data.totals }),
      ...(data.compatReport !== undefined
        && { compatReport: data.compatReport === null ? Prisma.JsonNull : (data.compatReport as unknown as Prisma.InputJsonValue) }),
      ...(data.sceneState !== undefined && { sceneState: data.sceneState }),
    },
  });
  res.json({ success: true, data: build });
};

export const deleteBuild = async (req: Request, res: Response) => {
  await prisma.build.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
