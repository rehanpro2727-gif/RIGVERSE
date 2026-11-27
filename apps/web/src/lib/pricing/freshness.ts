// RIGVERSE — Pricing Pipeline
// Freshness classification and price staleness tracking.

import type { PriceSnapshot } from '@/models/price';
import { PriceFreshness, STALE_PRICE_MS, FRESH_PRICE_MS } from '@shared/types';

/**
 * Calculate freshness from a snapshot's lastUpdated time.
 */
export function calculateFreshness(lastUpdated: Date | string | number): PriceFreshness {
  // Persisted snapshots come back from JSON with string dates, so accept those too.
  const ageMs = Date.now() - new Date(lastUpdated).getTime();
  if (Number.isNaN(ageMs)) return PriceFreshness.UNKNOWN;
  if (ageMs < STALE_PRICE_MS) return PriceFreshness.LIVE;        // < 6h
  if (ageMs < FRESH_PRICE_MS) return PriceFreshness.FRESH;       // < 24h
  if (ageMs < 7 * 24 * 60 * 60 * 1000) return PriceFreshness.STALE; // < 7d
  return PriceFreshness.UNKNOWN;                                  // >= 7d
}

/**
 * Get human-readable freshness label + color class for UI.
 */
export function getFreshnessInfo(freshness: PriceFreshness): {
  label: string;
  color: string;
  bg: string;
  isStale: boolean;
} {
  switch (freshness) {
    case PriceFreshness.LIVE:
      return { label: 'LIVE', color: '#00E676', bg: 'rgba(0,230,118,0.12)', isStale: false };
    case PriceFreshness.FRESH:
      return { label: 'FRESH', color: '#00E5FF', bg: 'rgba(0,229,255,0.12)', isStale: false };
    case PriceFreshness.STALE:
      return { label: 'STALE', color: '#FFB800', bg: 'rgba(255,184,0,0.12)', isStale: true };
    case PriceFreshness.UNKNOWN:
      return { label: 'UNKNOWN', color: '#FF3B3B', bg: 'rgba(255,59,59,0.12)', isStale: true };
    default:
      return { label: 'UNKNOWN', color: '#FF3B3B', bg: 'rgba(255,59,59,0.12)', isStale: true };
  }
}

/**
 * Check if a price snapshot is considered fresh enough for production use.
 */
export function isPriceStale(snapshot: PriceSnapshot): boolean {
  const freshness = calculateFreshness(snapshot.lastUpdated);
  const info = getFreshnessInfo(freshness);
  return info.isStale;
}

/**
 * Estimate how stale a price is in seconds.
 */
export function getAgeInSeconds(lastUpdated: Date | string | number): number {
  return Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
}