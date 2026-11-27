// RIGVERSE — Scene Controls Component
// 3D renderer controls: environment type, DPR cap, triangle budget.
// Wired to the scene store actions (setEnvironment, setDprCap, setTriangleBudget).

'use client';

import { useSceneStore } from '@/hooks/stores';
import { DEFAULT_DPR_CAP, MOBILE_MAX_DPR, MAX_TRIANGLE_BUDGET } from '@shared/types/constants';

const ENV_TYPES: Array<'hdr' | 'gradient' | 'solid'> = ['hdr', 'gradient', 'solid'];

export function SceneControls() {
  const scene = useSceneStore((s) => s.scene);
  const postFx = useSceneStore((s) => s.postFx);
  const setEnvironment = useSceneStore((s) => s.setEnvironment);
  const setDprCap = useSceneStore((s) => s.setDprCap);
  const setTriangleBudget = useSceneStore((s) => s.setTriangleBudget);
  const setPostFx = useSceneStore((s) => s.setPostFx);

  const envType = scene?.environment?.type ?? 'gradient';
  const dprCap = useSceneStore((s) => s.dprCap) ?? DEFAULT_DPR_CAP;
  const triangleBudget = useSceneStore((s) => s.triangleBudget) ?? MAX_TRIANGLE_BUDGET;

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
          Triangle Budget: <span className="text-rigverse-neon-violet font-mono">{triangleBudget.toLocaleString()}</span>
        </label>
        <input
          type="range"
          min={10000}
          max={MAX_TRIANGLE_BUDGET}
          step={10000}
          value={triangleBudget}
          onChange={(e) => setTriangleBudget(parseInt(e.target.value, 10))}
          className="w-full accent-rigverse-neon-violet"
        />
        <div className="flex justify-between text-[10px] text-rigverse-muted mt-1">
          <span>10k</span>
          <span>{MAX_TRIANGLE_BUDGET.toLocaleString()}</span>
        </div>
      </div>

      {/* Post FX */}
      <div>
        <label className="block text-sm text-rigverse-muted mb-2">Post Processing</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <button
              onClick={() => setPostFx({ bloom: !postFx.bloom })}
              className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
                postFx.bloom
                  ? 'bg-rigverse-neon-cyan/20 text-rigverse-neon-cyan border border-rigverse-neon-cyan'
                  : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
              }`}
            >
              Bloom: {postFx.bloom ? 'ON' : 'OFF'}
            </button>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={postFx.chromaticAberration}
                onChange={(e) => setPostFx({ chromaticAberration: e.target.checked })}
                className="accent-rigverse-neon-violet"
              />
              Chromatic Aberration
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={postFx.filmGrain}
                onChange={(e) => setPostFx({ filmGrain: e.target.checked })}
                className="accent-rigverse-neon-pink"
              />
              Film Grain
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={postFx.vignette}
                onChange={(e) => setPostFx({ vignette: e.target.checked })}
                className="accent-rigverse-neon-amber"
              />
              Vignette
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm text-rigverse-muted mb-2">
            Bloom Intensity: <span className="text-rigverse-neon-cyan font-mono">{postFx.bloomIntensity.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={postFx.bloomIntensity}
            onChange={(e) => setPostFx({ bloomIntensity: parseFloat(e.target.value) })}
            className="w-full accent-rigverse-neon-cyan"
          />
        </div>
      </div>
    </div>
  );
}