// RIGVERSE — Pricing Pipeline
// Aggregator: combines multiple seller prices into a canonical PriceSnapshot
// Handles shipping, discounts, and total landed cost calculation.

import type { PriceRecord, SellerPrice, PriceSnapshot, PricePoint } from '@/models/price';
import { PriceFreshness } from '@shared/types';
import type { Seller } from '@/models/seller';

/**
 * Extract shipping cost for a seller.
 * In production this queries a shipping policy table.
 * For now, uses a simple default-based calculation.
 */
function getShippingForSeller(seller: Seller | null, price: number): number {
  if (!seller) return 0;
  const policy = seller.shipping;
  if (price >= policy.freeAbove) return 0;
  return policy.flatRate;
}

/**
 * Classify freshness based on how new the price data is.
 */
function classifyFreshness(scrapedAt: Date): PriceFreshness {
  const ageHours = (Date.now() - scrapedAt.getTime()) / (1000 * 60 * 60);
  if (ageHours < 6) return PriceFreshness.LIVE;
  if (ageHours < 24) return PriceFreshness.FRESH;
  if (ageHours < 168) return PriceFreshness.STALE; // 7 days
  return PriceFreshness.UNKNOWN;
}

/**
 * Aggregate price records into a single snapshot.
 *
 * Input:  Array of PriceRecord objects (same productId, different sellers)
 * Output: PriceSnapshot with best price, best seller, avg price, etc.
 */
export function aggregate(records: PriceRecord[], allSellers: Map<string, Seller>): PriceSnapshot {
  const inStock = records.filter((r) => r.inStock);
  const outOfStock = records.filter((r) => !r.inStock);

  const sellerPrices: SellerPrice[] = records.map((r) => {
    const seller = allSellers.get(r.sellerId) ?? null;
    const shipping = getShippingForSeller(seller, r.price);
    const total = r.price + shipping;
    return {
      sellerId: r.sellerId,
      sellerName: seller?.name ?? r.sellerId,
      price: r.price,
      inStock: r.inStock,
      originalPrice: r.originalPrice,
      discountPct: r.originalPrice ? Math.round(((r.originalPrice - r.price) / r.originalPrice) * 100) : undefined,
      shipping,
      total,
    };
  });

  const inStockPrices = sellerPrices.filter((s) => s.inStock);

  let bestPrice: number;
  let bestSellerId: string;
  let avgPrice: number;

  if (inStockPrices.length > 0) {
    const sorted = [...inStockPrices].sort((a, b) => a.total - b.total);
    bestPrice = sorted[0].total;
    bestSellerId = sorted[0].sellerId;
    avgPrice = Math.round(
      inStockPrices.reduce((sum, s) => sum + s.price, 0) / inStockPrices.length
    );
  } else {
    bestPrice = Math.min(...sellerPrices.map((s) => s.total));
    bestSellerId = sellerPrices.find((s) => s.total === bestPrice)?.sellerId ?? 'unknown';
    avgPrice = Math.round(
      sellerPrices.reduce((sum, s) => sum + s.price, 0) / sellerPrices.length
    );
  }

  const priceRange = {
    min: Math.min(...sellerPrices.map((s) => s.price)),
    max: Math.max(...sellerPrices.map((s) => s.price)),
  };

  const lastUpdated = records.length > 0 ? records[0].scrapedAt : new Date();

  return {
    productId: records[0].productId,
    bestPrice,
    bestSellerId,
    bestSellerName: sellerPrices.find((s) => s.sellerId === bestSellerId)?.sellerName ?? 'Unknown',
    sellers: sellerPrices,
    avgPrice,
    priceRange,
    freshness: classifyFreshness(lastUpdated),
    lastUpdated,
    priceHistory: records.map((r) => ({
      date: r.scrapedAt.toISOString().split('T')[0],
      price: r.price,
      sellerId: r.sellerId,
      total: r.price,
    })),
  };
}

/**
 * Filter snapshot by freshness threshold.
 * If data is too stale, return null or mark UI.
 */
export function isPriceFresh(snapshot: PriceSnapshot): boolean {
  switch (snapshot.freshness) {
    case PriceFreshness.LIVE:
    case PriceFreshness.FRESH:
      return true;
    case PriceFreshness.STALE:
      return false;
    case PriceFreshness.UNKNOWN:
      return false;
  }
}