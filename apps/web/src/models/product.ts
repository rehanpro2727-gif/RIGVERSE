// RIGVERSE — Core Product Data Models
// Discriminated union for all component specifications.

import type {
  ComponentCategory,
  AccessoryCategory,
  FormFactor,
  RAMGen,
  Socket,
} from '@shared/types';

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ComponentCategory | AccessoryCategory;
  subcategory: string;
  specs: ComponentSpecs;
  description: string;
  imageUrl: string;
  releaseDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Discriminated union — category determines which spec shape is valid.
export type ComponentSpecs =
  | CPUSpecs
  | GPUSpecs
  | MotherboardSpecs
  | RAMSpecs
  | StorageSpecs
  | CaseSpecs
  | PSUSpecs
  | CoolingSpecs
  | AccessorySpecs;

// ──────────────────────────────────────────────
// CPU
// ──────────────────────────────────────────────
export interface CPUSpecs {
  kind: 'CPU';
  socket: Socket;
  tdp: number;
  coreCount: number;
  threadCount: number;
  baseClock: number;
  boostClock?: number;
  igpu: boolean;
  generation: string;
  pciExpressGen: 4 | 5;
  dmiLanes?: number;
}

// ──────────────────────────────────────────────
// GPU
// ──────────────────────────────────────────────
export interface GPUSpecs {
  kind: 'GPU';
  length: number;
  width: number;
  thicknessSlots: number;
  tdp: number;
  powerConnectors: ('8-pin' | '6-pin' | '12VHPWR')[];
  pcieInterface: 'PCIe 3.0' | 'PCIe 4.0' | 'PCIe 5.0';
  vram: number;
  vramType: 'GDDR6' | 'GDDR6X' | 'HBM2' | 'HBM3';
  memoryBus: number;
  memoryBandwidth: number;
  displayPorts: number;
  hdmiPorts: number;
  recommendedPsu: number;
}

// ──────────────────────────────────────────────
// MOTHERBOARD
// ──────────────────────────────────────────────
export interface M2Slot {
  key: 'M' | 'B' | 'M+B';
  length: 2230 | 2242 | 2260 | 2280 | 22110;
  gen: 3 | 4 | 5;
  sharedWith?: string;
}

export interface PCIeSlot {
  gen: 3 | 4 | 5;
  lanes: 8 | 16;
  mechanical: 'x16' | 'x8' | 'x4' | 'x1';
}

export interface MotherboardSpecs {
  kind: 'MOTHERBOARD';
  socket: Socket;
  formFactor: FormFactor;
  chipset: string;
  ramSlots: number;
  supportedRamGen: RAMGen[];
  maxRamSpeed: number;
  maxRamCapacity: number;
  m2Slots: M2Slot[];
  sataPorts: number;
  pcieSlots: PCIeSlot[];
  biosFlashback: boolean;
  wifi: boolean;
  bluetooth?: string;
  rearUSB: Record<string, number>;
  audioCodec: string;
  vrms: number;
}

// ──────────────────────────────────────────────
// RAM
// ──────────────────────────────────────────────
export interface RAMSpecs {
  kind: 'RAM';
  gen: RAMGen;
  capacityPerStick: number;
  sticks: number;
  speed: number;
  latency: string;
  voltage: number;
  kitConfiguration: '1x' | '2x' | '4x';
  hasRGB: boolean;
  hasHeatsink: boolean;
  height: number;
  xmpProfiles: number;
  exeVersion?: string;
}

// ──────────────────────────────────────────────
// STORAGE
// ──────────────────────────────────────────────
export interface StorageSpecs {
  kind: 'STORAGE';
  type: 'NVMe' | 'SATA_SSD' | 'HDD';
  capacity: number;
  interface: 'NVMe' | 'SATA';
  length?: 2230 | 2242 | 2260 | 2280 | 22110;
  formFactor: 'M.2' | '2.5in' | '3.5in';
  readSpeed: number;
  writeSpeed: number;
  tbw: number;
  mtbf: number;
  controller?: string;
  nandType: 'TLC' | 'QLC' | 'MLC' | 'SLC';
  dramCache: boolean;
  heatsinkIncluded: boolean;
}

