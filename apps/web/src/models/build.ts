// RIGVERSE — Build Data Models

import type {
  ComponentCategory,
  AccessoryCategory,
  BuildStage,
  BuildVisibility,
} from '@shared/types';

export interface BuildComponent {
  productId: string;
  category: ComponentCategory;
  position?: [number, number, number];
  rotation?: [number, number, number];
  mountPointId?: string;
  locked: boolean;
  hidden: boolean;
}

export interface Accessory {
  productId: string;
  category: AccessoryCategory;
  position: [number, number, number];
  rotation: [number, number, number];
  zoneId?: string;
}

export interface DecorItem {
  type: 'poster' | 'plant' | 'rgb-strip' | 'led-panel';
  position: [number, number, number];
  rotation: [number, number, number];
  assetUrl: string;
  color?: string;
}

export interface SceneState {
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  ambientIntensity: number;
  decorItems: DecorItem[];
  roomTheme: 'dark' | 'neon' | 'rgb';
}

export interface BuildTotals {
  componentPrice: number;
  accessoryPrice: number;
  subtotal: number;
  shipping: number;
  total: number;
  savingsVsMrp: number;
  breakdown: Record<string, number>;
}

export interface CompatibilityReport {
  buildId: string;
  checkedAt: Date;
  results: CompatResult[];
  overall: 'PASS' | 'WARN' | 'FAIL';
  score: number;
}

export interface CompatResult {
  categoryA: string;
  categoryB: string;
  status: 'OK' | 'WARNING' | 'ERROR' | 'INFO';
  message: string;
  suggestion?: string;
  fixable: boolean;
}

export interface Build {
  id: string;
  userId?: string;
  title: string;
  stage: BuildStage;
  visibility: BuildVisibility;
  shareSlug?: string;
  components: Record<ComponentCategory, BuildComponent | null>;
  accessories: Accessory[];
  totals: BuildTotals;
  compatReport?: CompatibilityReport;
  sceneState: SceneState;
  createdAt: Date;
  updatedAt: Date;
}