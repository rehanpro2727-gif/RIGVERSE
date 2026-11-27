// RIGVERSE — Demo product catalog
// Stand-in for the API's Product table until the backend is wired up.
// Prices and specs are placeholder demo data, not real listings.

import { AccessoryCategory, ComponentCategory, FormFactor, PriceFreshness, RAMGen, Socket } from '@shared/types';
import type { ComponentSpecs } from '@/models/product';
import type { PriceSnapshot, SellerPrice } from '@/models/price';

export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory | AccessoryCategory;
  /** Demo selling price in INR */
  price: number;
  /** Demo list price (MRP) in INR */
  mrp: number;
  /** Specs used by the compatibility engine (components only) */
  specs?: ComponentSpecs;
}

export const CATALOG: CatalogProduct[] = [
  {
    id: 'cpu-123',
    name: 'Ryzen 7 7800X3D',
    description: '8-Core Gaming CPU with 3D V-Cache',
    category: ComponentCategory.CPU,
    price: 38999,
    mrp: 44999,
    specs: {
      kind: 'CPU',
      socket: Socket.AM5,
      tdp: 120,
      coreCount: 8,
      threadCount: 16,
      baseClock: 4.2,
      boostClock: 5.0,
      igpu: true,
      generation: 'Zen 4',
      pciExpressGen: 5,
    },
  },
  {
    id: 'gpu-456',
    name: 'RTX 5080 Ti',
    description: 'Next-Gen 16GB Graphics Card',
    category: ComponentCategory.GPU,
    price: 89999,
    mrp: 99999,
    specs: {
      kind: 'GPU',
      length: 336,
      width: 140,
      thicknessSlots: 3,
      tdp: 360,
      powerConnectors: ['12VHPWR'],
      pcieInterface: 'PCIe 5.0',
      vram: 16,
      vramType: 'GDDR6X',
      memoryBus: 256,
      memoryBandwidth: 960,
      displayPorts: 3,
      hdmiPorts: 1,
      recommendedPsu: 850,
    },
  },
  {
    id: 'mb-789',
    name: 'X670E Gaming Motherboard',
    description: 'ATX PCIe 5.0 Motherboard',
    category: ComponentCategory.MOTHERBOARD,
    price: 28999,
    mrp: 32999,
    specs: {
      kind: 'MOTHERBOARD',
      socket: Socket.AM5,
      formFactor: FormFactor.ATX,
      chipset: 'X670E',
      ramSlots: 4,
      supportedRamGen: [RAMGen.DDR5],
      maxRamSpeed: 8000,
      maxRamCapacity: 192,
      m2Slots: [
        { key: 'M', length: 2280, gen: 5 },
        { key: 'M', length: 2280, gen: 4 },
      ],
      sataPorts: 6,
      pcieSlots: [{ gen: 5, lanes: 16, mechanical: 'x16' }],
      biosFlashback: true,
      wifi: true,
      rearUSB: { 'USB 3.2': 6 },
      audioCodec: 'ALC4080',
      vrms: 18,
    },
  },
  {
    id: 'ram-123',
    name: '32GB DDR5 Gaming RAM',
    description: '6000MHz CL36 Overclocked Kit',
    category: ComponentCategory.RAM,
    price: 11999,
    mrp: 13999,
    specs: {
      kind: 'RAM',
      gen: RAMGen.DDR5,
      capacityPerStick: 16,
      sticks: 2,
      speed: 6000,
      latency: 'CL36',
      voltage: 1.35,
      kitConfiguration: '2x',
      hasRGB: false,
      hasHeatsink: true,
      height: 44,
      xmpProfiles: 1,
    },
  },
  {
    id: 'ssd-456',
    name: '2TB NVMe Gen5 SSD',
    description: 'PCIe 5.0 Ultra Fast Storage',
    category: ComponentCategory.STORAGE,
    price: 17999,
    mrp: 21999,
    specs: {
      kind: 'STORAGE',
      type: 'NVMe',
      capacity: 2000,
      interface: 'NVMe',
      length: 2280,
      formFactor: 'M.2',
      readSpeed: 12000,
      writeSpeed: 11000,
      tbw: 1200,
      mtbf: 1500000,
      nandType: 'TLC',
      dramCache: true,
      heatsinkIncluded: true,
    },
  },
  {
    id: 'case-123',
    name: 'Mid-Tower Glass ATX Case',
    description: 'Tempered glass, 3 pre-installed fans',
    category: ComponentCategory.CASE,
    price: 8999,
    mrp: 10999,
    specs: {
      kind: 'CASE',
      formFactors: [FormFactor.ATX, FormFactor.MICRO_ATX, FormFactor.MINI_ITX],
      maxGpuLength: 400,
      maxCpuCoolerHeight: 170,
      maxPsuLength: 200,
      maxRamHeight: 60,
      radiatorSupport: [{ size: '360', position: 'top', maxThickness: 55 }],
      fanMounts: [{ size: 120, position: 'front', count: 3 }],
      dimensions: { width: 230, depth: 480, height: 500 },
      volume: 55,
      motherboardTray: 'rear',
      sidePanel: 'glass',
      frontPanelUSB: { 'USB 3.2': 2 },
      dustFilters: ['front', 'top'],
      weight: 9,
      gpuVerticalMount: false,
      includedFans: 3,
    },
  },
  {
    id: 'psu-789',
    name: '1000W ATX 3.0 PSU',
    description: 'Fully Modular 80 Plus Gold',
    category: ComponentCategory.PSU,
    price: 14999,
    mrp: 17999,
    specs: {
      kind: 'PSU',
      wattage: 1000,
      efficiency: '80+ Gold',
      modular: 'fully',
      connectors: [
        { type: '24pin', count: 1 },
        { type: '8pin-cpu', count: 2 },
        { type: '12vhpwr', count: 1 },
      ],
      length: 160,
      fanSize: 135,
      fanType: 'fluid-dynamic',
      zeroRpmMode: true,
      atxVersion: '3.0',
      pcie5Native: true,
      warrantyYears: 10,
      weight: 2,
    },
  },
  {
    id: 'cooler-123',
    name: 'Liquid 360mm AIO',
    description: '360mm All-in-One Liquid Cooler',
    category: ComponentCategory.COOLING,
    price: 9999,
    mrp: 12999,
    specs: {
      kind: 'COOLING',
      type: 'aio',
      tdpCapacity: 300,
      radiator: { size: '360', thickness: 27, fans: 3 },
      socketSupport: [Socket.AM5, Socket.AM4, Socket.LGA1700],
    },
  },

  // Accessories (Studio stage)
  { id: 'monitor-456', name: 'Monitor 27" QHD', description: 'High refresh rate, IPS panel', category: AccessoryCategory.MONITOR, price: 18999, mrp: 22999 },
  { id: 'keyboard-789', name: 'Mechanical Keyboard', description: 'RGB backlit, blue switches', category: AccessoryCategory.KEYBOARD, price: 9999, mrp: 11999 },
  { id: 'mouse-123', name: 'Gaming Mouse', description: 'Ergonomic, 16000 DPI', category: AccessoryCategory.MOUSE, price: 4999, mrp: 5999 },
  { id: 'speakers-456', name: 'Desktop Speakers', description: '2.1 channel, subwoofer', category: AccessoryCategory.SPEAKERS, price: 7999, mrp: 9499 },
  { id: 'chair-789', name: 'Gaming Chair', description: 'Racing style, lumbar support', category: AccessoryCategory.CHAIR, price: 14999, mrp: 18999 },
  { id: 'desk-123', name: 'Gaming Desk', description: 'L-shaped, cable management', category: AccessoryCategory.DESK, price: 12999, mrp: 15999 },
  { id: 'decor-456', name: 'RGB Poster', description: 'Neon cityscape artwork', category: AccessoryCategory.DECOR, price: 2999, mrp: 3499 },
];