// ──────────────────────────────────────────────
// CASE
// ──────────────────────────────────────────────
export interface RadSupport {
  size: '120' | '140' | '240' | '280' | '360' | '420';
  position: 'front' | 'top' | 'rear' | 'bottom';
  maxThickness: number;
}

export interface FanMount {
  size: 120 | 140;
  position: 'front' | 'top' | 'rear' | 'bottom' | 'side';
  count: number;
}

export interface CaseSpecs {
  kind: 'CASE';
  formFactors: FormFactor[];
  maxGpuLength: number;
  maxCpuCoolerHeight: number;
  maxPsuLength: number;
  maxRamHeight: number;
  radiatorSupport: RadSupport[];
  fanMounts: FanMount[];
  dimensions: { width: number; depth: number; height: number };
  volume: number;
  motherboardTray: 'front' | 'rear';
  sidePanel: 'glass' | 'mesh' | 'solid';
  frontPanelUSB: Record<string, number>;
  dustFilters: string[];
  weight: number;
  gpuVerticalMount: boolean;
  includedFans: number;
}

// ──────────────────────────────────────────────
// PSU
// ──────────────────────────────────────────────
export interface PSUConnector {
  type: '24pin' | '8pin-cpu' | '8pin-pcie' | '12vhpwr' | '6pin-sata' | 'sata' | 'molex';
  count: number;
}

export interface PSUSpecs {
  kind: 'PSU';
  wattage: number;
  efficiency: '80+' | '80+ Bronze' | '80+ Silver' | '80+ Gold' | '80+ Platinum' | '80+ Titanium';
  modular: 'fully' | 'semi' | 'none';
  connectors: PSUConnector[];
  length: number;
  fanSize: number;
  fanType: 'fluid-dynamic' | 'rifle' | 'sleeve' | 'ball-bearing';
  zeroRpmMode: boolean;
  atxVersion: '2.53' | '3.0' | '3.1';
  pcie5Native: boolean;
  warrantyYears: number;
  weight: number;
}

// ──────────────────────────────────────────────
// COOLING
// ──────────────────────────────────────────────
export interface CoolingSpecs {
  kind: 'COOLING';
  type: 'air' | 'aio' | 'custom-loop' | 'passive';
  tdpCapacity: number;
  height?: number;
  radiator?: { size: string; thickness: number; fans: number };
  fanSize?: number;
  fanCount?: number;
  fanType?: 'pwm' | 'dc';
  maxFanSpeed?: number;
  noiseLevel?: number;
  socketSupport: Socket[];
  offsetMounting?: boolean;
  ramClearance?: number;
  weight?: number;
  pumpSpeed?: number;
  coolantCapacity?: number;
}

// ──────────────────────────────────────────────
// ACCESSORIES (Studio stage)
// ──────────────────────────────────────────────
export interface AccessorySpecs {
  kind: 'ACCESSORY';
  type: AccessoryCategory;
  [key: string]: unknown;
}

export interface MonitorSpecs extends Omit<AccessorySpecs, 'type'> {
  type: AccessoryCategory.MONITOR;
  size: number;
  resolution: '1080p' | '1440p' | '4K' | '3440x1440' | '5120x1440';
  refreshRate: number;
  panel: 'IPS' | 'VA' | 'TN' | 'OLED' | 'QD-OLED';
  hdr: 'HDR10' | 'HDR400' | 'HDR600' | 'HDR1000' | 'none';
  adaptiveSync: 'G-Sync' | 'FreeSync' | 'G-Sync Compatible' | 'none';
  responseTime: number;
  ports: ('HDMI' | 'DP' | 'USB-C' | 'DVI' | 'Thunderbolt')[];
  vesaMount: boolean;
  curvature?: number;
  aspectRatio: string;
  colorGamut: string;
  brightness: number;
}

