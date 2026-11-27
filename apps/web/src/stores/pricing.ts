// RIGVERSE — Pricing Store (Zustand)
// Manages price snapshots, best-price lookups, live refresh triggers,
// and price alerts for the selected components.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PriceSnapshot, PriceAlert } from '@/models/price';

interface PricingStoreState {
  snapshots: Record<string, PriceSnapshot>;
  alerts: PriceAlert[];
  autoRefreshEnabled: boolean;
  refreshIntervalMs: number;
  lastRefreshAt: number | null;
  isRefreshing: boolean;

  // Actions
  setSnapshot(snapshot: PriceSnapshot): void;
  getSnapshot(productId: string): PriceSnapshot | null;
  clearSnapshot(productId: string): void;
  checkAlert(productId: string, targetPrice: number): void;
  dismissAlert(alertId: string): void;
  setAutoRefresh(enabled: boolean): void;
  triggerRefresh(): Promise<void>;
}

type PersistedPricing = Pick<PricingStoreState, 'snapshots' | 'alerts' | 'autoRefreshEnabled'>;

export const usePricingStore = create<PricingStoreState>()(
  persist(
    (set, get) => ({
      snapshots: {},
      alerts: [],
      autoRefreshEnabled: true,
      refreshIntervalMs: 2 * 60 * 1000, // 2 minutes
      lastRefreshAt: null,
      isRefreshing: false,

      setSnapshot(snapshot) {
        set((state) => ({
          snapshots: { ...state.snapshots, [snapshot.productId]: snapshot },
          // Mark any matching alerts as triggered when the price hits the target
          alerts: state.alerts.map((a) =>
            a.productId === snapshot.productId && !a.triggered && snapshot.bestPrice <= a.targetPrice
              ? { ...a, triggered: true }
              : a,
          ),
        }));
      },

      getSnapshot(productId) {
        const snapshot = get().snapshots[productId];
        if (!snapshot) return null;
        // Return a shallow copy so consumers can't mutate without going through set
        return { ...snapshot, sellers: [...snapshot.sellers], priceHistory: [...snapshot.priceHistory] };
      },

      clearSnapshot(productId) {
        set((state) => {
          const { [productId]: _removed, ...rest } = state.snapshots;
          return { snapshots: rest };
        });
      },

      // Creates a price alert for a product (named for the alert it checks later).
      checkAlert(productId, targetPrice) {
        const alert: PriceAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          userId: 'guest',
          productId,
          targetPrice,
          triggered: false,
          createdAt: new Date(),
        };
        set((state) => ({ alerts: [...state.alerts, alert] }));
      },

      dismissAlert(alertId) {
        set((state) => ({ alerts: state.alerts.filter((a) => a.id !== alertId) }));
      },

      setAutoRefresh(enabled) {
        set({ autoRefreshEnabled: enabled });
      },

      triggerRefresh: async () => {
        if (get().isRefreshing) return;
        set({ isRefreshing: true });
        try {
          // In production: call API /api/v1/prices/{productId}/refresh
          // For now: simulated refresh — mark all snapshots fresh
          const refreshed: Record<string, PriceSnapshot> = {};
          for (const [key, snap] of Object.entries(get().snapshots)) {
            refreshed[key] = { ...snap, lastUpdated: new Date() };
          }
          set({ snapshots: refreshed, lastRefreshAt: Date.now(), isRefreshing: false });
        } catch {
          set({ isRefreshing: false });
        }
      },
    }),
    {
      name: 'rigverse-pricing',
      storage: createJSONStorage(() => localStorage),
      // Hydrated manually after mount (see StoreHydrator) to avoid SSR hydration mismatches
      skipHydration: true,
      partialize: (state): PersistedPricing => ({
        snapshots: state.snapshots,
        alerts: state.alerts,
        autoRefreshEnabled: state.autoRefreshEnabled,
      }),
      // JSON turns Dates into strings; turn them back into Dates on load.
      merge: (persisted, current) => {
        const p = persisted as Partial<PersistedPricing> | undefined;
        if (!p) return current;
        const snapshots: Record<string, PriceSnapshot> = {};
        for (const [key, snap] of Object.entries(p.snapshots ?? {})) {
          snapshots[key] = { ...snap, lastUpdated: new Date(snap.lastUpdated) };
        }
        return {
          ...current,
          snapshots,
          alerts: (p.alerts ?? []).map((a) => ({ ...a, createdAt: new Date(a.createdAt) })),
          autoRefreshEnabled: p.autoRefreshEnabled ?? current.autoRefreshEnabled,
        };
      },
    },
  ),
);

export type PricingStore = ReturnType<typeof usePricingStore>;
