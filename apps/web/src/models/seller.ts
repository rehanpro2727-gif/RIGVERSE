// RIGVERSE — Seller & Shipping Data Models

import type { SellerType } from '@shared/types';

export interface ShippingPolicy {
  freeAbove: number;           // INR order value for free shipping
  flatRate: number;            // INR
  deliveryDays: {
    min: number;
    max: number;
  };
  cashOnDelivery: boolean;
}

export interface PriceRecord {
  id: string;
  productId: string;
  sellerId: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  stockQty?: number;
  scrapedAt: Date;
  url: string;
  currency: 'INR';
  contentHash: string;
}

export interface ScrapeLog {
  id: string;
  sellerId: string;
  productId?: string;
  status: 'success' | 'failed' | 'timeout';
  latencyMs?: number;
  error?: string;
  rawPayload?: unknown;
  createdAt: Date;
}

export interface Seller {
  id: string;
  name: string;
  domain: string;
  logoUrl: string;
  type: SellerType;
  region: string;
  shipping: ShippingPolicy;
  reliability: number;
  lastScrapedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  prices: PriceRecord[];
  scrapeLogs: ScrapeLog[];

  // Computed properties
  get isDistributor(): boolean;
  get isRetailer(): boolean;
  get isMarketplace(): boolean;
}