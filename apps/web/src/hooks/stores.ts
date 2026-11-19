// RIGVERSE — Store hook re-exports & derived selectors
// Central place for UI to consume Zustand stores.

export { useBuildStore } from '@/stores/build';
export { usePricingStore } from '@/stores/pricing';
export { useSceneStore } from '@/stores/scene';
export { useUIStore } from '@/stores/ui';
export { useSessionStore } from '@/stores/session';

import { useBuildStore } from '@/stores/build';
import { usePricingStore } from '@/stores/pricing';
import { useMemo } from 'react';
import { ComponentCategory } from '@shared/types';

/**
 * Derived hook: compute live build totals from pricing snapshots.
 * BuildComponent carries productId only; price lives in pricing snapshots.
 */
export function useBuildTotals() {
  const components = useBuildStore((s) => s.components);
  const accessories = useBuildStore((s) => s.accessories);
  const snapshots = usePricingStore((s) => s.snapshots);

  return useMemo(() => {
    let componentPrice = 0;
    const breakdown: Record<string, number> = {};

    for (const category of Object.keys(components) as ComponentCategory[]) {
      const comp = components[category];
      if (!comp || comp.hidden) continue;
      const snap = snapshots[comp.productId];
      const price = snap?.bestPrice ?? 0;
      componentPrice += price;
      breakdown[category] = price;
    }

    let accessoryPrice = 0;
    for (const acc of accessories) {
      const snap = snapshots[acc.productId];
      const price = snap?.bestPrice ?? 0;
      accessoryPrice += price;
    }

    const subtotal = componentPrice + accessoryPrice;
    const shipping = subtotal > 0 && subtotal < 50000 ? 499 : 0;
    const total = subtotal + shipping;

    return {
      componentPrice,
      accessoryPrice,
      subtotal,
      shipping,
      total,
      breakdown,
      formattedPrice: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(total),
    };
  }, [components, accessories, snapshots]);
}

/**
 * Derived hook: count selected (non-hidden) components.
 */
export function useSelectedComponentCount() {
  const components = useBuildStore((s) => s.components);
  return Object.values(components).filter(
    (c): c is NonNullable<typeof c> => c !== null && !c.hidden,
  ).length;
}

/**
 * Derived hook: format INR price.
 */
export function useFormatINR(value: number) {
  return useMemo(
    () =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(value),
    [value]
  );
}