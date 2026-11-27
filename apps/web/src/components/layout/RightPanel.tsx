// RIGVERSE — Right Panel
// Contextual panel: build summary, compatibility report, component properties.
// Content changes based on the active build stage.

'use client';

import { useEffect, useState } from 'react';
import { BuildStage } from '@shared/types/enums';
import { useBuildStore, useBuildTotals } from '@/hooks/stores';
import { motion } from 'framer-motion';

export function RightPanel({ className, stage }: { className?: string; stage?: BuildStage }) {
  const { compatReport } = useBuildStore();
  const totals = useBuildTotals();
  const [activeTab, setActiveTab] = useState<'summary' | 'compatibility' | 'properties'>('summary');

  const TABS: { id: 'summary' | 'compatibility' | 'properties'; label: string }[] = [
    { id: 'summary', label: 'Build Summary' },
    { id: 'compatibility', label: 'Compatibility' },
    { id: 'properties', label: 'Properties' },
  ];

  return (
    <div className={['flex flex-col h-full', className].filter(Boolean).join(' ')}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-rigverse-border flex items-center justify-between bg-white/[0.02]">
        <h2 className="text-sm font-semibold font-heading text-white tracking-tight">Context</h2>
        <div className="flex gap-1 text-[10px]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-1 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white/[0.08] text-white border border-white/20'
                  : 'text-rigverse-muted hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Build Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="glass-panel p-4">
              <h3 className="text-xs font-bold text-rigverse-muted uppercase tracking-wider mb-3">Build Totals</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-rigverse-muted">Component Price</span>
                  <span className="font-mono text-rigverse-neon-cyan">₹{totals.componentPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-rigverse-muted">Accessories</span>
                  <span className="font-mono text-white">₹{totals.accessoryPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/[0.08] pt-2">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-rigverse-neon-violet">₹{totals.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-4">
              <h3 className="text-xs font-bold text-rigverse-muted uppercase tracking-wider mb-3">Stage</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rigverse-neon-cyan" />
                <span className="text-sm font-semibold text-white capitalize">{stage?.toLowerCase() ?? 'forge'}</span>
              </div>
            </div>

            <div className="glass-panel p-4">
              <h3 className="text-xs font-bold text-rigverse-muted uppercase tracking-wider mb-3">Selected Components</h3>
              <div className="text-[11px] text-rigverse-muted">
                No detailed component data available yet.
                <br />
                Select components in Forge to see the breakdown here.
              </div>
            </div>
          </div>
        )}

        {/* Compatibility */}
        {activeTab === 'compatibility' && (
          <div className="space-y-4">
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-rigverse-muted uppercase tracking-wider">Compatibility Report</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    compatReport?.overall === 'PASS'
                      ? 'bg-green/10 text-green border border-green/20'
                      : compatReport?.overall === 'WARN'
                        ? 'bg-amber/10 text-amber border border-amber/20'
                        : 'bg-rose/10 text-rose border border-rose/20'
                  }`}
                >
                  {compatReport?.overall ?? 'Pending'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-rigverse-neon-cyan" />
                <span className="text-sm font-mono text-white">{compatReport?.score ?? 0}/100</span>
              </div>
              {compatReport?.results && compatReport.results.length > 0 ? (
                <div className="space-y-2">
                  {compatReport.results.map((r, i) => (
                    <div key={i} className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-semibold text-white">{r.categoryA} ↔ {r.categoryB}</span>
                        <span
                          className={`text-[10px] font-bold ${
                            r.status === 'OK' ? 'text-green' : r.status === 'WARNING' ? 'text-amber' : 'text-rose'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-rigverse-muted">{r.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-rigverse-muted text-center py-4">No compatibility issues detected.</p>
              )}
            </div>
          </div>
        )}

        {/* Properties */}
        {activeTab === 'properties' && (
          <div className="glass-panel p-4 space-y-4">
            <h3 className="text-xs font-bold text-rigverse-muted uppercase tracking-wider mb-3">Properties</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm border-b border-white/[0.04] pb-2">
                <span className="text-rigverse-muted">Ambient Light</span>
                <span className="text-rigverse-neon-cyan font-mono">0.35</span>
              </div>
              <div className="flex justify-between text-sm border-b border-white/[0.04] pb-2">
                <span className="text-rigverse-muted">Room Theme</span>
                <span className="text-white font-mono">Dark</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-rigverse-muted">Triangle Budget</span>
                <span className="text-rigverse-neon-violet font-mono">2.0M</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
