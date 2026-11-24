// RIGVERSE — Landing Page (PC Forge intro)
// Immersive 3D gaming experience configurator.

'use client';

import { useEffect } from 'react';
import { useBuildStore, usePricingStore, useUIStore, useBuildTotals, useSelectedComponentCount } from '@/hooks/stores';
import { BuildStage } from '@shared/types/enums';
import { motion } from 'framer-motion';
import { ForgePanel } from '@/components/pc-forge/ForgePanel';
import { StudioPanel } from '@/components/pc-forge/StudioPanel';
import { ShowcasePanel } from '@/components/pc-forge/ShowcasePanel';
import { SceneControls } from '@/components/scene-controls';

// RIGVERSE visual identity constants
const NEON_COLORS = {
  cyan: '#00f3ff',
  violet: '#b24bff',
  pink: '#ff0080',
  amber: '#ffb800',
};

const FEATURES = [
  {
    stage: BuildStage.FORGE,
    icon: '🛠️',
    title: 'PC Forge',
    description: 'Intelligent component selection with real-time compatibility checking',
    color: NEON_COLORS.cyan,
  },
  {
    stage: BuildStage.STUDIO,
    icon: '🎨',
    title: 'Setup Studio',
    description: 'Interactive 3D peripheral arrangement and styling',
    color: NEON_COLORS.violet,
  },
  {
    stage: BuildStage.SHOWCASE,
    icon: '🏆',
    title: 'Final Showcase',
    description: 'Premium gaming setup showcase with budget tracking',
    color: NEON_COLORS.amber,
  },
];

export default function HomePage() {
  const components = useBuildStore((s) => s.components);
  const accessories = useBuildStore((s) => s.accessories);
  const compatReport = useBuildStore((s) => s.compatReport);
  const recalcTotals = useBuildStore((s) => s.recalcTotals);
  const snapshots = usePricingStore((s) => s.snapshots);
  const autoRefreshEnabled = usePricingStore((s) => s.autoRefreshEnabled);
  const refreshIntervalMs = usePricingStore((s) => s.refreshIntervalMs);
  const stage = useUIStore((s) => s.stage);
  const setStage = useUIStore((s) => s.setStage);

  // Keep totals in sync when the selection or any price changes
  useEffect(() => {
    recalcTotals();
  }, [components, accessories, snapshots, recalcTotals]);

  // Auto-refresh prices on interval when enabled
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const id = setInterval(() => {
      void usePricingStore.getState().triggerRefresh();
    }, refreshIntervalMs);
    return () => clearInterval(id);
  }, [autoRefreshEnabled, refreshIntervalMs]);

  const totals = useBuildTotals();
  const selectedCount = useSelectedComponentCount();

  const compatScore = compatReport && selectedCount > 0 ? `${compatReport.score}%` : '—';

  const goToBuilder = (target: BuildStage) => {
    setStage(target);
    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-rigverse-bg via-rigverse-bg to-rigverse-bg/80 z-0" />
      <div className="absolute inset-0 bg-grid-faint z-0" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-6xl md:text-8xl font-bold mb-6"
          >
            <span className="neon-text-cyan">RIG</span>
            <span className="text-white">VERSE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl md:text-2xl text-rigverse-muted mb-8 max-w-2xl mx-auto"
          >
            Build your legend. Experience the future of gaming.
            <br />
            <span className="text-rigverse-neon-cyan">Real Indian pricing.</span>
            <span className="text-rigverse-neon-violet"> Live compatibility.</span>
            <span className="text-rigverse-neon-pink"> 3D assembly.</span>
          </motion.p>

          {/* Live Price Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="glass-panel p-8 max-w-2xl mx-auto mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Live Build Tracker</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rigverse-neon-cyan rounded-full animate-pulse" />
                <span className="text-xs text-rigverse-neon-cyan font-mono">
                  {autoRefreshEnabled ? 'AUTO-REFRESH ON' : 'MANUAL'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-rigverse-muted mb-1">Build Total</p>
                <p className="text-2xl font-bold text-rigverse-neon-cyan">{totals.formattedPrice}</p>
              </div>
              <div>
                <p className="text-sm text-rigverse-muted mb-1">Components</p>
                <p className="text-2xl font-bold">{selectedCount}/8</p>
              </div>
              <div>
                <p className="text-sm text-rigverse-muted mb-1">Compatibility</p>
                <p className="text-2xl font-bold text-rigverse-neon-amber">{compatScore}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-rigverse-muted">Auto-refresh prices</span>
              <button
                type="button"
                role="switch"
                aria-checked={autoRefreshEnabled}
                aria-label="Auto-refresh prices"
                onClick={() => usePricingStore.getState().setAutoRefresh(!autoRefreshEnabled)}
                className={`
                  relative w-12 h-6 rounded-full transition-all duration-200
                  ${autoRefreshEnabled ? 'bg-rigverse-neon-cyan/40' : 'bg-white/10'}
                `}
              >
                <span
                  className={`
                    absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200
                    ${autoRefreshEnabled ? 'translate-x-6' : 'translate-x-0.5'}
                  `}
                />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => goToBuilder(BuildStage.FORGE)}
              className="w-full btn-neon text-lg py-4"
            >
              Start Building Your Rig
            </motion.button>
          </motion.div>

          {/* Three-Stage Experience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {FEATURES.map((feature, index) => (
              <motion.button
                type="button"
                key={feature.title}
                onClick={() => goToBuilder(feature.stage)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.6 }}
                className="category-card p-8 text-center group"
                whileHover={{ y: -8 }}
              >
                <div
                  className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: feature.color }}>
                  {feature.title}
                </h3>
                <p className="text-rigverse-muted text-sm">{feature.description}</p>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Builder: the active stage's panel */}
      <section id="builder" className="relative z-10 px-4 pb-24">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center mb-4">
          {FEATURES.map((feature) => (
            <button
              key={feature.stage}
              onClick={() => setStage(feature.stage)}
              className={`
                px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200
                ${
                  stage === feature.stage
                    ? 'border-rigverse-neon-cyan bg-rigverse-neon-cyan/15 text-rigverse-neon-cyan'
                    : 'border-white/10 bg-white/5 text-rigverse-muted hover:bg-white/10'
                }
              `}
            >
              {feature.title}
            </button>
          ))}
        </div>

        {stage === BuildStage.FORGE && (
          <>
            <ForgePanel />
            <div className="max-w-7xl mx-auto px-6">
              <SceneControls />
            </div>
          </>
        )}
        {stage === BuildStage.STUDIO && <StudioPanel />}
        {stage === BuildStage.SHOWCASE && <ShowcasePanel />}
      </section>
    </main>
  );
}
