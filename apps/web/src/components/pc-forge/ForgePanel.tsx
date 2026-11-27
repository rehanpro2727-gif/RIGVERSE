// RIGVERSE — PC Forge: Forge Panel Component
// Main PC component selection panel with category navigation and product grid.

'use client';

import { useState } from 'react';
import { BuildStage, ComponentCategory } from '@shared/types';
import { CategorySelector } from './CategorySelector';
import { ProductCard } from './ProductCard';
import { useBuildStore, useBuildTotals, useSelectedComponentCount, useUIStore } from '@/hooks/stores';
import { getProductsByCategory } from '@/lib/catalog';
import { formatINR } from '@/lib/totals';

const STATUS_STYLES = {
  OK: 'text-green',
  INFO: 'text-rigverse-neon-cyan',
  WARNING: 'text-amber',
  ERROR: 'text-rose',
} as const;

export function ForgePanel() {
  const components = useBuildStore((s) => s.components);
  const removeComponent = useBuildStore((s) => s.removeComponent);
  const compatReport = useBuildStore((s) => s.compatReport);
  const setStage = useUIStore((s) => s.setStage);
  const showToast = useUIStore((s) => s.showToast);
  const totals = useBuildTotals();
  const selectedCount = useSelectedComponentCount();

  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>(ComponentCategory.CPU);

  const selectedComponent = components[selectedCategory];
  const products = getProductsByCategory(selectedCategory);

  const handleContinue = () => {
    if (selectedCount === 0) {
      showToast('Select at least one component before continuing', 'warning');
      return;
    }
    if (compatReport?.overall === 'FAIL') {
      showToast('Some components have compatibility issues', 'warning');
    }
    setStage(BuildStage.STUDIO);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-rigverse-neon-cyan">PC FORGE</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Component Categories</h2>
        <CategorySelector selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-6">Choose {selectedCategory}</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                productId={product.id}
                category={selectedCategory}
                name={product.name}
                description={product.description}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Nothing available yet</h3>
            <p className="text-rigverse-muted">No products are listed for this category.</p>
          </div>
        )}

        {selectedComponent && (
          <button
            onClick={() => removeComponent(selectedCategory)}
            className="mt-6 px-4 py-2 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-900/50 transition-all"
          >
            Remove {selectedCategory}
          </button>
        )}
      </div>

      {compatReport && compatReport.results.length > 0 && (
        <div className="mb-8 glass-panel p-6">
          <h2 className="text-xl font-semibold mb-4">
            Compatibility <span className="text-sm text-rigverse-muted font-mono">({compatReport.score}%)</span>
          </h2>
          <ul className="space-y-2 text-sm">
            {compatReport.results.map((result, i) => (
              <li key={`${result.categoryA}-${result.categoryB}-${i}`} className={STATUS_STYLES[result.status]}>
                <span className="font-semibold">{result.status}:</span> {result.message}
                {result.suggestion && <span className="text-rigverse-muted"> {result.suggestion}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Live Price Calculator</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Components ({selectedCount}/8)</p>
            <p className="text-2xl font-bold text-rigverse-neon-cyan">{formatINR(totals.componentPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Accessories</p>
            <p className="text-2xl font-bold">{formatINR(totals.accessoryPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Total (incl. shipping)</p>
            <p className="text-2xl font-bold text-rigverse-neon-violet">{formatINR(totals.total)}</p>
          </div>
        </div>
      </div>

      <button onClick={handleContinue} className="w-full btn-neon text-lg py-4">
        Continue to Setup Studio
      </button>
    </div>
  );
}
