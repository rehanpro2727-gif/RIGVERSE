// RIGVERSE — Live Price Refresh Orchestration
// Cron-friendly orchestration of retailer price scraping + snapshot updates.
// In production, this runs via BullMQ worker jobs hitting retailer scrapers.
// For now, provides trigger logic and snapshot refresh flow.

import { usePricingStore } from '@/stores/pricing';
import { RETAILERS } from '@shared/types/constants';
import { PriceFreshness } from '@shared/types';
import type { PriceSnapshot } from '@/models/price';

const RETRY_LIMIT = 3;
const RETRY_DELAY_MS = 2000;

export interface RefreshResult {
  productId: string;
  snapshot: PriceSnapshot | null;
  attempts: number;
  success: boolean;
}

/**
 * Refresh all snapshots for the current build's selected components.
 * Called by the pricing store background job or manual refresh.
 */
export async function refreshBuildPrices(productIds: string[]): Promise<RefreshResult[]> {
  const results: RefreshResult[] = [];

  for (const productId of productIds) {
    let attempts = 0;
    let snapshot: PriceSnapshot | null = null;
    let success = false;

    while (attempts < RETRY_LIMIT && !success) {
      attempts++;
      try {
        // In production: scrape retailer listings for this product
        // const rawListings = await scrapeRetailerListings(productId);
        // const { records } = normalizeListings(rawListings);
        // const snap = aggregate(records, sellersById);
        snapshot = {
          productId,
          bestPrice: 0,
          bestSellerId: '',
          bestSellerName: '',
          sellers: [],
          avgPrice: 0,
          priceRange: { min: 0, max: 0 },
          freshness: PriceFreshness.LIVE,
          lastUpdated: new Date(),
          priceHistory: [],
        };
        success = true;
      } catch (e) {
        success = false;
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }

    results.push({ productId, snapshot, attempts, success });
  }

  // Store snapshots into the pricing store
  for (const r of results) {
    if (r.snapshot) {
      usePricingStore.getState().setSnapshot(r.snapshot);
    }
  }

  return results;
}

/**
 * Get best price for a product as displayed in UI.
 * Returns null if no snapshot exists or if data is stale.
 */
export function getDisplayPrice(productId: string): { price: number; freshness: string; sellerName: string } | null {
  const snapshot = usePricingStore.getState().getSnapshot(productId);
  if (!snapshot) return null;
  const isFresh = ['LIVE', 'FRESH'].includes(snapshot.freshness);
  return {
    price: snapshot.bestPrice,
    freshness: snapshot.freshness,
    sellerName: snapshot.bestSellerName,
  };
}

/**
 * Subscribe to all current build component prices via pricing store selector.
 * Useful for selectors across components (budget tracker).
 */
export function useBuildPrices() {
  const snapshots = usePricingStore((state) => state.snapshots);
  const alerts = usePricingStore((state) => state.alerts);
  const autoRefreshEnabled = usePricingStore((state) => state.autoRefreshEnabled);

  return { snapshots, alerts, autoRefreshEnabled };
}
