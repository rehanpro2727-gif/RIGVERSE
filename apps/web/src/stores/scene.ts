// RIGVERSE — Scene Store (Zustand)
// Manages the 3D scene state: camera rig, lighting, environment, decor,
// postFX settings, render quality and room theme.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { RoomTheme } from '@shared/types';
import type { SceneDescriptor, CameraPreset, LightingRig, PostFXSettings } from '@/models/scene';
import { DEFAULT_DPR_CAP, MOBILE_MAX_DPR, MAX_TRIANGLE_BUDGET } from '@shared/types/constants';

export const MIN_TRIANGLE_BUDGET = 10_000;

interface SceneState {
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  ambientIntensity: number;
  decorItems: Array<{ type: string; position: [number, number, number]; rotation: [number, number, number]; assetUrl: string; color?: string }>;
  roomTheme: RoomTheme;
}

interface SceneStoreState {
  scene: SceneDescriptor | null;
  currentSceneId: 'forge' | 'studio' | 'showcase';
  sceneState: SceneState;
  lightingRig: LightingRig | null;
  postFx: PostFXSettings;
<<<<<<< HEAD
  dprCap: number;
=======
  /** Device pixel ratio cap for the renderer */
  dprCap: number;
  /** Maximum triangles the scene may render */
>>>>>>> 5a30304695ef9f65487c4ccac024ba3591bd265a
  triangleBudget: number;
  isInitialized: boolean;
  activeCameraPreset: CameraPreset | null;

  // Actions
  setCurrentScene(sceneId: 'forge' | 'studio' | 'showcase'): void;
  updateSceneState(patch: Partial<SceneState>): void;
  updateLightingRig(patch: Partial<LightingRig>): void;
  setPostFx(patch: Partial<PostFXSettings>): void;
  setRoomTheme(theme: RoomTheme): void;
  setCameraPreset(preset: CameraPreset): void;
  addDecorItem(item: SceneState['decorItems'][number]): void;
  removeDecorItem(index: number): void;
  setEnvironment(type: 'hdr' | 'gradient' | 'solid'): void;
  setDprCap(dpr: number): void;
  setTriangleBudget(budget: number): void;
}

const forgeScene: SceneDescriptor = {
  id: 'forge',
  camera: { position: [0, 0.9, 2.4], target: [0, 0.45, 0], fov: 50 },
  lighting: {
    key: { intensity: 2.2, color: '#00E5FF', position: [2.5, 3, 2.5] },
    fill: { intensity: 0.8, color: '#7C3AED', position: [-2.5, 2, 1.5] },
    rim: { intensity: 1.5, color: '#FF3B8A', position: [0, 2.5, -2.5] },
    ambient: { intensity: 0.35, color: '#1A1A2E' },
  },
  environment: { type: 'gradient', color: '#0B0B14' },
  postFx: { bloom: true, bloomIntensity: 0.6, chromaticAberration: false, filmGrain: false, vignette: true },
};

const studioScene: SceneDescriptor = {
  id: 'studio',
  camera: { position: [0, 0.8, 2.2], target: [0, 0.4, 0], fov: 50 },
  lighting: {
    key: { intensity: 2.5, color: '#7C3AED', position: [2.5, 3, 2.5] },
    fill: { intensity: 0.9, color: '#00E5FF', position: [-2.5, 2, 1.5] },
    rim: { intensity: 1.8, color: '#FF3B8A', position: [0, 2.5, -2.5] },
    ambient: { intensity: 0.4, color: '#1A1A2E' },
  },
  environment: { type: 'gradient', color: '#0B0B14' },
  postFx: { bloom: true, bloomIntensity: 0.7, chromaticAberration: true, filmGrain: false, vignette: true },
};

const showcaseScene: SceneDescriptor = {
  id: 'showcase',
  camera: { position: [0, 1.6, 3.4], target: [0, 0.7, 0], fov: 45 },
  lighting: {
    key: { intensity: 3.0, color: '#00E5FF', position: [2.5, 3, 2.5] },
    fill: { intensity: 1.0, color: '#7C3AED', position: [-2.5, 2, 1.5] },
    rim: { intensity: 2.2, color: '#FF3B8A', position: [0, 2.5, -2.5] },
    ambient: { intensity: 0.5, color: '#1A1A2E' },
  },
  environment: { type: 'gradient', color: '#0B0B14' },
  postFx: { bloom: true, bloomIntensity: 0.8, chromaticAberration: true, filmGrain: true, vignette: true },
};

export const SCENES: Record<'forge' | 'studio' | 'showcase', SceneDescriptor> = {
  forge: forgeScene,
  studio: studioScene,
  showcase: showcaseScene,
};

