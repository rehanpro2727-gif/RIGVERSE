// RIGVERSE — Compatibility Engine
// Pure TypeScript rule registry. No React, no Three.js, no external deps.

import type { CompatibilityRule, CompatStatus } from '@/models/compat';
import type { ComponentSpecs } from '@/models/product';
import { ComponentCategory } from '@shared/types';

import { isCPUSpecs } from '@/models/product';
import { isGPUSpecs } from '@/models/product';
import { isMotherboardSpecs } from '@/models/product';
import { isRAMSpecs } from '@/models/product';
import { isStorageSpecs } from '@/models/product';
import { isCaseSpecs } from '@/models/product';
import { isPSUSpecs } from '@/models/product';
import { isCoolingSpecs } from '@/models/product';
import { PSU_HEADROOM_FACTOR } from '@shared/types/constants';

// ──────────────────────────────────────────────
// Rule Registry
// ──────────────────────────────────────────────
export const rules: CompatibilityRule[] = [
  // CPU ↔ Motherboard socket
  {
    id: 'cpu-mb-socket',
    name: 'CPU socket matches motherboard',
    categories: [ComponentCategory.CPU, ComponentCategory.MOTHERBOARD],
    severity: 'error',
    check: (cpu, mb, ctx) => {
      if (!isCPUSpecs(cpu) || !isMotherboardSpecs(mb)) return 'OK';
      return cpu.socket === mb.socket ? 'OK' : 'ERROR';
    },
    message: (_r, ctx) => {
      const cpu = ctx.cpuSpecs as { socket?: string };
      const mb = ctx.mbSpecs as { socket?: string };
      return `CPU socket (${cpu.socket}) does not match motherboard socket (${mb.socket}).`;
    },
  },

  // Motherboard ↔ RAM generation
  {
    id: 'mb-ram-gen',
    name: 'RAM generation matches motherboard',
    categories: [ComponentCategory.MOTHERBOARD, ComponentCategory.RAM],
    severity: 'error',
    check: (mb, ram) => {
      if (!isMotherboardSpecs(mb) || !isRAMSpecs(ram)) return 'OK';
      return mb.supportedRamGen.includes(ram.gen) ? 'OK' : 'ERROR';
    },
    message: (_r, ctx) => {
      const mb = ctx.mbSpecs as { supportedRamGen?: string[] };
      const ram = ctx.ramSpecs as { gen?: string };
      return `Motherboard supports ${mb.supportedRamGen?.join(', ')} but RAM is ${ram.gen}.`;
    },
  },

  // Motherboard ↔ RAM capacity
  {
    id: 'mb-ram-capacity',
    name: 'RAM capacity within motherboard limit',
    categories: [ComponentCategory.MOTHERBOARD, ComponentCategory.RAM],
    severity: 'error',
    check: (mb, ram) => {
      if (!isMotherboardSpecs(mb) || !isRAMSpecs(ram)) return 'OK';
      return ram.capacityPerStick * ram.sticks <= mb.maxRamCapacity ? 'OK' : 'ERROR';
    },
    message: (_r, ctx) => {
      const mb = ctx.mbSpecs as { maxRamCapacity?: number };
      const ram = ctx.ramSpecs as { capacityPerStick?: number; sticks?: number };
      const total = (ram.capacityPerStick ?? 0) * (ram.sticks ?? 0);
      return `RAM total (${total} GB) exceeds motherboard max capacity (${mb.maxRamCapacity} GB).`;
    },
  },

  // GPU ↔ Case clearance
  {
    id: 'gpu-case-clearance',
    name: 'GPU fits in case',
    categories: [ComponentCategory.GPU, ComponentCategory.CASE],
    severity: 'error',
    check: (gpu, cs) => {
      if (!isGPUSpecs(gpu) || !isCaseSpecs(cs)) return 'OK';
      return gpu.length <= cs.maxGpuLength ? 'OK' : 'ERROR';
    },
    message: (_r, ctx) => {
      const gpu = ctx.gpuSpecs as { length?: number };
      const cs = ctx.caseSpecs as { maxGpuLength?: number };
      return `GPU length (${gpu.length} mm) exceeds case max GPU clearance (${cs.maxGpuLength} mm).`;
    },
  },

  // PSU wattage vs total system TDP
  {
    id: 'psu-wattage',
    name: 'PSU wattage sufficient with headroom',
    categories: [ComponentCategory.PSU, ComponentCategory.CPU],
    severity: 'error',
    check: (psu, cpu, ctx) => {
      if (!isPSUSpecs(psu)) return 'OK';
      // total TDP = cpu + gpu + ~50W for mobo/ram/storage/etc
      const gpuTdp = (ctx.gpuTdp as number) ?? 0;
      const totalTdp = ((cpu as { tdp?: number }).tdp ?? 0) + gpuTdp + 50;
      const required = Math.ceil(totalTdp * PSU_HEADROOM_FACTOR);
      return psu.wattage >= required ? 'OK' : 'ERROR';
    },
    message: (_r, ctx) => {
      const psu = ctx.psuSpecs as { wattage?: number };
      const totalTdp = ctx.totalTdp as number;
      const required = Math.ceil(totalTdp * PSU_HEADROOM_FACTOR);
      return `PSU (${psu.wattage}W) is below recommended ${required}W (total system TDP ~${totalTdp}W + 30% headroom).`;
    },
  },

  // CPU cooler ↔ Case clearance
  {
    id: 'cooler-case-clearance',
    name: 'CPU cooler fits in case',
    categories: [ComponentCategory.COOLING, ComponentCategory.CASE],
    severity: 'warning',
    check: (cooling, cs) => {
      if (!isCoolingSpecs(cooling) || !isCaseSpecs(cs)) return 'OK';
      if (cooling.type === 'aio' || cooling.type === 'custom-loop') return 'OK';
      if (!cooling.height) return 'OK';
      return cooling.height <= cs.maxCpuCoolerHeight ? 'OK' : 'WARNING';
    },
    message: (_r, ctx) => {
      const cooling = ctx.coolingSpecs as { height?: number; type?: string };
      const cs = ctx.caseSpecs as { maxCpuCoolerHeight?: number };
      return `Cooler height (${cooling.height} mm) may exceed case max cooler height (${cs.maxCpuCoolerHeight} mm).`;
    },
  },

  // CPU cooler ↔ Socket
  {
    id: 'cooler-socket',
    name: 'Cooler supports CPU socket',
    categories: [ComponentCategory.COOLING, ComponentCategory.CPU],
    severity: 'error',
    check: (cooling, cpu) => {
      if (!isCoolingSpecs(cooling) || !isCPUSpecs(cpu)) return 'OK';
      if (!cooling.socketSupport || cooling.socketSupport.length === 0) return 'OK';
      return cooling.socketSupport.includes(cpu.socket) ? 'OK' : 'ERROR';
    },
    message: (_r, ctx) => {
      const cooling = ctx.coolingSpecs as { socketSupport?: string[] };
      const cpu = ctx.cpuSpecs as { socket?: string };
      return `Cooler supports ${cooling.socketSupport?.join(', ')} but CPU uses ${cpu.socket} socket.`;
    },
  },

  // Storage ↔ Motherboard M.2
  {
    id: 'storage-m2-length',
    name: 'Storage M.2 length matches motherboard slot',
    categories: [ComponentCategory.STORAGE, ComponentCategory.MOTHERBOARD],
    severity: 'error',
    check: (storage, mb) => {
      if (!isStorageSpecs(storage) || !isMotherboardSpecs(mb)) return 'OK';
      if (storage.formFactor !== 'M.2') return 'OK'; // 2.5"/3.5" HDD always fits
      if (!storage.length) return 'OK';
      return mb.m2Slots.some((s: { length: number }) => s.length === storage.length)
        ? 'OK'
        : 'ERROR';
    },
    message: (_r, ctx) => {
      const storage = ctx.storageSpecs as { length?: string; formFactor?: string };
      const mb = ctx.mbSpecs as { m2Slots?: Array<{ length: number }> };
      const slotLengths = mb.m2Slots?.map((s) => s.length) ?? [];
      return `M.2 SSD length (${storage.length} mm) does not match any motherboard M.2 slot (${slotLengths.join(', ')} mm).`;
    },
  },

  // Motherboard ↔ Case form factor
  {
    id: 'mb-case-formfactor',
    name: 'Motherboard form factor fits in case',
    categories: [ComponentCategory.MOTHERBOARD, ComponentCategory.CASE],
    severity: 'error',
    check: (mb, cs) => {
      if (!isMotherboardSpecs(mb) || !isCaseSpecs(cs)) return 'OK';
      return cs.formFactors.includes(mb.formFactor) ? 'OK' : 'ERROR';
    },
    message: (_r, ctx) => {
      const mb = ctx.mbSpecs as { formFactor?: string };
      const cs = ctx.caseSpecs as { formFactors?: string[] };
      return `Motherboard form factor (${mb.formFactor}) is not supported by case (supports: ${cs.formFactors?.join(', ')}).`;
    },
  },

  // CPU TDP vs cooler capacity
  {
    id: 'cpu-cooler-capacity',
    name: 'Cooler capacity meets CPU TDP',
    categories: [ComponentCategory.CPU, ComponentCategory.COOLING],
    severity: 'warning',
    check: (cpu, cooling) => {
      if (!isCPUSpecs(cpu) || !isCoolingSpecs(cooling)) return 'OK';
      return cooling.tdpCapacity >= cpu.tdp ? 'OK' : 'WARNING';
    },
    message: (_r, ctx) => {
      const cpu = ctx.cpuSpecs as { tdp?: number };
      const cooling = ctx.coolingSpecs as { tdpCapacity?: number };
      return `Cooler capacity (${cooling.tdpCapacity}W) may be insufficient for CPU TDP (${cpu.tdp}W).`;
    },
  },
];

