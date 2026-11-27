import { NextFunction, Request, Response } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  guestId?: string;
  isGuest?: boolean;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  // In production, validate the JWT/access token here.
  // For now, any Bearer token is accepted; the token value identifies the session.
  const token = authHeader.split(' ')[1];
  req.userId = token;
  next();
};

export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    req.userId = authHeader.split(' ')[1];
  }
  next();
};
