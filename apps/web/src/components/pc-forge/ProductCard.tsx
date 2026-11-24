// RIGVERSE — PC Forge: Product Card Component
// Displays individual hardware components with pricing and selection state.

'use client';

import type { ComponentCategory } from '@shared/types';
import { useBuildStore, usePricingStore } from '@/hooks/stores';
import { formatINR } from '@/lib/totals';

interface ProductCardProps {
  productId: string;
  category: ComponentCategory;
  name: string;
  description?: string;
  imageUrl?: string;
}

export function ProductCard({ productId, category, name, description, imageUrl }: ProductCardProps) {
  const selectComponent = useBuildStore((s) => s.selectComponent);
  const isSelected = useBuildStore((s) => s.components[category]?.productId === productId);
  const snapshot = usePricingStore((s) => s.snapshots[productId]);

  return (
    <div className="glass-panel p-6 category-card hover:border-rigverse-neon-cyan/50 transition-all duration-300">
      {imageUrl && (
        <div className="w-full h-40 bg-gradient-to-br from-rigverse-neon-cyan/20 to-rigverse-neon-violet/20 rounded-lg mb-4" />
      )}
      <h3 className="text-lg font-bold mb-2">{name}</h3>
      {description && <p className="text-sm text-rigverse-muted mb-4">{description}</p>}

      <div className="flex items-center justify-between mb-4">
        <span className="price-chip">{snapshot ? formatINR(snapshot.bestPrice) : 'Price unavailable'}</span>
        {snapshot && <span className="text-xs text-rigverse-muted">{snapshot.bestSellerName}</span>}
      </div>

      <button
        onClick={() =>
          selectComponent(category, {
            productId,
            category,
            locked: false,
            hidden: false,
          })
        }
        className={`
          w-full py-2 rounded-lg font-semibold transition-all duration-200
          ${isSelected ? 'bg-rigverse-neon-cyan/20 text-rigverse-neon-cyan border border-rigverse-neon-cyan' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}
        `}
      >
        {isSelected ? '✓ SELECTED' : 'SELECT'}
      </button>
    </div>
  );
}
