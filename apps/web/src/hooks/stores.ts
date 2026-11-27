// RIGVERSE — Store hook re-exports & derived selectors
// Central place for UI to consume Zustand stores.

export { useBuildStore } from '@/stores/build';
export { usePricingStore } from '@/stores/pricing';
export { useSceneStore } from '@/stores/scene';
export { useUIStore } from '@/stores/ui';
export { useSessionStore } from '@/stores/session';

import { useMemo } from 'react';
import { useBuildStore } from '@/stores/build';
import { usePricingStore } from '@/stores/pricing';
import { computeTotals, formatINR } from '@/lib/totals';

/**
 * Derived hook: compute live build totals from pricing snapshots.
 * BuildComponent carries productId only; price lives in pricing snapshots.
 */
export function useBuildTotals() {
  const components = useBuildStore((s) => s.components);
  const accessories = useBuildStore((s) => s.accessories);
  const snapshots = usePricingStore((s) => s.snapshots);

  return useMemo(() => {
    const totals = computeTotals(components, accessories, snapshots);
    return { ...totals, formattedPrice: formatINR(totals.total) };
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
  return useMemo(() => formatINR(value), [value]);
}
