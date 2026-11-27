// RIGVERSE — Store Hydrator
// The persisted stores use skipHydration so the server render and the first
// client render match. This component loads localStorage state after mount,
// seeds demo prices, and keeps the UI store's breakpoint flags up to date.

'use client';

import { useEffect } from 'react';
import { useBuildStore, usePricingStore, useSceneStore, useSessionStore, useUIStore } from '@/hooks/stores';
import { seedDemoSnapshots } from '@/lib/pricing/store';

export function StoreHydrator() {
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      useBuildStore.persist.rehydrate(),
      usePricingStore.persist.rehydrate(),
      useSceneStore.persist.rehydrate(),
      useUIStore.persist.rehydrate(),
      useSessionStore.persist.rehydrate(),
    ]).finally(() => {
      if (cancelled) return;
      seedDemoSnapshots();
      useSessionStore.getState().setGuestSession();
      useBuildStore.getState().recalcTotals();
      useBuildStore.getState().runCompatibilityCheck();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      useUIStore.getState().setDeviceBreakpoints(isMobile, isTablet, !isMobile && !isTablet);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return null;
}
