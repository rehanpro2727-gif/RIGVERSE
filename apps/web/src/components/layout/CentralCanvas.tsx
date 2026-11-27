// RIGVERSE — Central Canvas (Phase 2: R3F wired)
// 3D workspace canvas driven by the scene store and build store.

'use client';

import * as THREE from 'three';
import { RGBA } from 'three';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { BlendFunction } from 'postprocessing';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { useSceneStore, useBuildStore } from '@/hooks/stores';
import { ComponentCategory } from '@shared/types';
import { DEFAULT_DPR_CAP, MAX_TRIANGLE_BUDGET } from '@shared/types/constants';
import { BuildComponent, Accessory } from '@/models/build';

// Fiber's three-types.d.ts declares `declare module 'react'` to extend
// JSX.IntrinsicElements with ThreeElements, but tsc isn't picking up that
// augmentation under jsx: preserve + isolatedModules. Re-declare it here so
// mesh, boxGeometry, ambientLight, pointLight, primitive etc. are valid JSX.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const CATEGORY_COLORS: Record<ComponentCategory, string> = {
  [ComponentCategory.CPU]: '#00f3ff',
  [ComponentCategory.GPU]: '#b24bff',
  [ComponentCategory.MOTHERBOARD]: '#ff0080',
  [ComponentCategory.RAM]: '#ffb800',
  [ComponentCategory.STORAGE]: '#00f3ff',
  [ComponentCategory.CASE]: '#b24bff',
  [ComponentCategory.PSU]: '#ff0080',
  [ComponentCategory.COOLING]: '#ffb800',
};

function ComponentMesh({
  comp,
  category,
  boxSegs,
}: {
  comp: BuildComponent;
  category: ComponentCategory;
  boxSegs: number;
}) {
  const color = CATEGORY_COLORS[category];
  const position = comp.position ?? [0, 0, 0];
  const rotation = comp.rotation ?? [0, 0, 0];

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[0.7, 0.7, 0.7, boxSegs, boxSegs, boxSegs]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
    </mesh>
  );
}

function AccessoryMesh({ acc, sphereSegs }: { acc: Accessory; sphereSegs: number }) {
  return (
    <mesh position={acc.position} rotation={acc.rotation} castShadow receiveShadow>
      <sphereGeometry args={[0.3, sphereSegs, sphereSegs]} />
      <meshStandardMaterial color="#b24bff" emissive="#b24bff" emissiveIntensity={0.3} />
    </mesh>
  );
}

export function CentralCanvas({ className, stage }: { className?: string; stage?: string }) {
  const scene = useSceneStore((s) => s.scene);
  const lightingRig = useSceneStore((s) => s.lightingRig);
  const postFx = useSceneStore((s) => s.postFx);
  const dprCap = useSceneStore((s) => s.dprCap);
  const triangleBudget = useSceneStore((s) => s.triangleBudget);
  const components = useBuildStore((s) => s.components);
  const accessories = useBuildStore((s) => s.accessories);

  // Map triangle budget → geometry segment detail (1..16). A full box mesh
  // costs 12 tris × segments² per face, so scale segments roughly with budget.
  const budgetFactor = Math.min(16, Math.max(1, Math.round((triangleBudget ?? MAX_TRIANGLE_BUDGET) / 50000)));
  const boxSegs = Math.min(8, Math.ceil(budgetFactor / 2));
  const sphereSegs = Math.min(32, Math.ceil(budgetFactor * 2));

  const cameraPreset = scene?.camera ?? { position: [0, 0.9, 2.4], target: [0, 0.45, 0], fov: 50 };
  const bgColor = scene?.environment.color ?? '#0B0B14';
  const envType = scene?.environment.type ?? 'gradient';

  const key = lightingRig?.key ?? { intensity: 2.2, color: '#00E5FF', position: [2.5, 3, 2.5] };
  const fill = lightingRig?.fill ?? { intensity: 0.8, color: '#7C3AED', position: [-2.5, 2, 1.5] };
  const rim = lightingRig?.rim ?? { intensity: 1.5, color: '#FF3B8A', position: [0, 2.5, -2.5] };
  const ambient = lightingRig?.ambient ?? { intensity: 0.35, color: '#1A1A2E' };

  return (
    <div className={['relative h-full w-full bg-rigverse-bg overflow-hidden', className].filter(Boolean).join(' ')}>
      <Canvas
        camera={{ position: cameraPreset.position, fov: cameraPreset.fov, lookAt: cameraPreset.target }}
        dpr={dprCap ?? DEFAULT_DPR_CAP}
      >
        <ambientLight intensity={ambient.intensity} color={ambient.color} />
        <pointLight intensity={key.intensity} color={key.color} position={key.position} castShadow />
        <pointLight intensity={fill.intensity} color={fill.color} position={fill.position} />
        <pointLight intensity={rim.intensity} color={rim.color} position={rim.position} />

        {/* Environment background: solid / gradient / HDR */}
        {envType === 'solid' ? (
          <primitive object={new THREE.Color(bgColor)} attach="background" />
        ) : envType === 'hdr' ? (
          <primitive
            object={
              (() => {
                const tex = new THREE.DataTexture(
                  new Uint8Array([
                    0, 0, 0, 255, 64, 64, 64, 255, 128, 128, 128, 255, 192,
                    192, 192, 255,
                  ]),
                  2,
                  2,
                  RGBA
                );
                tex.needsUpdate = true;
                return tex;
              })()
            }
            attach="background"
          />
        ) : (
          // gradient: blend two colors via a canvas texture
          <primitive
            object={
              (() => {
                const gradCanvas = document.createElement('canvas');
                gradCanvas.width = 2;
                gradCanvas.height = 256;
                const ctx = gradCanvas.getContext('2d')!;
                const top = new THREE.Color(bgColor);
                const bottom = new THREE.Color('#0B0B14');
                const gradient = ctx.createLinearGradient(0, 0, 0, 256);
                gradient.addColorStop(0, top.getStyle());
                gradient.addColorStop(1, bottom.getStyle());
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 2, 256);
                const tex = new THREE.CanvasTexture(gradCanvas);
                return tex;
              })()
            }
            attach="background"
          />
        )}

        {postFx.bloom || postFx.chromaticAberration || postFx.filmGrain || postFx.vignette ? (
          <EffectComposer>
            {postFx.bloom && (
              <Bloom
                blendFunction={BlendFunction.NORMAL}
                intensity={postFx.bloomIntensity}
                luminanceThreshold={0.1}
                luminanceSmoothing={0.95}
              />
            )}
            {postFx.chromaticAberration && (
              <ChromaticAberration offset={[0.0015, 0]} radialModulation />
            )}
            {postFx.filmGrain && (
              <Noise blendFunction={BlendFunction.SCREEN} opacity={0.04} />
            )}
            {postFx.vignette && (
              <Vignette
                blendFunction={BlendFunction.NORMAL}
                eskil={false}
                darkness={0.7}
                offset={0.25}
              />
            )}
          </EffectComposer>
        ) : null}

        {Object.entries(components).map(([category, comp]) => {
          if (!comp || comp.hidden) return null;
          return (
            <ComponentMesh
              key={comp.productId}
              comp={comp}
              category={category as ComponentCategory}
              boxSegs={boxSegs}
            />
          );
        })}

        {accessories.map((acc) => (
          <AccessoryMesh key={acc.productId} acc={acc} sphereSegs={sphereSegs} />
        ))}
      </Canvas>
    </div>
  );
}
