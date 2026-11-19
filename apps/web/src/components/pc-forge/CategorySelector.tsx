// RIGVERSE — PC Forge: Category Selector Component
// Handles component category selection and state management.

'use client';

import { ComponentCategory } from '@shared/types';
import { useBuildStore } from '@/hooks/stores';

interface CategorySelectorProps {
  selectedCategory: ComponentCategory;
  onCategorySelect: (category: ComponentCategory) => void;
}

const CATEGORIES: { category: ComponentCategory; label: string; icon: string }[] = [
  { category: ComponentCategory.CPU, label: 'CPU', icon: '⚡' },
  { category: ComponentCategory.GPU, label: 'GPU', icon: '🎮' },
  { category: ComponentCategory.MOTHERBOARD, label: 'Motherboard', icon: '🔌' },
  { category: ComponentCategory.RAM, label: 'RAM', icon: '💾' },
  { category: ComponentCategory.STORAGE, label: 'Storage', icon: '💿' },
  { category: ComponentCategory.CASE, label: 'Case', icon: '🖥️' },
  { category: ComponentCategory.PSU, label: 'PSU', icon: '🔋' },
  { category: ComponentCategory.COOLING, label: 'Cooling', icon: '❄️' },
];

export function CategorySelector({
  selectedCategory,
  onCategorySelect,
}: CategorySelectorProps) {
  const { components } = useBuildStore();

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
      {CATEGORIES.map(({ category, label, icon }) => {
        const isSelected = selectedCategory === category;
        const component = components[category];
        const hasComponent = !!component && !component.hidden;

        return (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200
              ${
                isSelected
                  ? 'border-rigverse-neon-cyan bg-rigverse-neon-cyan/10 shadow-lg shadow-rigverse-neon-cyan/25'
                  : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
              }
            `}
          >
            {hasComponent && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
            )}
            <div className="text-2xl mb-2 text-center">{icon}</div>
            <div className="text-xs font-semibold text-center text-rigverse-muted">
              {label}
            </div>
            {hasComponent && (
              <div className="mt-2 text-[10px] text-rigverse-neon-cyan text-center font-mono">
                SELECTED
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}