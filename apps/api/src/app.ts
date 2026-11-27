import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import productRoutes from './routes/product.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import priceRoutes from './routes/price.routes.js';
import buildRoutes from './routes/build.routes.js';
import sessionRoutes from './routes/session.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'rigverse-api', time: new Date().toISOString() });
  });

  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/sellers', sellerRoutes);
  app.use('/api/v1/prices', priceRoutes);
  app.use('/api/v1/builds', buildRoutes);
  app.use('/api/v1/sessions', sessionRoutes);

  app.use(notFound);
  app.use(errorHandler as NextFunction);

  return app;
}
