// RIGVERSE — Build totals
// Single source of truth for price maths. Used by both the build store
// (recalcTotals) and the useBuildTotals hook so they can never disagree.

import type { Accessory, BuildComponent, BuildTotals } from '@/models/build';
import type { PriceSnapshot } from '@/models/price';
import type { ComponentCategory } from '@shared/types';
import { CURRENCY, INR_LOCALE } from '@shared/types';

export function formatINR(value: number): string {
  return new Intl.NumberFormat(INR_LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
}

interface PriceLine {
  price: number; // item price at the best seller, excluding shipping
  shipping: number; // shipping charged by that seller
  mrp: number; // list price (falls back to price when unknown)
}

function priceLine(productId: string, snapshots: Record<string, PriceSnapshot>): PriceLine | null {
  const snap = snapshots[productId];
  if (!snap) return null;
  // snap.bestPrice is the landed cost (price + shipping) of the best seller,
  // so split it back out to avoid charging shipping twice.
  const best = snap.sellers.find((s) => s.sellerId === snap.bestSellerId);
  if (!best) return { price: snap.bestPrice, shipping: 0, mrp: snap.bestPrice };
  return { price: best.price, shipping: best.shipping, mrp: best.originalPrice ?? best.price };
}

export function computeTotals(
  components: Partial<Record<ComponentCategory, BuildComponent | null>>,
  accessories: Accessory[],
  snapshots: Record<string, PriceSnapshot>,
): BuildTotals {
  let componentPrice = 0;
  let accessoryPrice = 0;
  let shipping = 0;
  let savingsVsMrp = 0;
  const breakdown: Record<string, number> = {};

  for (const [category, comp] of Object.entries(components)) {
    if (!comp || comp.hidden) continue;
    const line = priceLine(comp.productId, snapshots);
    if (!line) continue;
    componentPrice += line.price;
    shipping += line.shipping;
    savingsVsMrp += Math.max(0, line.mrp - line.price);
    breakdown[category] = line.price;
  }

  for (const acc of accessories) {
    const line = priceLine(acc.productId, snapshots);
    if (!line) continue;
    accessoryPrice += line.price;
    shipping += line.shipping;
    savingsVsMrp += Math.max(0, line.mrp - line.price);
    breakdown[acc.category] = (breakdown[acc.category] ?? 0) + line.price;
  }

  const subtotal = componentPrice + accessoryPrice;
  return {
    componentPrice,
    accessoryPrice,
    subtotal,
    shipping,
    total: subtotal + shipping,
    savingsVsMrp,
    breakdown,
  };
}
