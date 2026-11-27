// RIGVERSE — Left Rail
// Component category navigation + stage-specific quick actions.

'use client';

import { useEffect, useState } from 'react';
import { ComponentCategory } from '@shared/types';
import { useBuildStore } from '@/hooks/stores';
import { motion } from 'framer-motion';

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

export function LeftRail({ className }: { className?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | null>(null);
  const { components, selectComponent } = useBuildStore();

  useEffect(() => {
    const first = Object.values(components).find((c) => c !== null && !c.hidden);
    if (first && selectedCategory === null) {
      setSelectedCategory(first.category);
    }
  }, [components, selectedCategory]);

  const component = selectedCategory ? components[selectedCategory] : null;

  return (
    <aside className={['flex flex-col h-full', className].filter(Boolean).join(' ')}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-rigverse-border">
        <h2 className="text-sm font-semibold font-heading tracking-tight text-white">Components</h2>
        <button
          className="w-7 h-7 rounded-lg text-[10px] border border-white/[0.08] bg-white/[0.03] text-rigverse-muted hover:text-white hover:border-white/20 flex items-center justify-center transition-colors"
          title="Filter"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m6 4l9-9m-9 9l3-3" />
          </svg>
        </button>
      </div>

      {/* Category grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map(({ category, label, icon }) => {
            const isSelected = selectedCategory === category;
            const comp = components[category];
            const hasComponent = !!comp && !comp.hidden;

            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  if (comp) {
                    selectComponent(category, comp);
                  }
                }}
                className={`
                  p-3 rounded-xl border border-transparent transition-all duration-200 flex flex-col items-center gap-1.5
                  ${isSelected
                    ? 'bg-rigverse-neon-cyan/10 border-rigverse-neon-cyan/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                    : 'bg-white/[0.02] text-rigverse-muted hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                <div className="text-lg">{icon}</div>
                <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
                {hasComponent && (
                  <div className="w-1.5 h-1.5 bg-rigverse-neon-cyan rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected component detail */}
        {selectedCategory && component && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03]"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-white/[0.1] flex items-center justify-center text-[10px]">
                {component.productId.slice(-4)}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white truncate">{component.productId}</div>
                <div className="text-[10px] text-rigverse-neon-cyan font-mono uppercase">Selected</div>
              </div>
            </div>
            <button
              onClick={() => {
                // handled by parent or inline
              }}
              className="w-full py-1.5 text-[10px] font-semibold text-rigverse-neon-pink hover:text-rigverse-neon-pink transition-colors uppercase tracking-wider"
            >
              Replace
            </button>
          </motion.div>
        )}
      </div>

      {/* Stage actions */}
      <div className="border-t border-rigverse-border p-3 space-y-2">
        <button className="w-full py-2.5 rounded-xl border border-rigverse-neon-cyan/50 bg-rigverse-neon-cyan/10 text-rigverse-neon-cyan text-xs font-bold tracking-wider hover:bg-rigverse-neon-cyan/20 transition-all">
          Run Compatibility
        </button>
        <button className="w-full py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-rigverse-muted text-xs font-bold tracking-wider hover:text-white hover:bg-white/10 transition-all">
          Save Build
        </button>
      </div>
    </aside>
  );
}
