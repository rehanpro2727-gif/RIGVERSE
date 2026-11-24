// RIGVERSE — PC Forge: Studio Panel Component
// Interactive 3D peripheral arrangement and room styling.

'use client';

import { AccessoryCategory, BuildStage, RoomTheme } from '@shared/types';
import type { BuildComponent } from '@/models/build';
import { useBuildStore, useBuildTotals, useSceneStore, useUIStore } from '@/hooks/stores';
import { ACCESSORY_PRODUCTS, getProduct, type CatalogProduct } from '@/lib/catalog';
import { formatINR } from '@/lib/totals';
import { SceneControls } from '@/components/scene-controls';

export function StudioPanel() {
  const components = useBuildStore((s) => s.components);
  const accessories = useBuildStore((s) => s.accessories);
  const addAccessory = useBuildStore((s) => s.addAccessory);
  const removeAccessory = useBuildStore((s) => s.removeAccessory);
  const toggleComponentLock = useBuildStore((s) => s.toggleComponentLock);
  const toggleComponentHidden = useBuildStore((s) => s.toggleComponentHidden);
  const runCompatibilityCheck = useBuildStore((s) => s.runCompatibilityCheck);
  const roomTheme = useUIStore((s) => s.roomTheme);
  const setRoomTheme = useUIStore((s) => s.setRoomTheme);
  const setStage = useUIStore((s) => s.setStage);
  const showToast = useUIStore((s) => s.showToast);
  const setSceneRoomTheme = useSceneStore((s) => s.setRoomTheme);
  const totals = useBuildTotals();

  const selectedComponents = Object.values(components).filter((c): c is BuildComponent => c !== null);

  const isAccessorySelected = (productId: string) => accessories.some((a) => a.productId === productId);

  // Add the accessory, or remove it if it is already in the build
  const toggleAccessory = (product: CatalogProduct) => {
    const index = accessories.findIndex((a) => a.productId === product.id);
    if (index >= 0) {
      removeAccessory(index);
      return;
    }
    addAccessory({
      productId: product.id,
      category: product.category as AccessoryCategory,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    });
  };

  const chooseRoomTheme = (theme: RoomTheme) => {
    setRoomTheme(theme);
    setSceneRoomTheme(theme);
  };

  const handleContinue = () => {
    const report = runCompatibilityCheck();
    if (report.overall === 'FAIL') {
      showToast('Some components have compatibility issues', 'warning');
    }
    setStage(BuildStage.SHOWCASE);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-rigverse-neon-violet">SETUP STUDIO</h1>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Your Components</h2>
        {selectedComponents.length === 0 ? (
          <p className="text-rigverse-muted text-sm">No components yet. Go back to the Forge to pick some.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedComponents.map((comp) => (
              <div
                key={comp.category}
                className="p-4 border rounded-lg border-white/10 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-xs text-rigverse-muted">{comp.category}</p>
                  <p className={`font-medium ${comp.hidden ? 'opacity-40 line-through' : ''}`}>
                    {getProduct(comp.productId)?.name ?? comp.productId}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleComponentLock(comp.category)}
                    className="px-3 py-1 text-xs rounded border border-white/10 hover:bg-white/10"
                  >
                    {comp.locked ? 'Unlock' : 'Lock'}
                  </button>
                  <button
                    onClick={() => toggleComponentHidden(comp.category)}
                    className="px-3 py-1 text-xs rounded border border-white/10 hover:bg-white/10"
                  >
                    {comp.hidden ? 'Show' : 'Hide'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Accessory Catalog</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ACCESSORY_PRODUCTS.map((acc) => {
            const added = isAccessorySelected(acc.id);
            return (
              <div
                key={acc.id}
                className="p-4 border rounded-lg border-white/10 hover:border-rigverse-neon-violet/30 transition-colors"
              >
                <div className="text-center mb-2">
                  <span className="text-2xl">📦</span>
                  <h4 className="text-sm font-medium">{acc.name}</h4>
                </div>
                <p className="text-xs text-rigverse-muted mb-1">{acc.description}</p>
                <p className="text-lg font-bold text-rigverse-neon-cyan">{formatINR(acc.price)}</p>
                <button
                  onClick={() => toggleAccessory(acc)}
                  className={`mt-2 px-3 py-1 text-xs font-semibold transition-all duration-150 text-rigverse-neon-violet rounded ${
                    added ? 'bg-rigverse-neon-violet/20' : 'bg-white/20'
                  }`}
                >
                  {added ? 'Added ✓ (remove)' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Room Theme</h2>
        <div className="flex gap-2">
          {Object.values(RoomTheme).map((theme) => (
            <button
              key={theme}
              onClick={() => chooseRoomTheme(theme)}
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
            <p className="text-2xl font-bold text-rigverse-neon-violet">{formatINR(totals.componentPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Accessories</p>
            <p className="text-2xl font-bold">{formatINR(totals.accessoryPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Total (incl. shipping)</p>
            <p className="text-2xl font-bold text-rigverse-neon-amber">{formatINR(totals.total)}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <button
          onClick={() => setStage(BuildStage.FORGE)}
          className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
        >
          ← Back to Forge
        </button>
        <button onClick={handleContinue} className="flex-1 btn-neon text-lg py-4">
          Validate &amp; Continue to Showcase
        </button>
      </div>

      <SceneControls />
    </div>
  );
}
