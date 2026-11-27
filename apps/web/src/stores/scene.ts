// RIGVERSE — Scene Store (Zustand)
// Manages the 3D scene state: camera rig, lighting, environment, decor,
// postFX settings, and room theme.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoomTheme } from '@shared/types';
import { BuildStage } from '@shared/types/enums';
import { SceneDescriptor, CameraPreset, LightingRig, PostFXSettings } from '@/models/scene';
import { DEFAULT_DPR_CAP, MOBILE_MAX_DPR, MAX_TRIANGLE_BUDGET, PSU_HEADROOM_FACTOR } from '@shared/types/constants';

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
  dprCap: number;
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

export const SCENES: Record<string, SceneDescriptor> = {
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
        set({
          ...get(),
          currentSceneId: sceneId,
          scene,
          sceneState: { ...get().sceneState, cameraPosition: [...scene.camera.position], cameraTarget: [...scene.camera.target] },
        });
      },

      updateSceneState(patch) {
        set({ ...get(), sceneState: { ...get().sceneState, ...patch } });
      },

      updateLightingRig(patch) {
        set({ ...get(), lightingRig: { ...get().lightingRig!, ...patch } });
      },

      setPostFx(patch) {
        set({ ...get(), postFx: { ...get().postFx, ...patch } });
      },

      setRoomTheme(theme) {
        set({
          ...get(),
          sceneState: { ...get().sceneState, roomTheme: theme },
        });
      },

      setCameraPreset(preset) {
        set({ ...get(), activeCameraPreset: preset });
      },

      addDecorItem(item) {
        set({
          ...get(),
          sceneState: {
            ...get().sceneState,
            decorItems: [...get().sceneState.decorItems, item],
          },
        });
      },

      removeDecorItem(index) {
        set({
          ...get(),
          sceneState: {
            ...get().sceneState,
            decorItems: get().sceneState.decorItems.filter((_item, i) => i !== index),
          },
        });
      },

      setEnvironment(type: 'hdr' | 'gradient' | 'solid') {
        set({
          ...get(),
          scene: get().scene ? { ...get().scene, environment: { type } } as SceneDescriptor | null : get().scene,
        });
      },

      setDprCap(dpr) {
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
      },
    }),
    {
      name: 'rigverse-scene',
      getStorage: () => localStorage,
      partialize: (state) => ({
        currentSceneId: state.currentSceneId,
        sceneState: state.sceneState,
        postFx: state.postFx,
        dprCap: state.dprCap,
        triangleBudget: state.triangleBudget,
        roomTheme: state.sceneState.roomTheme,
      }),
    }
  )
);

export type SceneStore = ReturnType<typeof useSceneStore>;
export { DEFAULT_DPR_CAP, MOBILE_MAX_DPR, MAX_TRIANGLE_BUDGET };
