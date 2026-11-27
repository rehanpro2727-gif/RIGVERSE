// RIGVERSE — Landing Page (PC Forge intro)
// Immersive 3D gaming experience configurator.

'use client';

import { useEffect } from 'react';
import { BuildStage } from '@shared/types/enums';
import { motion } from 'framer-motion';
import { useBuildStore, usePricingStore, useUIStore, useSessionStore, useBuildTotals, useSelectedComponentCount } from '@/hooks/stores';
import { ForgePanel } from '@/components/pc-forge/ForgePanel';
import { SceneControls } from '@/components/scene-controls';
import { VaultLayout } from '@/components/layout/VaultLayout';

// RIGVERSE visual identity constants
const NEON_COLORS = {
  cyan: '#00f3ff',
  violet: '#b24bff',
  pink: '#ff0080',
  amber: '#ffb800',
};

const FEATURES = [
  {
    icon: '🛠️',
    title: 'PC Forge',
    description: 'Intelligent component selection with real-time compatibility checking',
    color: NEON_COLORS.cyan,
  },
  {
    icon: '🎨',
    title: 'Setup Studio',
    description: 'Interactive 3D peripheral arrangement and styling',
    color: NEON_COLORS.violet,
  },
  {
    icon: '🏆',
    title: 'Final Showcase',
    description: 'Premium gaming setup showcase with budget tracking',
    color: NEON_COLORS.amber,
  },
];

export default function HomePage() {
  const { components, runCompatibilityCheck, recalcTotals } = useBuildStore();
  const { snapshots, autoRefreshEnabled } = usePricingStore();
  const { setStage } = useUIStore();
  const { setGuestSession } = useSessionStore();

  // Initialize guest session on first visit
  useEffect(() => {
    setGuestSession();
  }, [setGuestSession]);

  // Auto-recalculate totals when components change
  useEffect(() => {
    recalcTotals();
  }, [components, recalcTotals]);

  // Auto-run compatibility check on component selection
  useEffect(() => {
    if (Object.keys(components).length > 0) {
      runCompatibilityCheck();
    }
  }, [components, runCompatibilityCheck]);

  // Auto-refresh prices on interval when enabled
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const id = setInterval(() => {
      usePricingStore.getState().triggerRefresh();
    }, 2 * 60 * 1000); // 2 minutes
    return () => clearInterval(id);
  }, [autoRefreshEnabled]);

  const totals = useBuildTotals();
  const selectedCount = useSelectedComponentCount();

  const compatScore = `${Object.keys(snapshots).length}/${selectedCount}`;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <VaultLayout>
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-rigverse-bg via-rigverse-bg to-rigverse-bg/80 z-0" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] z-0" />

        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
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
                  <p className="text-sm text-rigverse-muted mb-1">Component Price</p>
                  <p className="text-2xl font-bold text-rigverse-neon-cyan">
                    {totals.formattedPrice}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-rigverse-muted mb-1">Live Items</p>
                  <p className="text-2xl font-bold">
                    {selectedCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-rigverse-muted mb-1">Compatibility</p>
                  <p className="text-2xl font-bold text-rigverse-neon-amber">
                    {compatScore}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-rigverse-muted">Auto-refresh prices</span>
                <button
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
                onClick={() => setStage(BuildStage.FORGE)}
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
                <motion.div
                  key={feature.title}
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
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: feature.color }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-rigverse-muted text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Forge Panel — PC Component Selection */}
          <ForgePanel />

          {/* Scene Controls — 3D renderer settings */}
          <div className="mt-8">
            <SceneControls />
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-6 h-10 border-2 border-rigverse-neon-cyan/30 rounded-full flex items-start justify-center"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 bg-rigverse-neon-cyan rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </section>
      </VaultLayout>
    </main>
  );
}