export const initialSceneState: SceneState = {
  cameraPosition: [0, 0.9, 2.4],
  cameraTarget: [0, 0.45, 0],
  ambientIntensity: 0.35,
  decorItems: [],
  roomTheme: RoomTheme.DARK,
};

export const initialPostFx: PostFXSettings = {
  bloom: true,
  bloomIntensity: 0.6,
  chromaticAberration: false,
  filmGrain: false,
  vignette: true,
};

export const initialLightingRig: LightingRig = {
  key: { intensity: 2.2, color: '#00E5FF', position: [2.5, 3, 2.5] },
  fill: { intensity: 0.8, color: '#7C3AED', position: [-2.5, 2, 1.5] },
  rim: { intensity: 1.5, color: '#FF3B8A', position: [0, 2.5, -2.5] },
  ambient: { intensity: 0.35, color: '#1A1A2E' },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type PersistedScene = Pick<
  SceneStoreState,
  'scene' | 'currentSceneId' | 'sceneState' | 'postFx' | 'dprCap' | 'triangleBudget'
>;

export const useSceneStore = create<SceneStoreState>()(
  persist(
    (set, get) => ({
      scene: forgeScene,
      currentSceneId: 'forge',
      sceneState: initialSceneState,
      lightingRig: initialLightingRig,
      postFx: initialPostFx,
      dprCap: DEFAULT_DPR_CAP,
      triangleBudget: MAX_TRIANGLE_BUDGET,
      isInitialized: false,
      activeCameraPreset: null,

      setCurrentScene(sceneId) {
        const scene = SCENES[sceneId];
        const [px, py, pz] = scene.camera.position;
        const [tx, ty, tz] = scene.camera.target;
        set((s) => ({
          currentSceneId: sceneId,
          scene,
          sceneState: { ...s.sceneState, cameraPosition: [px, py, pz], cameraTarget: [tx, ty, tz] },
        }));
      },

      updateSceneState(patch) {
        set((s) => ({ sceneState: { ...s.sceneState, ...patch } }));
      },

      updateLightingRig(patch) {
        set((s) => ({ lightingRig: { ...(s.lightingRig ?? initialLightingRig), ...patch } }));
      },

      setPostFx(patch) {
        set((s) => ({ postFx: { ...s.postFx, ...patch } }));
      },

      setRoomTheme(theme) {
        set((s) => ({ sceneState: { ...s.sceneState, roomTheme: theme } }));
      },

      setCameraPreset(preset) {
        set({ activeCameraPreset: preset });
      },

      addDecorItem(item) {
        set((s) => ({
          sceneState: { ...s.sceneState, decorItems: [...s.sceneState.decorItems, item] },
        }));
      },

      removeDecorItem(index) {
        set((s) => ({
          sceneState: {
            ...s.sceneState,
            decorItems: s.sceneState.decorItems.filter((_item, i) => i !== index),
          },
        }));
      },

      setEnvironment(type) {
        const scene = get().scene;
        if (!scene) return;
        // Keep any existing colour/url so switching types doesn't lose them.
        set({ scene: { ...scene, environment: { ...scene.environment, type } } });
      },

      setDprCap(dpr) {
<<<<<<< HEAD
        set({
          ...get(),
          dprCap: dpr,
        });
      },

      setTriangleBudget(budget) {
        set({
          ...get(),
          triangleBudget: budget,
        });
=======
        set({ dprCap: clamp(dpr, MOBILE_MAX_DPR, DEFAULT_DPR_CAP) });
      },

      setTriangleBudget(budget) {
        set({ triangleBudget: clamp(Math.round(budget), MIN_TRIANGLE_BUDGET, MAX_TRIANGLE_BUDGET) });
>>>>>>> 5a30304695ef9f65487c4ccac024ba3591bd265a
      },
    }),
    {
      name: 'rigverse-scene',
      storage: createJSONStorage(() => localStorage),
      // Hydrated manually after mount (see StoreHydrator) to avoid SSR hydration mismatches
      skipHydration: true,
      partialize: (state): PersistedScene => ({
        scene: state.scene,
        currentSceneId: state.currentSceneId,
        sceneState: state.sceneState,
        postFx: state.postFx,
        dprCap: state.dprCap,
        triangleBudget: state.triangleBudget,
<<<<<<< HEAD
        roomTheme: state.sceneState.roomTheme,
=======
>>>>>>> 5a30304695ef9f65487c4ccac024ba3591bd265a
      }),
    },
  ),
);

export type SceneStore = ReturnType<typeof useSceneStore>;
export { DEFAULT_DPR_CAP, MOBILE_MAX_DPR, MAX_TRIANGLE_BUDGET };
