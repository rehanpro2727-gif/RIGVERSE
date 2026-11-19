// RIGVERSE — PC Forge: Forge Panel Component
// Main PC component selection panel with category navigation and product grid.

'use client';

import { useState } from 'react';
import { ComponentCategory } from '@shared/types';
import { CategorySelector } from './CategorySelector';
import { ProductCard, FAKE_PRODUCTS } from './ProductCard';
import { useBuildStore, useBuildTotals } from '@/hooks/stores';

export function ForgePanel() {
  const { components, removeComponent, runCompatibilityCheck } = useBuildStore();
  const totals = useBuildTotals();

  const [selectedCategory, setSelectedCategory] = useState(ComponentCategory.CPU);

  const selectedComponent = components[selectedCategory] || null;

  const handleCategorySelect = (category: ComponentCategory) => {
    setSelectedCategory(category);
    if (selectedComponent?.productId) {
      removeComponent(category);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-rigverse-neon-cyan">PC FORGE</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Component Categories</h2>
        <CategorySelector
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      <div className="mb-8 glass-panel p-6">
        <h2 className="text-xl font-semibold mb-6">Selected Component</h2>
        {selectedComponent ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProductCard
                productId={selectedComponent.productId}
                category={selectedComponent.category}
                name={FAKE_PRODUCTS[selectedComponent.productId]?.name || selectedComponent.productId}
                description={FAKE_PRODUCTS[selectedComponent.productId]?.description}
              />
            </div>

            <button
              onClick={() => {
                removeComponent(selectedComponent.category);
                runCompatibilityCheck();
              }}
              className="mt-6 px-4 py-2 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-900/50 transition-all"
            >
              Remove Component
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Component Selected</h3>
            <p className="text-rigverse-muted">Select a category to browse available components</p>
          </div>
        )}
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4">Live Price Calculator</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-rigverse-muted mb-1">CPU + GPU + Motherboard</p>
            <p className="text-2xl font-bold text-rigverse-neon-cyan">₹{totals.componentPrice.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Accessories</p>
            <p className="text-2xl font-bold">₹{totals.accessoryPrice.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm text-rigverse-muted mb-1">Total (incl. shipping)</p>
            <p className="text-2xl font-bold text-rigverse-neon-violet">₹{totals.total.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}