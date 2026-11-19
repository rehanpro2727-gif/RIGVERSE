// RIGVERSE — Pricing Store (Zustand)
// Manages price snapshots, best-price lookups, live refresh triggers,
// and price alerts for the selected components.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PriceSnapshot, PriceAlert } from '@/models/price';
import { useBuildStore } from '@/stores/build';
import { DEFAULT_PAGE_SIZE } from '@shared/types/constants';

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
        set({
          ...get(),
          snapshots: {
            ...get().snapshots,
            [snapshot.productId]: snapshot,
          },
        });

        // Auto-check price alerts after setting a new snapshot
        const alerts = get().alerts.filter((a) => a.productId === snapshot.productId && !a.triggered);
        for (const alert of alerts) {
          if (snapshot.bestPrice <= alert.targetPrice) {
            set({
              ...get(),
              alerts: get().alerts.map((a) =>
                a.id === alert.id ? { ...a, triggered: true } : a
              ),
            });
          }
        }
      },

      getSnapshot(productId) {
        const snapshot = get().snapshots[productId];
        if (!snapshot) return null;
        // Return a shallow copy so consumers can't mutate without going through set
        return { ...snapshot, sellers: [...snapshot.sellers], priceHistory: [...snapshot.priceHistory] };
      },

      clearSnapshot(productId) {
        const { snapshots } = get();
        const { [productId]: _removed, ...rest } = snapshots;
        set({ ...get(), snapshots: rest });
      },

      checkAlert(productId, targetPrice) {
        const alert: PriceAlert = {
          id: `alert_${Date.now()}`,
          userId: 'guest',
          productId,
          targetPrice,
          triggered: false,
          createdAt: new Date(),
        };
        set({
          ...get(),
          alerts: [...get().alerts, alert],
        });
      },

      dismissAlert(alertId) {
        set({
          ...get(),
          alerts: get().alerts.filter((a) => a.id !== alertId),
        });
      },

      setAutoRefresh(enabled) {
        set({ ...get(), autoRefreshEnabled: enabled });
      },

      triggerRefresh: async () => {
        if (get().isRefreshing) return;
        set({ ...get(), isRefreshing: true });
        try {
          // In production: call API /api/v1/prices/{productId}/refresh
          // For now: simulated refresh — mark all snapshots fresh
          const snapshots = get().snapshots;
          const refreshed: Record<string, PriceSnapshot> = {};
          for (const key of Object.keys(snapshots)) {
            // Update lastUpdated to now (simulated fresh data)
            // In real impl: pull from retailer scrapers
            refreshed[key] = { ...snapshots[key], lastUpdated: new Date() };
          }
          set({
            ...get(),
            snapshots: refreshed,
            lastRefreshAt: Date.now(),
            isRefreshing: false,
          });
        } catch (e) {
          set({ ...get(), isRefreshing: false });
        }
      },
    }),
    {
      name: 'rigverse-pricing',
      getStorage: () => localStorage,
      partialize: (state) => ({
        snapshots: state.snapshots,
        alerts: state.alerts,
        autoRefreshEnabled: state.autoRefreshEnabled,
      }),
    }
  )
);

export type PricingStore = ReturnType<typeof usePricingStore>;

export { DEFAULT_PAGE_SIZE };
