// RIGVERSE — PC Forge: Showcase Panel Component
// Final Showcase — premium gaming setup showcase with budget tracking.

'use client';

import { BuildStage } from '@shared/types';
import type { BuildComponent } from '@/models/build';
import { useBuildStore, useBuildTotals, usePricingStore, useUIStore } from '@/hooks/stores';
import { getProduct } from '@/lib/catalog';
import { formatINR } from '@/lib/totals';
import { SceneControls } from '@/components/scene-controls';
<<<<<<< HEAD
import { Accessory, BuildComponent } from '@/models/build';
import { PriceSnapshot } from '@/models/price';

export function ShowcasePanel() {
  const { components, accessories, stage, setStage } = useBuildStore();
  const { snapshots } = usePricingStore();
=======

const COMPAT_STYLES = {
  PASS: 'text-green',
  WARN: 'text-amber',
  FAIL: 'text-rose',
} as const;

export function ShowcasePanel() {
  const components = useBuildStore((s) => s.components);
  const accessories = useBuildStore((s) => s.accessories);
  const compatReport = useBuildStore((s) => s.compatReport);
  const resetBuild = useBuildStore((s) => s.resetBuild);
  const saveBuild = useBuildStore((s) => s.saveBuild);
  const snapshots = usePricingStore((s) => s.snapshots);
  const setStage = useUIStore((s) => s.setStage);
  const showToast = useUIStore((s) => s.showToast);
>>>>>>> 5a30304695ef9f65487c4ccac024ba3591bd265a
  const totals = useBuildTotals();

  const selectedComponents = Object.values(components).filter((c): c is BuildComponent => c !== null);

  const handleSave = async () => {
    const slug = await saveBuild();
    showToast(`Build saved (${slug})`, 'success');
  };

<<<<<<< HEAD
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
=======
  const handleNewBuild = () => {
    resetBuild();
    setStage(BuildStage.FORGE);
>>>>>>> 5a30304695ef9f65487c4ccac024ba3591bd265a
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Component Price</p>
            <p className="text-2xl font-bold text-rigverse-neon-cyan">{formatINR(totals.componentPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Total Build Price</p>
            <p className="text-2xl font-bold text-rigverse-neon-amber">{formatINR(totals.total)}</p>
          </div>
          <div>
<<<<<<< HEAD
            <p className="text-sm text-rigverse-muted mb-1">Shipping</p>
            <p className="text-2xl font-bold text-rigverse-neon-violet">₹{totals.shipping.toLocaleString('en-IN')}</p>
=======
            <p className="text-sm text-rigverse-muted mb-1">Savings vs MRP</p>
            <p className="text-2xl font-bold text-rigverse-neon-violet">{formatINR(totals.savingsVsMrp)}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Compatibility</p>
            <p className={`text-2xl font-bold ${compatReport ? COMPAT_STYLES[compatReport.overall] : ''}`}>
              {compatReport ? `${compatReport.overall} (${compatReport.score}%)` : '—'}
            </p>
>>>>>>> 5a30304695ef9f65487c4ccac024ba3591bd265a
          </div>
        </div>
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Selected Components</h2>
<<<<<<< HEAD
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
=======
        {selectedComponents.length === 0 ? (
          <p className="text-rigverse-muted text-sm">No components selected.</p>
        ) : (
          <div className="space-y-4">
            {selectedComponents.map((comp) => {
              const product = getProduct(comp.productId);
              const snap = snapshots[comp.productId];
              return (
                <div key={comp.category} className="p-4 border rounded-lg border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {comp.category}: {product?.name ?? comp.productId}
                    </span>
                    <span className="text-rigverse-neon-cyan">{snap ? formatINR(snap.bestPrice) : '—'}</span>
                  </div>
                  <p className="text-xs text-rigverse-muted">{product?.description ?? ''}</p>
                </div>
              );
            })}
          </div>
        )}
>>>>>>> 5a30304695ef9f65487c4ccac024ba3591bd265a
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Accessories</h2>
<<<<<<< HEAD
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
=======
        {accessories.length === 0 ? (
          <p className="text-rigverse-muted text-sm">No accessories added.</p>
        ) : (
          <div className="space-y-3">
            {accessories.map((acc) => {
              const product = getProduct(acc.productId);
              const snap = snapshots[acc.productId];
              return (
                <div key={acc.productId} className="p-3 border rounded-lg border-white/10 flex items-center justify-between">
                  <span className="font-medium text-rigverse-neon-violet">{product?.name ?? acc.category}</span>
                  <span className="text-xs text-rigverse-muted">{snap ? formatINR(snap.bestPrice) : '—'}</span>
                </div>
              );
            })}
          </div>
        )}
>>>>>>> 5a30304695ef9f65487c4ccac024ba3591bd265a
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <button
          onClick={() => setStage(BuildStage.STUDIO)}
          className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
        >
          ← Back to Studio
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-4 rounded-xl border border-rigverse-neon-cyan/40 text-rigverse-neon-cyan hover:bg-rigverse-neon-cyan/10 transition-all"
        >
          Save Build
        </button>
        <button onClick={handleNewBuild} className="flex-1 btn-neon text-lg py-4">
          Start a New Build
        </button>
      </div>

      <SceneControls />
    </div>
  );
}
