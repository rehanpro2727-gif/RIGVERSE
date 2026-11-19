// RIGVERSE — Pricing Pipeline
// Normalize raw seller listings into canonical PriceRecord objects.
// Every price has a source, seller, stock status, and verified timestamp.

import type { PriceRecord } from '@/models/price';

export interface RawListing {
  sellerId: string;
  sellerName: string;
  productName: string;
  brand?: string;
  model?: string;
  mpn?: string;
  price: number;             // already in INR
  originalPrice?: number;    // MRP
  inStock: boolean;
  stockQty?: number;
  url: string;
  currency: 'INR';
  scrapedAt: Date;
}

export interface NormalizeResult {
  records: PriceRecord[];
  unmatched: Array<{ raw: RawListing; reason: string }>;
}

/**
 * Parse INR price string: "₹1,23,456" or "1,23,456.50" or "123456"
 */
export function parseINR(value: string | number): number {
  if (typeof value === 'number') return value;
  const cleaned = value.replace(/[^\d.,]/g, '').replace(/,/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Simple hash for deduplication — based on sellerId + price + inStock.
 */
function contentHash(sellerId: string, price: number, inStock: boolean): string {
  return `${sellerId}_${price}_${inStock}`;
}

/**
 * Normalize a single raw listing into a canonical PriceRecord.
 */
export function normalizeListing(raw: RawListing): PriceRecord {
  return {
    id: `${raw.sellerId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productId: resolveProductId(raw),
    sellerId: raw.sellerId,
    price: parseINR(raw.price),
    originalPrice: raw.originalPrice ? parseINR(raw.originalPrice) : undefined,
    inStock: raw.inStock,
    stockQty: raw.stockQty,
    scrapedAt: raw.scrapedAt,
    url: raw.url,
    currency: 'INR',
    contentHash: contentHash(raw.sellerId, parseINR(raw.price), raw.inStock),
  };
}

/**
 * Resolve a raw listing to a canonical product ID.
 * Priority: MPN > brand+model exact > brand+model fuzzy (with threshold).
 *
 * In production, this queries a product matching index.
 * For now, returns a normalized slug.
 */
function resolveProductId(raw: RawListing): string {
  // Try MPN first (most reliable)
  if (raw.mpn) {
    return slugify(`${raw.brand || ''}_${raw.mpn}`);
  }
  // Then brand + model
  if (raw.brand && raw.model) {
    return slugify(`${raw.brand}_${raw.model}`);
  }
  // Then product name
  return slugify(raw.productName);
}

/**
 * Slugify: lowercase, remove special chars, replace spaces with hyphens.
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalize a batch of listings.
 */
export function normalizeListings(listings: RawListing[]): NormalizeResult {
  const records: PriceRecord[] = [];
  const unmatched: Array<{ raw: RawListing; reason: string }> = [];

  for (const raw of listings) {
    try {
      const record = normalizeListing(raw);
      records.push(record);
    } catch (err) {
      unmatched.push({
        raw,
        reason: err instanceof Error ? err.message : 'Unknown normalization error',
      });
    }
  }

  return { records, unmatched };
}