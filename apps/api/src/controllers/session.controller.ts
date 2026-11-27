import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

const SessionSchema = z.object({
  userId: z.string().optional(),
  guestId: z.string().optional(),
  refreshToken: z.string().optional(),
  userAgent: z.string().optional(),
  ip: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  tokens: z.record(z.string(), z.any()).optional(),
});

export const createSession = async (req: Request, res: Response) => {
  const data = SessionSchema.parse(req.body);
  const session = await prisma.session.create({
    data: {
      ...(data.userId !== undefined && { userId: data.userId }),
      ...(data.guestId !== undefined && { guestId: data.guestId }),
      refreshToken: data.refreshToken ?? `rt_${crypto.randomUUID()}`,
      userAgent: data.userAgent ?? null,
      ip: data.ip ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  res.status(201).json({ success: true, data: session });
};

export const getSession = async (req: Request, res: Response) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id } });
  if (!session) throw new AppError('Session not found', 404);
  res.json({ success: true, data: session });
};

export const updateSession = async (req: Request, res: Response) => {
  const data = SessionSchema.partial().parse(req.body);
  const session = await prisma.session.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: session });
};

export const deleteSession = async (req: Request, res: Response) => {
  await prisma.session.delete({ where: { id: req.params.id } });
  res.status(204).send();
};

export const listSessions = async (_req: Request, res: Response) => {
  const sessions = await prisma.session.findMany({ orderBy: { updatedAt: 'desc' } });
  res.json({ success: true, data: sessions });
};
