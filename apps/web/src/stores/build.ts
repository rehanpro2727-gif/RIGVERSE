// RIGVERSE — Build State Store (Zustand)
// The single source of truth for the configurator state.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  Accessory,
  BuildComponent,
  BuildTotals,
  CompatibilityReport,
  SceneState,
} from '@/models/build';
import type { ComponentSpecs } from '@/models/product';
import { ComponentCategory, AccessoryCategory, BuildStage } from '@shared/types';
import { usePricingStore } from '@/stores/pricing';
import { computeTotals } from '@/lib/totals';
import { getProductSpecs } from '@/lib/catalog';
import { getCompatibilityScore, getOverallStatus, runCompatibilityCheck } from '@/lib/engine/check';

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
  sceneState: SceneState;
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
    mountPointId?: string,
  ): void;
  toggleComponentLock(category: ComponentCategory): void;
  toggleComponentHidden(category: ComponentCategory): void;
  addAccessory(accessory: Accessory): void;
  removeAccessory(index: number): void;
  updateAccessoryPlacement(
    index: number,
    position: [number, number, number],
    rotation: [number, number, number],
    zoneId?: string,
  ): void;
  runCompatibilityCheck(): CompatibilityReport;
  recalcTotals(): void;
  resetBuild(): void;
  hydrateBuild(id: string): Promise<void>;
  saveBuild(): Promise<string>; // returns shareSlug
}

const emptyComponents = (): Record<ComponentCategory, BuildComponent | null> => ({
  [ComponentCategory.CPU]: null,
  [ComponentCategory.GPU]: null,
  [ComponentCategory.MOTHERBOARD]: null,
  [ComponentCategory.RAM]: null,
  [ComponentCategory.STORAGE]: null,
  [ComponentCategory.CASE]: null,
  [ComponentCategory.PSU]: null,
  [ComponentCategory.COOLING]: null,
});

const zeroTotals = (): BuildTotals => ({
  componentPrice: 0,
  accessoryPrice: 0,
  subtotal: 0,
  shipping: 0,
  total: 0,
  savingsVsMrp: 0,
  breakdown: {},
});

const defaultSceneState = (): SceneState => ({
  cameraPosition: [0, 0.9, 2.4],
  cameraTarget: [0, 0.45, 0],
  ambientIntensity: 0.35,
  decorItems: [],
  roomTheme: 'dark',
});

const demoComponent = (
  productId: string,
  category: ComponentCategory,
  mountPointId: string,
): BuildComponent => ({
  productId,
  category,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  mountPointId,
  locked: false,
  hidden: false,
});

type PersistedBuild = Pick<BuildStoreState, 'buildId' | 'components' | 'accessories' | 'sceneState'>;

