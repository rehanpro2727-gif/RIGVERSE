// RIGVERSE — Bottom Drawer
// Slide-up panel for expanded details / asset library.
// Controlled by UI store drawer state (isDrawerOpen, drawerContent, toggleDrawer).

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function BottomDrawer({
  className,
  isOpen,
  onClose,
  content,
}: {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  content: ReactNode | null;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!content && !isOpen) return null;

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={[
        'fixed bottom-0 left-0 right-0 z-50 flex flex-col border-t border-rigverse-border bg-rigverse-panel/80 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.5)]',
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Drawer handle */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-12 h-1.5 rounded-full bg-white/[0.12]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <h3 className="text-sm font-semibold font-heading text-white tracking-tight">Expanded Details</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg text-rigverse-muted hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          title="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {content}
      </div>

      {/* Footer divider */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center justify-between text-[10px] text-rigverse-muted uppercase tracking-wider">
          <span>RIGVERSE Vault</span>
          <span className="flex gap-3">
            <button className="flex items-center gap-1 hover:text-white transition-colors">
              Export Build
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
            <button className="flex items-center gap-1 hover:text-white transition-colors">
              Share Link
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