// ──────────────────────────────────────────────
// Compatibility Checker
// ──────────────────────────────────────────────
export interface CompatCheckResult {
  ruleId: string;
  categoryA: string;
  categoryB: string;
  status: CompatStatus;
  message: string;
  suggestion?: string;
  fixable: boolean;
}

export function runCompatibilityCheck(
  components: Record<string, ComponentSpecs | null>,
  productMap: Record<string, unknown>,
): CompatCheckResult[] {
  const results: CompatCheckResult[] = [];

  const cpu = components['CPU'] ?? null;
  const gpu = components['GPU'] ?? null;
  const mb = components['MOTHERBOARD'] ?? null;
  const ram = components['RAM'] ?? null;
  const storage = components['STORAGE'] ?? null;
  const psu = components['PSU'] ?? null;
  const cs = components['CASE'] ?? null;
  const cooling = components['COOLING'] ?? null;

  const totalTdp =
    (cpu && 'tdp' in cpu ? (cpu.tdp as number) : 0) +
    (gpu && 'tdp' in gpu ? (gpu.tdp as number) : 0) +
    50;

  const ctx: Record<string, unknown> = {
    cpuSpecs: cpu,
    gpuSpecs: gpu,
    mbSpecs: mb,
    ramSpecs: ram,
    storageSpecs: storage,
    psuSpecs: psu,
    caseSpecs: cs,
    coolingSpecs: cooling,
    gpuTdp: gpu && 'tdp' in gpu ? (gpu.tdp as number) : 0,
    totalTdp,
  };

  for (const rule of rules) {
    const [catA, catB] = rule.categories;
    const a = components[catA];
    const b = components[catB];
    if (!a || !b) continue; // skip rules where either component is not selected

    const status = rule.check(a, b, ctx);
    if (status === 'OK') continue; // don't add OK results

    results.push({
      ruleId: rule.id,
      categoryA: catA,
      categoryB: catB,
      status,
      message: rule.message(status, ctx),
      suggestion: getSuggestion(rule.id, ctx),
      fixable: true,
    });
  }

  return results;
}

