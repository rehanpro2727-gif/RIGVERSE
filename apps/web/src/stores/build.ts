// RIGVERSE — Build State Store (Zustand)
// The single source of truth for the configurator state.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Build, BuildTotals, CompatibilityReport, BuildComponent, Accessory } from '@/models/build';
import { ComponentCategory, AccessoryCategory, BuildStage } from '@shared/types';
import { usePricingStore } from '@/stores/pricing';

interface BuildStoreState {
  // Core state
  buildId: string | null;
  stage: BuildStage;
  components: Record<ComponentCategory, BuildComponent | null>;
  accessories: Accessory[];
  totals: BuildTotals;
  compatReport: CompatibilityReport | null;
  isHydrating: boolean;
  isDirty: boolean;
  lastSavedAt: number | null;
  sceneState: {
    cameraPosition: [number, number, number];
    cameraTarget: [number, number, number];
    ambientIntensity: number;
    decorItems: unknown[];
    roomTheme: string;
  };
  createdAt: Date | null;
  updatedAt: Date | null;

  // Actions
  setStage(stage: BuildStage): void;
  selectComponent(category: ComponentCategory, component: BuildComponent): void;
  removeComponent(category: ComponentCategory): void;
  updateComponentPlacement(
    category: ComponentCategory,
    position: [number, number, number],
    rotation: [number, number, number],
    mountPointId?: string
  ): void;
  toggleComponentLock(category: ComponentCategory): void;
  toggleComponentHidden(category: ComponentCategory): void;
  addAccessory(accessory: Accessory): void;
  removeAccessory(index: number): void;
  updateAccessoryPlacement(
    index: number,
    position: [number, number, number],
    rotation: [number, number, number],
    zoneId?: string
  ): void;
  runCompatibilityCheck(): Promise<CompatibilityReport | null>;
  recalcTotals(): void;
  resetBuild(): void;
  hydrateBuild(id: string): Promise<void>;
  saveBuild(): Promise<string>; // returns shareSlug
}

const emptyComponents: Record<ComponentCategory, BuildComponent | null> = {
  [ComponentCategory.CPU]: null,
  [ComponentCategory.GPU]: null,
  [ComponentCategory.MOTHERBOARD]: null,
  [ComponentCategory.RAM]: null,
  [ComponentCategory.STORAGE]: null,
  [ComponentCategory.CASE]: null,
  [ComponentCategory.PSU]: null,
  [ComponentCategory.COOLING]: null,
};

const zeroTotals: BuildTotals = {
  componentPrice: 0,
  accessoryPrice: 0,
  subtotal: 0,
  shipping: 0,
  total: 0,
  savingsVsMrp: 0,
  breakdown: {},
};

