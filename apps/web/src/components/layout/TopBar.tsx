// RIGVERSE — Top Bar
// Stage navigator (FORGE / STUDIO / SHOWCASE) + global actions.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BuildStage } from '@shared/types/enums';
import { useBuildStore } from '@/hooks/stores';
import { motion } from 'framer-motion';

const STAGES: { id: BuildStage; label: string; hint: string }[] = [
  { id: BuildStage.FORGE, label: 'Forge', hint: 'Component selection' },
  { id: BuildStage.STUDIO, label: 'Studio', hint: '3D setup & styling' },
  { id: BuildStage.SHOWCASE, label: 'Showcase', hint: 'Final reveal' },
];

export function TopBar({ stage, onStageChange }: { stage: BuildStage; onStageChange: (s: BuildStage) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-rigverse-border bg-rigverse-panel/40 backdrop-blur-md flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rigverse-neon-cyan to-rigverse-neon-violet flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.4)]">
            <span className="text-[10px] font-bold tracking-wider">R</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-heading text-xl font-bold tracking-tight">RIGVERSE</h1>
            <p className="text-[10px] text-rigverse-muted tracking-widest uppercase">The Vault</p>
          </div>
        </Link>

        {/* Stage Navigator */}
        <div className="hidden md:flex items-center gap-1 px-4 py-1 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          {STAGES.map((s) => {
            const active = stage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  onStageChange(s.id);
                  setIsMenuOpen(false);
                }}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5
                  ${active
                    ? 'bg-rigverse-neon-cyan text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]'
                    : 'text-rigverse-muted hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <motion.div
                  animate={active ? { scale: 1 } : { scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="w-2 h-2 rounded-full bg-current"
                />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-lg text-rigverse-muted hover:bg-white/10 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.03] text-rigverse-muted hover:text-white hover:bg-white/10 transition-all">
          Saved Builds
        </button>
        <button className="px-4 py-2 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.03] text-rigverse-muted hover:text-white hover:bg-white/10 transition-all">
          Share
        </button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-rigverse-neon-cyan text-black font-bold text-xs flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.6)] transition-all"
          title="Start Build"
        >
          ▶
        </motion.button>
      </div>

      {/* Mobile stage dropdown */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-16 left-0 right-0 md:hidden bg-rigverse-panel/90 backdrop-blur border-b border-rigverse-border z-30 py-4 px-4 space-y-2"
        >
          {STAGES.map((s) => {
            const active = stage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  onStageChange(s.id);
                  setIsMenuOpen(false);
                }}
                className={`
                  w-full px-4 py-3 rounded-xl text-left text-sm font-semibold transition-colors
                  ${active
                    ? 'bg-rigverse-neon-cyan text-black'
                    : 'text-white hover:bg-white/10'
                  }
                `}
              >
                {s.label} <span className="ml-auto text-[10px] text-rigverse-muted">{s.hint}</span>
              </button>
            );
          })}
        </motion.div>
      )}
    </header>
  );
}
