// RIGVERSE — Compatibility Engine Types

import type { ComponentSpecs } from './product';
import type { ComponentCategory } from '@shared/types';

export type CompatStatus = 'OK' | 'WARNING' | 'ERROR' | 'INFO';

export interface CompatibilityRule {
  id: string;
  name: string;
  categories: [ComponentCategory, ComponentCategory];
  severity: 'error' | 'warning';
  check: (
    a: ComponentSpecs,
    b: ComponentSpecs,
    context: Record<string, unknown>,
  ) => CompatStatus;
  message: (result: CompatStatus, context: Record<string, unknown>) => string;
}

export interface CompatibilityResult {
  ruleId: string;
  categoryA: string;
  categoryB: string;
  status: CompatStatus;
  message: string;
  suggestion?: string;
  fixable: boolean;
}

export interface CompatibilityReport {
  buildId: string;
  checkedAt: Date;
  results: CompatibilityResult[];
  overall: 'PASS' | 'WARN' | 'FAIL';
  score: number;
  errors: CompatibilityResult[];
  warnings: CompatibilityResult[];
}