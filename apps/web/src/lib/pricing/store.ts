// RIGVERSE — Live Price Refresh Orchestration
// Cron-friendly orchestration of retailer price scraping + snapshot updates.
// In production, this runs via BullMQ worker jobs hitting retailer scrapers.
// For now, provides trigger logic and snapshot refresh flow.

import { usePricingStore } from '@/stores/pricing';
import { CATALOG, buildDemoSnapshot } from '@/lib/catalog';
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
 * Refresh snapshots for the given products (e.g. the current build's selection).
 * Called by the pricing store background job or manual refresh.
 *
 * Until real scrapers exist, a refresh re-stamps the existing snapshot
 * (or builds a demo one for catalog products) instead of overwriting prices with zeros.
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
        const existing = usePricingStore.getState().snapshots[productId];
        const product = CATALOG.find((p) => p.id === productId);
        if (existing) {
          snapshot = { ...existing, lastUpdated: new Date() };
        } else if (product) {
          snapshot = buildDemoSnapshot(product);
        } else {
          throw new Error(`No price source for product "${productId}"`);
        }
        success = true;
      } catch {
        success = false;
        if (attempts < RETRY_LIMIT) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
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
 * Make sure every catalog product has a price snapshot (demo data).
 * Existing snapshots, including persisted ones, are left untouched.
 */
export function seedDemoSnapshots(): void {
  const { snapshots, setSnapshot } = usePricingStore.getState();
  for (const product of CATALOG) {
    if (!snapshots[product.id]) {
      setSnapshot(buildDemoSnapshot(product));
    }
  }
}

/**
 * Get best price for a product as displayed in UI.
 * Returns null if no snapshot exists. The freshness label lets the UI flag stale data.
 */
export function getDisplayPrice(productId: string): { price: number; freshness: string; sellerName: string } | null {
  const snapshot = usePricingStore.getState().getSnapshot(productId);
  if (!snapshot) return null;
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
