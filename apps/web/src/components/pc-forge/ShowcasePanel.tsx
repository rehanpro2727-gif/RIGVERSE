// RIGVERSE — PC Forge: Showcase Panel Component
// Final Showcase — premium gaming setup showcase with budget tracking.

'use client';

import { useState, useEffect } from 'react';
import { useBuildStore, useUIStore, usePricingStore } from '@/hooks/stores';
import { useBuildTotals } from '@/hooks/stores';
import { ComponentCategory, BuildStage } from '@shared/types';
import { DEFAULT_DPR_CAP, MOBILE_MAX_DPR, MAX_TRIANGLE_BUDGET } from '@shared/types/constants';
import { SceneControls } from '@/components/scene-controls';
import { Accessory, BuildComponent } from '@/models/build';
import { PriceSnapshot } from '@/models/price';

export function ShowcasePanel() {
  const { components, accessories, stage, setStage } = useBuildStore();
  const { snapshots } = usePricingStore();
  const totals = useBuildTotals();
  const { showToast } = useUIStore();

  const selectedComponent = Object.values(components).find(c => c?.productId) || null;

  useEffect(() => {
    // Auto-check compatibility and finalize showcase
    const compat = useBuildStore.getState().compatReport;
    if (compat && compat.overall === 'PASS') {
      // Showcase is complete
    }
  }, [components]);

  // Calculate display price from snapshots
  let displayPrice = 0;
  if (Object.keys(snapshots).length > 0) {
    const firstSnap = Object.values(snapshots)[0];
    displayPrice = typeof firstSnap?.bestPrice === 'number' ? firstSnap.bestPrice : 0;
  } else {
    displayPrice = totals.componentPrice;
  }

  // Accessory display names mapped from category
  const accessoryNames: Record<string, string> = {
    MONITOR: 'Monitor 27" QHD',
    KEYBOARD: 'Mechanical Keyboard',
    MOUSE: 'Gaming Mouse',
    SPEAKERS: 'Desktop Speakers',
    CHAIR: 'Gaming Chair',
    DESK: 'Gaming Desk',
    DECOR: 'RGB Poster',
  };

  // Look up live price for a component from pricing snapshots
  const componentPrice = (comp: BuildComponent) => {
    const snap = snapshots[comp.productId];
    return snap?.bestPrice ?? 0;
  };

  // Look up live price for an accessory from pricing snapshots
  const accessoryPrice = (acc: Accessory) => {
    const snap = snapshots[acc.productId];
    return snap?.bestPrice ?? 0;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-rigverse-neon-amber">FINAL SHOWCASE</h1>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Premium Rig Showcase</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Component Price</p>
            <p className="text-2xl font-bold text-rigverse-neon-cyan">₹{displayPrice.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Total Build Price</p>
            <p className="text-2xl font-bold text-rigverse-neon-amber">₹{totals.total.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Shipping</p>
            <p className="text-2xl font-bold text-rigverse-neon-violet">₹{totals.shipping.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Selected Components</h2>
        <div className="space-y-4">
          {Object.entries(components).map(([key, comp]) => {
            if (!comp || !comp.productId) return null;
            const price = componentPrice(comp);
            return (
              <div key={comp.productId} className="p-4 border rounded-lg border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{key}</span>
                  <span className="text-rigverse-neon-cyan">₹{price.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-rigverse-muted">{comp.category}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Accessories</h2>
        <div className="space-y-3">
          {accessories.map((acc) => {
            if (!acc.productId) return null;
            const name = accessoryNames[acc.category] || acc.category;
            const price = accessoryPrice(acc);
            return (
              <div key={acc.productId} className="p-3 border rounded-lg border-white/10">
                <span className="font-medium text-rigverse-neon-violet">{name}</span>
                <span className="text-xs text-rigverse-muted">₹{price.toLocaleString('en-IN')}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <button
          onClick={() => setStage(BuildStage.FORGE)}
          className="w-full btn-neon text-lg py-4"
        >
          Start a New Build
        </button>
      </div>

      <SceneControls />
    </div>
  );
}