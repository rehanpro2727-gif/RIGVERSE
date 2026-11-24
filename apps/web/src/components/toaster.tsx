// RIGVERSE — Toaster
// Renders the toasts queued in the UI store (showToast).

'use client';

import { useUIStore } from '@/hooks/stores';
import type { Toast } from '@/stores/ui';

const TYPE_STYLES: Record<Toast['type'], string> = {
  success: 'border-green/40 text-green',
  error: 'border-rose/40 text-rose',
  warning: 'border-amber/40 text-amber',
  info: 'border-rigverse-neon-cyan/40 text-rigverse-neon-cyan',
};

export function Toaster() {
  const toasts = useUIStore((s) => s.toasts);
  const hideToast = useUIStore((s) => s.hideToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`glass-panel flex items-start gap-3 px-4 py-3 text-sm bg-rigverse-bg/90 ${TYPE_STYLES[toast.type]}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => hideToast(toast.id)}
            aria-label="Dismiss"
            className="text-rigverse-muted hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
