// RIGVERSE — PC Forge: Studio Panel Component
// Interactive 3D peripheral arrangement and room styling.

'use client';

import { useState, useEffect } from 'react';
import { ComponentCategory, AccessoryCategory, RoomTheme, BuildStage } from '@shared/types';
import { useBuildStore, useUIStore } from '@/hooks/stores';
import { usePricingStore } from '@/hooks/stores';
import { useBuildTotals } from '@/hooks/stores';
import { FAKE_PRODUCTS } from './ProductCard';
import { DEFAULT_DPR_CAP, MOBILE_MAX_DPR, MAX_TRIANGLE_BUDGET } from '@shared/types/constants';
import { SceneControls } from '@/components/scene-controls';
import { Accessory } from '@/models/build';

// Catalog entry: display-only fields, separate from the Accessory model
interface AccessoryCatalogEntry {
  productId: string;
  name: string;
  category: AccessoryCategory;
  price: number;
  description: string;
}

export function StudioPanel() {
  const { components, removeComponent, toggleComponentLock, toggleComponentHidden, runCompatibilityCheck, stage, setStage, accessories, addAccessory, removeAccessory } = useBuildStore();
  const { roomTheme, setRoomTheme, showToast } = useUIStore();
  const { snapshots, autoRefreshEnabled, setAutoRefresh, triggerRefresh } = usePricingStore();
  const totals = useBuildTotals();

  const selectedComponent = Object.values(components).find(c => c?.productId) || null;

  // Accessory catalog for studio stage — display-only entries
  const ACCESSORIES: AccessoryCatalogEntry[] = [
    { productId: 'monitor-456', name: 'Monitor 27" QHD', category: AccessoryCategory.MONITOR, price: 18999, description: 'High refresh rate, IPS panel' },
    { productId: 'keyboard-789', name: 'Mechanical Keyboard', category: AccessoryCategory.KEYBOARD, price: 9999, description: 'RGB backlit, blue switches' },
    { productId: 'mouse-123', name: 'Gaming Mouse', category: AccessoryCategory.MOUSE, price: 4999, description: 'Ergonomic, 16000 DPI' },
    { productId: 'speakers-456', name: 'Desktop Speakers', category: AccessoryCategory.SPEAKERS, price: 7999, description: '2.1 channel, subwoofer' },
    { productId: 'chair-789', name: 'Gaming Chair', category: AccessoryCategory.CHAIR, price: 14999, description: 'Racing style, lumbar support' },
    { productId: 'desk-123', name: 'Gaming Desk', category: AccessoryCategory.DESK, price: 12999, description: 'L-shaped, cable management' },
    { productId: 'decor-456', name: 'RGB Poster', category: AccessoryCategory.DECOR, price: 2999, description: 'Neon cityscape artwork' },
  ];

  useEffect(() => {
    // Auto-check compatibility after entering STUDIO stage
    if (stage === BuildStage.STUDIO) {
      runCompatibilityCheck();
    }
  }, [stage]);

  const handleCategorySelect = (category: ComponentCategory) => {
    setStage(BuildStage.SHOWCASE);
  };

  // Handle accessory add/remove — map catalog entry to Accessory model
  const handleAddAccessory = (accessory: AccessoryCatalogEntry) => {
    const existing = accessories.find(a => a.productId === accessory.productId);
    if (existing) {
      removeAccessory(accessories.indexOf(existing));
    } else {
      addAccessory({
        productId: accessory.productId,
        category: accessory.category,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      });
    }
  };

  // Helper: check if accessory is already selected
  function isAccessorySelected(productId: string): boolean {
    return accessories.some(a => a.productId === productId);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-rigverse-neon-violet">SETUP STUDIO</h1>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Component Selection</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(ComponentCategory).map(([key, category]) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${selectedComponent?.category === category ? 'bg-rigverse-neon-violet/20 text-rigverse-neon-violet border border-rigverse-neon-violet' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}
              `}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Accessory Catalog</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ACCESSORIES.map((acc) => (
            <div
              key={acc.productId}
              className="p-4 border rounded-lg border-white/10 hover:border-rigverse-neon-violet/30 transition-colors"
            >
              <div className="text-center mb-2">
                <span className="text-2xl">📦</span>
                <h4 className="text-sm font-medium">{acc.name}</h4>
              </div>
              <p className="text-xs text-rigverse-muted mb-1">{acc.description}</p>
              <p className="text-lg font-bold text-rigverse-neon-cyan">₹{acc.price.toLocaleString('en-IN')}</p>
              <button
                onClick={() => handleAddAccessory(acc)}
                className="mt-2 px-3 py-1 text-xs font-semibold transition-all duration-150
                  ${totals.accessoryPrice > 0 && !isAccessorySelected(acc.productId) ? 'bg-rigverse-neon-violet/20' : 'bg-white/20'}
                  text-rigverse-neon-violet rounded"
              >
                {isAccessorySelected(acc.productId) ? 'Added' : 'Add'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Room Theme</h2>
        <div className="flex gap-2">
          {Object.entries(RoomTheme).map(([key, theme]) => (
            <button
              key={theme}
              onClick={() => setRoomTheme(theme)}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${
                  roomTheme === theme
                    ? 'bg-rigverse-neon-violet/20 text-rigverse-neon-violet border border-rigverse-neon-violet'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }
              `}
            >
              {theme.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-xs text-rigverse-muted mt-2">Current: {roomTheme.toUpperCase()}</p>
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Live Price Calculator</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Component Price</p>
            <p className="text-2xl font-bold text-rigverse-neon-violet">₹{totals.componentPrice.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Accessories</p>
            <p className="text-2xl font-bold">₹{totals.accessoryPrice.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Total (incl. shipping)</p>
            <p className="text-2xl font-bold text-rigverse-neon-amber">₹{totals.total.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <button
          onClick={() => {
            runCompatibilityCheck();
            const compat = useBuildStore.getState().compatReport;
            if (compat && compat.overall === 'FAIL') {
              showToast('Some components have compatibility issues', 'warning');
            }
          }}
          className="w-full btn-neon text-lg py-4"
        >
          Validate & Continue to Showcase
        </button>
      </div>

      <SceneControls />
    </div>
  );
}