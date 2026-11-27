'use client';

import dynamic from 'next/dynamic';
import { ReactNode, useState } from 'react';
import { TopBar } from './TopBar';
import { LeftRail } from './LeftRail';
import { RightPanel } from './RightPanel';
import { BottomDrawer } from './BottomDrawer';
import { useBuildStore } from '@/stores/build';
import { useUIStore } from '@/stores/ui';

// CentralCanvas imports @react-three/postprocessing, which is not SSR-safe.
// Mount it only on the client to avoid a 500 during initial server render.
const CentralCanvas = dynamic(
  () => import('./CentralCanvas').then((mod) => mod.CentralCanvas),
  { ssr: false }
);

export function VaultLayout({ children }: { children: ReactNode }) {
  const stage = useBuildStore((s) => s.stage);
  const setStage = useBuildStore((s) => s.setStage);
  const isDrawerOpen = useUIStore((s) => s.isDrawerOpen);
  const toggleDrawer = useUIStore((s) => s.toggleDrawer);
  const drawerContent = useUIStore((s) => s.drawerContent);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-rigverse-bg">
      {/* Background atmosphere */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--rigverse-neon-cyan)_0%,_transparent_70%)] opacity-[0.03]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_top,_var(--rigverse-neon-violet)_0%,_transparent_60%)] opacity-[0.05] blur-3xl" />
      </div>

      {/* Top Bar - Stage navigator + global actions */}
      <TopBar stage={stage} onStageChange={setStage} />

      {/* Main 5-region grid */}
      <div className="grid h-full w-full grid-cols-[280px_1fr_360px] grid-rows-[auto_1fr_auto]">
        {/* Left Rail - Component Categories */}
        <LeftRail className="row-span-2 border-r border-rigverse-border bg-rigverse-panel/50" />

        {/* Central Canvas - 3D Workspace */}
        <CentralCanvas
          className="row-span-2 relative overflow-hidden"
          stage={stage}
        />

        {/* Right Panel - Contextual (Build Summary / Compatibility / Properties)} */}
        <RightPanel className="row-span-2 border-l border-rigverse-border bg-rigverse-panel/50" stage={stage} />

        {/* Bottom Drawer - Expanded Details / Asset Library */}
        <BottomDrawer
          className="col-span-3 border-t border-rigverse-border bg-rigverse-panel/60"
          isOpen={isDrawerOpen}
          onClose={toggleDrawer}
          content={drawerContent}
        />
      </div>
    </div>
  );
}