// RIGVERSE — PC Forge: Product Card Component
// Displays individual hardware components with pricing and selection state.

'use client';

import { ComponentCategory } from '@shared/types';
import { useBuildStore, useBuildTotals, usePricingStore } from '@/hooks/stores';
import type { BuildStore } from '@/stores/build';

interface ProductCardProps {
  productId: string;
  category: ComponentCategory;
  name: string;
  description?: string;
  imageUrl?: string;
}

export const FAKE_PRODUCTS: Record<string, { name: string; description: string }> = {
  'cpu-123': { name: 'Ryzen 7 7800X3D', description: '8-Core Gaming CPU with 3D V-Cache' },
  'gpu-456': { name: 'RTX 5080 Ti', description: 'Next-Gen 16GB Graphics Card' },
  'mb-789': { name: 'X670E Gaming Motherboard', description: 'ATX PCIe 5.0 Motherboard' },
  'ram-123': { name: '32GB DDR5 Gaming RAM', description: '6000MHz CL36 Overclocked Kit' },
  'ssd-456': { name: '2TB NVMe Gen5 SSD', description: 'PCIe 5.0 Ultra Fast Storage' },
  'psu-789': { name: '1000W ATX 3.0 PSU', description: 'Fully Modular 80 Plus Gold' },
  'cooler-123': { name: 'Liquid 360mm AIO', description: '360mm All-in-One Liquid Cooler' },
};

export function ProductCard({
  productId,
  category,
  name,
  description,
  imageUrl,
}: ProductCardProps) {
const selectComponent = useBuildStore((s) => s.selectComponent);
  const components = useBuildStore((s) => s.components);
  const snapshots = usePricingStore((s) => s.snapshots);
  const totals = useBuildTotals();

  const snapshot = snapshots[productId];
  const bestPrice = snapshot?.bestPrice ?? 0;
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(bestPrice);
  const isSelected = components[category]?.productId === productId;

  return (
    <div className="glass-panel p-6 category-card hover:border-rigverse-neon-cyan/50 transition-all duration-300">
      {imageUrl && <div className="w-full h-40 bg-gradient-to-br from-rigverse-neon-cyan/20 to-rigverse-neon-violet/20 rounded-lg mb-4" />}
      <h3 className="text-lg font-bold mb-2">{name}</h3>
      {description && <p className="text-sm text-rigverse-muted mb-4">{description}</p>}

      <div className="flex items-center justify-between mb-4">
        <span className="price-chip">₹{bestPrice.toLocaleString('en-IN')}</span>
        {snapshot && <span className="text-xs text-rigverse-muted">{snapshot.sellers[0]?.sellerName}</span>}
      </div>

      <button
        onClick={() => selectComponent(category, {
          productId,
          category,
          locked: false,
          hidden: false,
        })}
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