export const useBuildStore = create<BuildStoreState>()(
  persist(
    (set, get) => {
      // Totals and compatibility depend on the selection, so refresh both after any change.
      const refresh = () => {
        get().recalcTotals();
        get().runCompatibilityCheck();
      };

      return {
        buildId: null,
        stage: BuildStage.FORGE,
        components: emptyComponents(),
        accessories: [],
        totals: zeroTotals(),
        compatReport: null,
        isHydrating: false,
        isDirty: false,
        lastSavedAt: null,
        sceneState: defaultSceneState(),
        createdAt: null,
        updatedAt: null,

        setStage(stage) {
          set({ stage });
        },

        selectComponent(category, component) {
          set((s) => ({ components: { ...s.components, [category]: component }, isDirty: true }));
          refresh();
        },

        removeComponent(category) {
          set((s) => ({ components: { ...s.components, [category]: null }, isDirty: true }));
          refresh();
        },

        updateComponentPlacement(category, position, rotation, mountPointId) {
          const current = get().components[category];
          if (!current) return;
          set((s) => ({
            components: { ...s.components, [category]: { ...current, position, rotation, mountPointId } },
            isDirty: true,
          }));
        },

        toggleComponentLock(category) {
          const current = get().components[category];
          if (!current) return;
          set((s) => ({
            components: { ...s.components, [category]: { ...current, locked: !current.locked } },
            isDirty: true,
          }));
        },

        toggleComponentHidden(category) {
          const current = get().components[category];
          if (!current) return;
          set((s) => ({
            components: { ...s.components, [category]: { ...current, hidden: !current.hidden } },
            isDirty: true,
          }));
          refresh();
        },

        addAccessory(accessory) {
          set((s) => ({ accessories: [...s.accessories, accessory], isDirty: true }));
          get().recalcTotals();
        },

        removeAccessory(index) {
          set((s) => ({ accessories: s.accessories.filter((_a, i) => i !== index), isDirty: true }));
          get().recalcTotals();
        },

        updateAccessoryPlacement(index, position, rotation, zoneId) {
          const accessory = get().accessories[index];
          if (!accessory) return;
          set((s) => ({
            accessories: s.accessories.map((a, i) => (i === index ? { ...a, position, rotation, zoneId } : a)),
            isDirty: true,
          }));
        },

        runCompatibilityCheck() {
          // The engine works on specs, so resolve each selected product to its specs.
          const specs: Record<string, ComponentSpecs | null> = {};
          for (const [category, comp] of Object.entries(get().components)) {
            specs[category] = comp && !comp.hidden ? getProductSpecs(comp.productId) ?? null : null;
          }

          const results = runCompatibilityCheck(specs, {});
          const report: CompatibilityReport = {
            buildId: get().buildId ?? 'unsaved',
            checkedAt: new Date(),
            results,
            overall: getOverallStatus(results),
            score: getCompatibilityScore(results),
          };
          set({ compatReport: report });
          return report;
        },

        recalcTotals() {
          const { components, accessories } = get();
          const snapshots = usePricingStore.getState().snapshots;
          set({ totals: computeTotals(components, accessories, snapshots) });
        },

        resetBuild() {
          set({
            buildId: null,
            stage: BuildStage.FORGE,
            components: emptyComponents(),
            accessories: [],
            totals: zeroTotals(),
            compatReport: null,
            sceneState: defaultSceneState(),
            isHydrating: false,
            isDirty: false,
            lastSavedAt: null,
          });
        },

        hydrateBuild: async (id) => {
          set({ isHydrating: true });
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({
            buildId: id,
            stage: BuildStage.FORGE,
            components: {
              [ComponentCategory.CPU]: demoComponent('cpu-123', ComponentCategory.CPU, 'mb-cpu'),
              [ComponentCategory.GPU]: demoComponent('gpu-456', ComponentCategory.GPU, 'mb-pcie-x16'),
              [ComponentCategory.MOTHERBOARD]: demoComponent('mb-789', ComponentCategory.MOTHERBOARD, 'mb-cpu'),
              [ComponentCategory.RAM]: demoComponent('ram-123', ComponentCategory.RAM, 'mb-ram-slot-0'),
              [ComponentCategory.STORAGE]: demoComponent('ssd-456', ComponentCategory.STORAGE, 'mb-m2-0'),
              [ComponentCategory.PSU]: demoComponent('psu-789', ComponentCategory.PSU, 'case-psu-shroud'),
              [ComponentCategory.CASE]: demoComponent('case-123', ComponentCategory.CASE, 'floor'),
              [ComponentCategory.COOLING]: demoComponent('cooler-123', ComponentCategory.COOLING, 'cpu'),
            },
            accessories: [
              { productId: 'monitor-456', category: AccessoryCategory.MONITOR, position: [0, 0, 0], rotation: [0, 0, 0], zoneId: 'desk' },
              { productId: 'keyboard-789', category: AccessoryCategory.KEYBOARD, position: [0, 0, 0], rotation: [0, 0, 0], zoneId: 'desk' },
            ],
            sceneState: { ...defaultSceneState(), cameraPosition: [0, 0, 0], cameraTarget: [0, 0, 0], ambientIntensity: 1 },
            createdAt: new Date(),
            updatedAt: new Date(),
            isHydrating: false,
            isDirty: false,
            lastSavedAt: null,
          });
          refresh();
        },

        saveBuild: async () => {
          // In production, this would PATCH to API
          const shareSlug = 'rig-abc123';
          set({ isDirty: false, lastSavedAt: Date.now() });
          return shareSlug;
        },
      };
    },
    {
      name: 'rigverse-build',
      storage: createJSONStorage(() => localStorage),
      // Hydrated manually after mount (see StoreHydrator) to avoid SSR hydration mismatches
      skipHydration: true,
      partialize: (state): PersistedBuild => ({
        buildId: state.buildId,
        components: state.components,
        accessories: state.accessories,
        sceneState: state.sceneState,
      }),
    },
  ),
);

export type BuildStore = ReturnType<typeof useBuildStore>;