function getSuggestion(ruleId: string, ctx: Record<string, unknown>): string | undefined {
  switch (ruleId) {
    case 'cpu-mb-socket':
      return `Choose a motherboard with ${(ctx.cpuSpecs as { socket?: string }).socket} socket.`;
    case 'mb-ram-gen':
      return `Choose ${(ctx.mbSpecs as { supportedRamGen?: string[] }).supportedRamGen?.join(' or ')} RAM.`;
    case 'gpu-case-clearance':
      return `Choose a case with at least ${(ctx.gpuSpecs as { length?: number }).length} mm GPU clearance.`;
    case 'psu-wattage':
      return `Upgrade to a ${Math.ceil((ctx.totalTdp as number) * PSU_HEADROOM_FACTOR)}W or higher PSU.`;
    case 'cooler-case-clearance':
      return `Choose a shorter cooler (under ${(ctx.caseSpecs as { maxCpuCoolerHeight?: number }).maxCpuCoolerHeight} mm).`;
    case 'cooler-socket':
      return `Choose a cooler that supports ${(ctx.cpuSpecs as { socket?: string }).socket} socket.`;
    case 'storage-m2-length':
      return `Choose an M.2 SSD with a compatible length.`;
    case 'mb-case-formfactor':
      return `Choose a ${(ctx.mbSpecs as { formFactor?: string }).formFactor} compatible case.`;
    default:
      return undefined;
  }
}

export function getOverallStatus(results: CompatCheckResult[]): 'PASS' | 'WARN' | 'FAIL' {
  const errors = results.filter((r) => r.status === 'ERROR');
  const warnings = results.filter((r) => r.status === 'WARNING');
  if (errors.length > 0) return 'FAIL';
  if (warnings.length > 0) return 'WARN';
  return 'PASS';
}

export function getCompatibilityScore(results: CompatCheckResult[]): number {
  if (results.length === 0) return 100;
  const errors = results.filter((r) => r.status === 'ERROR').length;
  const warnings = results.filter((r) => r.status === 'WARNING').length;
  const total = results.length;
  return Math.max(0, Math.round(((total - errors * 2 - warnings) / total) * 100));
}