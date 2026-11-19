// RIGVERSE — 3D Scene Data Models

import type { ComponentCategory } from '@shared/types';

export interface MountPoint {
  id: string;
  anchor: string;
  position: [number, number, number];
  rotation: [number, number, number];
  acceptedCategories: ComponentCategory[];
  constraints?: MountConstraints;
}

export interface MountConstraints {
  maxDimensions?: { w: number; d: number; h: number };
  maxWeight?: number;
  snapGrid?: number;
  allowRotate?: ('yaw' | 'pitch' | 'roll')[];
}

export interface AABB {
  min: [number, number, number];
  max: [number, number, number];
}

export interface GLBModel {
  id: string;
  url: string;
  mountPoints: MountPoint[];
  bounds: AABB;
  thumbnailUrl: string;
  version: number;
}

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface LightingRig {
  key: { intensity: number; color: string; position: [number, number, number] };
  fill: { intensity: number; color: string; position: [number, number, number] };
  rim: { intensity: number; color: string; position: [number, number, number] };
  ambient: { intensity: number; color: string };
}

export interface EnvironmentSetup {
  type: 'hdr' | 'gradient' | 'solid';
  url?: string;
  color?: string;
}

export interface PostFXSettings {
  bloom: boolean;
  bloomIntensity: number;
  chromaticAberration: boolean;
  filmGrain: boolean;
  vignette: boolean;
}

export interface SceneDescriptor {
  id: 'forge' | 'studio' | 'showcase';
  camera: CameraPreset;
  lighting: LightingRig;
  environment: EnvironmentSetup;
  postFx: PostFXSettings;
}