export const useBuildStore = create<BuildStoreState>()(
  persist(
    (set, get) => ({
      buildId: null,
      stage: BuildStage.FORGE,
      components: { ...emptyComponents },
      accessories: [],
      totals: { ...zeroTotals },
      compatReport: null,
      isHydrating: true,
      isDirty: false,
      lastSavedAt: null,
      sceneState: {
        cameraPosition: [0, 0.9, 2.4],
        cameraTarget: [0, 0.45, 0],
        ambientIntensity: 0.35,
        decorItems: [],
        roomTheme: 'dark',
      },
      createdAt: null,
      updatedAt: null,

      setStage(stage) {
        set({ ...get(), stage });
      },

      selectComponent(category, component) {
        set({
          ...get(),
          components: {
            ...get().components,
            [category]: component,
          },
        });

        // Auto-run compatibility check
        get().runCompatibilityCheck();
      },

      removeComponent(category) {
        set({
          ...get(),
          components: {
            ...get().components,
            [category]: null,
          },
        });
      },

      updateComponentPlacement(category, position, rotation, mountPointId) {
        const current = get().components[category];
        if (!current) return;
        set({
          ...get(),
          components: {
            ...get().components,
            [category]: { ...current, position, rotation, mountPointId },
          },
        });
      },

      toggleComponentLock(category) {
        const current = get().components[category];
        if (!current) return;
        set({
          ...get(),
          components: {
            ...get().components,
            [category]: { ...current, locked: !current.locked },
          },
        });
      },

      toggleComponentHidden(category) {
        const current = get().components[category];
        if (!current) return;
        set({
          ...get(),
          components: {
            ...get().components,
            [category]: { ...current, hidden: !current.hidden },
          },
        });
      },

      addAccessory(accessory) {
        set({
          ...get(),
          accessories: [
            ...get().accessories,
            accessory,
          ],
        });
      },

      removeAccessory(index) {
        set({
          ...get(),
          accessories: get().accessories.filter((_a, i) => i !== index),
        });
      },

      updateAccessoryPlacement(index, position, rotation, zoneId) {
        const accessory = get().accessories[index];
        if (!accessory) return;
        set({
          ...get(),
          accessories: [
            ...get().accessories.slice(0, index),
            { ...accessory, position, rotation, zoneId },
            ...get().accessories.slice(index + 1),
          ],
        });
      },

      runCompatibilityCheck: async () => {
        const compat = await import('@/lib/engine/check');
        const results = compat.runCompatibilityCheck(get().components as Record<string, null>, {});
        if (results.length === 0) {
          const report: CompatibilityReport = {
            buildId: get().buildId ?? 'unsaved',
            checkedAt: new Date(),
            results: [],
            overall: 'PASS',
            score: 100,
          };
          set({ compatReport: report });
          return report;
        }
        const overall = compat.getOverallStatus(results);
        const score = compat.getCompatibilityScore(results);
        const report: CompatibilityReport = {
          buildId: get().buildId ?? 'unsaved',
          checkedAt: new Date(),
          results,
          overall,
          score,
        };
        set({ compatReport: report });
        return report;
      },

      recalcTotals() {
        const { components, accessories, totals } = get();
        const snapshots = usePricingStore.getState().snapshots;
        const componentPrice = Object.values(components).reduce((sum, comp) => {
          if (!comp || comp.hidden) return sum;
          const snap = snapshots[comp.productId];
          return sum + (snap?.bestPrice ?? 0);
        }, 0);
        const accessoryPrice = accessories.reduce((sum, a) => {
          const snap = snapshots[a.productId];
          return sum + (snap?.bestPrice ?? 0);
        }, 0);

        const shipping = typeof totals.shipping === 'number' ? totals.shipping : 0;

        set({
          ...get(),
          totals: {
            ...totals,
            componentPrice,
            accessoryPrice,
            subtotal: componentPrice + accessoryPrice,
            shipping,
            total: componentPrice + accessoryPrice + shipping,
            savingsVsMrp: typeof totals.savingsVsMrp === 'number' ? totals.savingsVsMrp : 0,
            breakdown: {
              ...totals.breakdown,
              component: componentPrice,
              accessory: accessoryPrice,
              shipping,
            },
          },
        });
      },

      resetBuild() {
        set({
          buildId: null,
          stage: BuildStage.FORGE,
          components: { ...emptyComponents },
          accessories: [],
          totals: { ...zeroTotals },
          compatReport: null,
          isHydrating: false,
          isDirty: false,
          lastSavedAt: null,
        });
      },

      hydrateBuild: async (id) => {
        set({ isHydrating: true });
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({
          buildId: 'demo-123',
          stage: BuildStage.FORGE,
          components: {
            [ComponentCategory.CPU]: { productId: 'cpu-123', category: ComponentCategory.CPU, position: [0, 0, 0], rotation: [0, 0, 0], mountPointId: 'mb-cpu', locked: false, hidden: false },
            [ComponentCategory.GPU]: { productId: 'gpu-456', category: ComponentCategory.GPU, position: [0, 0, 0], rotation: [0, 0, 0], mountPointId: 'mb-pcie-x16', locked: false, hidden: false },
            [ComponentCategory.MOTHERBOARD]: { productId: 'mb-789', category: ComponentCategory.MOTHERBOARD, position: [0, 0, 0], rotation: [0, 0, 0], mountPointId: 'mb-cpu', locked: false, hidden: false },
            [ComponentCategory.RAM]: { productId: 'ram-123', category: ComponentCategory.RAM, position: [0, 0, 0], rotation: [0, 0, 0], mountPointId: 'mb-ram-slot-0', locked: false, hidden: false },
            [ComponentCategory.STORAGE]: { productId: 'ssd-456', category: ComponentCategory.STORAGE, position: [0, 0, 0], rotation: [0, 0, 0], mountPointId: 'mb-m2-0', locked: false, hidden: false },
            [ComponentCategory.PSU]: { productId: 'psu-789', category: ComponentCategory.PSU, position: [0, 0, 0], rotation: [0, 0, 0], mountPointId: 'case-psu-shroud', locked: false, hidden: false },
            [ComponentCategory.CASE]: { productId: 'case-123', category: ComponentCategory.CASE, position: [0, 0, 0], rotation: [0, 0, 0], mountPointId: 'floor', locked: false, hidden: false },
            [ComponentCategory.COOLING]: { productId: 'cooler-123', category: ComponentCategory.COOLING, position: [0, 0, 0], rotation: [0, 0, 0], mountPointId: 'cpu', locked: false, hidden: false },
          },
          accessories: [
            { productId: 'monitor-456', category: AccessoryCategory.MONITOR, position: [0, 0, 0], rotation: [0, 0, 0], zoneId: 'desk' },
            { productId: 'keyboard-789', category: AccessoryCategory.KEYBOARD, position: [0, 0, 0], rotation: [0, 0, 0], zoneId: 'desk' },
          ],
          totals: { ...zeroTotals },
          compatReport: null,
          sceneState: {
            cameraPosition: [0, 0, 0],
            cameraTarget: [0, 0, 0],
            ambientIntensity: 1,
            decorItems: [],
            roomTheme: 'dark',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          isHydrating: false,
          isDirty: false,
          lastSavedAt: null,
        });
      },

      saveBuild: async () => {
        // In production, this would PATCH to API
        const shareSlug = 'rig-abc123';
        set({
          ...get(),
          isDirty: false,
          lastSavedAt: Date.now(),
        });
        return shareSlug;
      },
    }),
    {
      name: 'rigverse-build',
      getStorage: () => localStorage,
    })
);

export type BuildStore = ReturnType<typeof useBuildStore>;
