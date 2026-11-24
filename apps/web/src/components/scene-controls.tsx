// RIGVERSE — Scene Controls Component
// 3D renderer controls: environment type, DPR cap, triangle budget.
// Wired to the scene store actions (setEnvironment, setDprCap, setTriangleBudget).

'use client';

import { useSceneStore } from '@/hooks/stores';
import { DEFAULT_DPR_CAP, MOBILE_MAX_DPR, MAX_TRIANGLE_BUDGET } from '@shared/types/constants';
import { MIN_TRIANGLE_BUDGET } from '@/stores/scene';

const ENV_TYPES: Array<'hdr' | 'gradient' | 'solid'> = ['hdr', 'gradient', 'solid'];

export function SceneControls() {
  const scene = useSceneStore((s) => s.scene);
  const dprCap = useSceneStore((s) => s.dprCap);
  const triangleBudget = useSceneStore((s) => s.triangleBudget);
  const setEnvironment = useSceneStore((s) => s.setEnvironment);
  const setDprCap = useSceneStore((s) => s.setDprCap);
  const setTriangleBudget = useSceneStore((s) => s.setTriangleBudget);

  const envType = scene?.environment?.type ?? 'gradient';

  return (
    <div className="glass-panel p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Scene Controls</h2>

      {/* Environment Type */}
      <div>
        <label className="block text-sm text-rigverse-muted mb-2">Environment</label>
        <div className="flex gap-2">
          {ENV_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setEnvironment(type)}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${
                  envType === type
                    ? 'bg-rigverse-neon-cyan/20 text-rigverse-neon-cyan border border-rigverse-neon-cyan'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }
              `}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* DPR Cap */}
      <div>
        <label className="block text-sm text-rigverse-muted mb-2">
          DPR Cap: <span className="text-rigverse-neon-cyan font-mono">{dprCap.toFixed(1)}x</span>
        </label>
        <input
          type="range"
          min={MOBILE_MAX_DPR}
          max={DEFAULT_DPR_CAP}
          step={0.1}
          value={dprCap}
          onChange={(e) => setDprCap(parseFloat(e.target.value))}
          className="w-full accent-rigverse-neon-cyan"
        />
        <div className="flex justify-between text-[10px] text-rigverse-muted mt-1">
          <span>{MOBILE_MAX_DPR}x</span>
          <span>{DEFAULT_DPR_CAP}x</span>
        </div>
      </div>

      {/* Triangle Budget */}
      <div>
        <label className="block text-sm text-rigverse-muted mb-2">
          Triangle Budget: <span className="text-rigverse-neon-violet font-mono">{triangleBudget.toLocaleString('en-IN')}</span>
        </label>
        <input
          type="range"
          min={MIN_TRIANGLE_BUDGET}
          max={MAX_TRIANGLE_BUDGET}
          step={10000}
          value={triangleBudget}
          onChange={(e) => setTriangleBudget(parseInt(e.target.value, 10))}
          className="w-full accent-rigverse-neon-violet"
        />
        <div className="flex justify-between text-[10px] text-rigverse-muted mt-1">
          <span>{(MIN_TRIANGLE_BUDGET / 1000).toLocaleString('en-IN')}k</span>
          <span>{MAX_TRIANGLE_BUDGET.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
