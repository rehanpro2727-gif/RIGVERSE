// RIGVERSE — shared type enums
// Canonical component / accessory categories used across web, API, and future mobile.

export enum ComponentCategory {
  CPU = 'CPU',
  GPU = 'GPU',
  MOTHERBOARD = 'MOTHERBOARD',
  RAM = 'RAM',
  STORAGE = 'STORAGE',
  CASE = 'CASE',
  PSU = 'PSU',
  COOLING = 'COOLING',
}

export enum AccessoryCategory {
  MONITOR = 'MONITOR',
  KEYBOARD = 'KEYBOARD',
  MOUSE = 'MOUSE',
  SPEAKERS = 'SPEAKERS',
  CHAIR = 'CHAIR',
  DESK = 'DESK',
  DECOR = 'DECOR',
}

export enum BuildStage {
  FORGE = 'FORGE',
  STUDIO = 'STUDIO',
  SHOWCASE = 'SHOWCASE',
}

export enum CompatibilityStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  INFO = 'INFO',
}

export enum CompatibilitySeverity {
  ERROR = 'error',
  WARNING = 'warning',
}

export enum PriceFreshness {
  LIVE = 'LIVE',
  FRESH = 'FRESH',
  STALE = 'STALE',
  UNKNOWN = 'UNKNOWN',
}

export enum FormFactor {
  ATX = 'ATX',
  MICRO_ATX = 'MICRO_ATX',
  MINI_ITX = 'MINI_ITX',
  E_ATX = 'E_ATX',
}

export enum RAMGen {
  DDR3 = 'DDR3',
  DDR4 = 'DDR4',
  DDR5 = 'DDR5',
}

export enum Socket {
  AM5 = 'AM5',
  AM4 = 'AM4',
  LGA1851 = 'LGA1851',
  LGA1700 = 'LGA1700',
  LGA1200 = 'LGA1200',
  TR5 = 'TR5',
  TR4 = 'TR4',
  sTRX5 = 'sTRX5',
}

export enum SellerType {
  DISTRIBUTOR = 'DISTRIBUTOR',
  RETAILER = 'RETAILER',
  MARKETPLACE = 'MARKETPLACE',
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum BuildVisibility {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public',
}

export enum RoomTheme {
  DARK = 'dark',
  NEON = 'neon',
  RGB = 'rgb',
}