export interface KeyboardSpecs extends Omit<AccessorySpecs, 'type'> {
  type: AccessoryCategory.KEYBOARD;
  switchType: 'mechanical' | 'membrane' | 'optical' | 'hall-effect';
  switchName?: string;
  layout: 'full' | 'tenkeyless' | '75%' | '65%' | '60%' | '40%';
  backlight: 'none' | 'single' | 'rgb' | 'per-key-rgb';
  connectivity: ('wired' | 'wireless' | 'bluetooth' | '2.4ghz')[];
  hotSwappable: boolean;
  pollingRate: number;
  batteryLife?: number;
  keycapMaterial: 'PBT' | 'ABS' | 'PC';
  keycapProfile: 'OEM' | 'Cherry' | 'SA' | 'DSA' | 'XDA';
}

export interface MouseSpecs extends Omit<AccessorySpecs, 'type'> {
  type: AccessoryCategory.MOUSE;
  sensor: string;
  dpi: number;
  pollingRate: number;
  weight: number;
  grip: 'palm' | 'claw' | 'fingertip';
  connectivity: ('wired' | 'wireless' | 'bluetooth' | '2.4ghz')[];
  buttons: number;
  batteryLife?: number;
  sensorType: 'optical' | 'laser';
  maxAcceleration: number;
  maxSpeed: number;
  ftypes: ('PTFE' | 'virgin' | 'ceramic')[];
}

export interface SpeakerSpecs extends Omit<AccessorySpecs, 'type'> {
  type: AccessoryCategory.SPEAKERS;
  configuration: '2.0' | '2.1' | '5.1' | '7.1';
  outputPower: number;
  frequencyResponse: string;
  connectivity: ('3.5mm' | 'USB' | 'bluetooth' | 'optical' | 'RCA')[];
  subwooferIncluded: boolean;
  dac: boolean;
  rgbLighting: boolean;
}

export interface ChairSpecs extends Omit<AccessorySpecs, 'type'> {
  type: AccessoryCategory.CHAIR;
  chairType: 'gaming' | 'ergonomic' | 'office' | 'mesh';
  gasLift: boolean;
  reclineAngle: number;
  armrests: 'fixed' | '1d' | '2d' | '3d' | '4d';
  material: 'mesh' | 'leather' | 'fabric' | 'alcantara' | 'pvc';
  lumbarSupport: boolean;
  headrest: boolean;
  maxWeight: number;
  tiltLock: boolean;
  warrantyYears: number;
}

export interface DeskSpecs extends Omit<AccessorySpecs, 'type'> {
  type: AccessoryCategory.DESK;
  material: 'wood' | 'glass' | 'metal' | 'carbon-fiber' | 'bamboo';
  dimensions: { width: number; depth: number; height: number };
  cableManagement: boolean;
  motorized: boolean;
  heightRange?: { min: number; max: number };
  maxWeight: number;
  drawers: number;
  monitorMountHoles: boolean;
  rgbLighting: boolean;
  shape: 'rectangular' | 'l-shape' | 'curved';
}


// ──────────────────────────────────────────────
// TYPE GUARDS
// ──────────────────────────────────────────────
export function isCPUSpecs(s: ComponentSpecs): s is CPUSpecs {
  return s.kind === 'CPU';
}
export function isGPUSpecs(s: ComponentSpecs): s is GPUSpecs {
  return s.kind === 'GPU';
}
export function isMotherboardSpecs(s: ComponentSpecs): s is MotherboardSpecs {
  return s.kind === 'MOTHERBOARD';
}
export function isRAMSpecs(s: ComponentSpecs): s is RAMSpecs {
  return s.kind === 'RAM';
}
export function isStorageSpecs(s: ComponentSpecs): s is StorageSpecs {
  return s.kind === 'STORAGE';
}
export function isCaseSpecs(s: ComponentSpecs): s is CaseSpecs {
  return s.kind === 'CASE';
}
export function isPSUSpecs(s: ComponentSpecs): s is PSUSpecs {
  return s.kind === 'PSU';
}
export function isCoolingSpecs(s: ComponentSpecs): s is CoolingSpecs {
  return s.kind === 'COOLING';
}
export function isAccessorySpecs(s: ComponentSpecs): s is AccessorySpecs {
  return s.kind === 'ACCESSORY';
}