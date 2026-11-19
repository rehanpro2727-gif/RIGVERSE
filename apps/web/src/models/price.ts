// RIGVERSE — Price Data Models

import { PriceFreshness } from '@shared/types';

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

export interface SellerPrice {
  sellerId: string;
  sellerName: string;
  price: number;
  inStock: boolean;
  originalPrice?: number;
  discountPct?: number;
  shipping: number;
  total: number;
}

export interface PriceSnapshot {
  productId: string;
  bestPrice: number;
  bestSellerId: string;
  bestSellerName: string;
  sellers: SellerPrice[];
  avgPrice: number;
  priceRange: { min: number; max: number };
  freshness: PriceFreshness;
  lastUpdated: Date;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  date: string;
  price: number;
  sellerId: string;
  total: number;
}

export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  targetPrice: number;
  triggered: boolean;
  createdAt: Date;
}