const BY_ID = new Map(CATALOG.map((p) => [p.id, p]));

export function getProduct(productId: string): CatalogProduct | undefined {
  return BY_ID.get(productId);
}

export function getProductSpecs(productId: string): ComponentSpecs | undefined {
  return BY_ID.get(productId)?.specs;
}

export function getProductsByCategory(category: ComponentCategory | AccessoryCategory): CatalogProduct[] {
  return CATALOG.filter((p) => p.category === category);
}

export const ACCESSORY_PRODUCTS: CatalogProduct[] = CATALOG.filter((p) =>
  (Object.values(AccessoryCategory) as string[]).includes(p.category),
);

/** Build a demo price snapshot with two sellers for a catalog product. */
export function buildDemoSnapshot(product: CatalogProduct, now: Date = new Date()): PriceSnapshot {
  const shipping = product.price < 10000 ? 199 : 0;
  const make = (sellerId: string, sellerName: string, price: number): SellerPrice => ({
    sellerId,
    sellerName,
    price,
    inStock: true,
    originalPrice: product.mrp,
    discountPct: Math.round(((product.mrp - price) / product.mrp) * 100),
    shipping,
    total: price + shipping,
  });

  const sellers = [
    make('mdcomputers', 'MDComputers', product.price),
    make('vedant-computers', 'Vedant Computers', Math.round(product.price * 1.02)),
  ];
  const best = sellers[0];

  return {
    productId: product.id,
    bestPrice: best.total,
    bestSellerId: best.sellerId,
    bestSellerName: best.sellerName,
    sellers,
    avgPrice: Math.round(sellers.reduce((sum, s) => sum + s.price, 0) / sellers.length),
    priceRange: { min: sellers[0].price, max: sellers[1].price },
    freshness: PriceFreshness.LIVE,
    lastUpdated: now,
    priceHistory: [
      { date: now.toISOString().split('T')[0], price: best.price, sellerId: best.sellerId, total: best.total },
    ],
  };
}
