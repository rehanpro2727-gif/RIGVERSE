// RIGVERSE — shared constants

import { ComponentCategory, AccessoryCategory } from './enums';

// Canonical ordered list of component categories for the Forge stage.
export const COMPONENT_CATEGORIES: readonly ComponentCategory[] = [
  ComponentCategory.CPU,
  ComponentCategory.GPU,
  ComponentCategory.MOTHERBOARD,
  ComponentCategory.RAM,
  ComponentCategory.STORAGE,
  ComponentCategory.CASE,
  ComponentCategory.PSU,
  ComponentCategory.COOLING,
];

// Accessory categories for the Studio stage.
export const ACCESSORY_CATEGORIES: readonly AccessoryCategory[] = [
  AccessoryCategory.MONITOR,
  AccessoryCategory.KEYBOARD,
  AccessoryCategory.MOUSE,
  AccessoryCategory.SPEAKERS,
  AccessoryCategory.CHAIR,
  AccessoryCategory.DESK,
  AccessoryCategory.DECOR,
];

// Categories that are mandatory for a complete, working PC.
export const REQUIRED_CATEGORIES: readonly ComponentCategory[] = [
  ComponentCategory.CPU,
  ComponentCategory.GPU,
  ComponentCategory.MOTHERBOARD,
  ComponentCategory.RAM,
  ComponentCategory.STORAGE,
  ComponentCategory.CASE,
  ComponentCategory.PSU,
  ComponentCategory.COOLING,
];

// Categories that are NOT mandatory (optional accessories).
export const OPTIONAL_CATEGORIES: readonly AccessoryCategory[] = [
  AccessoryCategory.MOUSE,
  AccessoryCategory.SPEAKERS,
  AccessoryCategory.DECOR,
];

// Compatibility scoring
export const COMPATIBILITY_HEALTH_PASS = 100;
export const COMPATIBILITY_HEALTH_WARN = 70;
export const PSU_HEADROOM_FACTOR = 1.3; // 30% headroom on total system TDP

// Pricing
export const CURRENCY = 'INR' as const;
export const INR_LOCALE = 'en-IN';
export const STALE_PRICE_MS = 6 * 60 * 60 * 1000; // 6h
export const FRESH_PRICE_MS = 24 * 60 * 60 * 1000; // 24h

// Budget default (INR) — user can override
export const DEFAULT_BUDGET_INR = 150000;

// 3D
export const DEFAULT_DPR_CAP = 2;
export const MAX_TRIANGLE_BUDGET = 2_000_000;
export const MOBILE_MAX_DPR = 1.5;

// Storage keys
export const GUEST_BUILD_STORAGE_KEY = 'rigverse:guest-build';
export const GUEST_SESSION_STORAGE_KEY = 'rigverse:guest-session-id';

// Auth
export const ACCESS_TOKEN_COOKIE = 'rigverse:access-token';
export const REFRESH_TOKEN_COOKIE = 'rigverse:refresh-token';
export const GUEST_COOKIE = 'rigverse:guest-id';

// API
export const API_PREFIX = '/api/v1';
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

// Retailers (canonical list)
export const RETAILERS = [
  'MDComputers',
  'Vedant Computers',
  'PrimeABGB',
  'PCStudio',
  'EliteHubs',
  'The IT Depot',
  'Computech',
  'Amazon India',
  'Flipkart',
] as const;