// Time-of-day palettes, sky dome and lighting rig. The palette also drives the character rim
// colour so silhouettes always pick up the scene's key light.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { LOOK } from '../engine/materials';
import type { Vec3 } from '../types';

export type Palette = {
  skyTop: string; skyHorizon: string; skyBottom: string;
  fog: string; fogNear: number; fogFar: number;
  hemiSky: string; hemiGround: string; hemi: number;
  key: string; keyInt: number; keyDir: Vec3;
  rim: string; rimAmbient: number;
  sun?: { color: string; size: number; dir: Vec3 };
  stars?: boolean;
  windows: string; // lit window colour for this time
  windowsLit: boolean;
  ground?: string;
};

export const PALETTES: Record<string, Palette> = {
  // IFOLOGY-style bright late afternoon (default for suburb scenes). Intensities are π-scaled for
  // three's physically-based lights with no tone mapping: hemi ≈ 0.62×albedo, key adds ≈ 0.5×.
  afternoon: {
    skyTop: '#6e9fd9', skyHorizon: '#dbe7f1', skyBottom: '#dbe7f1', fog: '#dfe4e6', fogNear: 45, fogFar: 230,
    hemiSky: '#f3f1ff', hemiGround: '#a39a78', hemi: 2.05, key: '#fff0d6', keyInt: 1.65, keyDir: [-0.5, 0.62, 0.6],
    rim: '#f6e7c6', rimAmbient: 0, windows: '#b9d4e6', windowsLit: false,
  },
  day: {
    skyTop: '#4f8fd0', skyHorizon: '#cfe7f4', skyBottom: '#cfe7f4', fog: '#cfe1ec', fogNear: 30, fogFar: 140,
    hemiSky: '#d4e6ff', hemiGround: '#8a8f6a', hemi: 2.0, key: '#fff3df', keyInt: 1.7, keyDir: [0.55, 0.8, 0.45],
    rim: '#fff4dc', rimAmbient: 0.35, windows: '#a9c8e2', windowsLit: false,
  },
  golden: {
    skyTop: '#3f4f8a', skyHorizon: '#f6b36a', skyBottom: '#f2c48e', fog: '#e6a878', fogNear: 25, fogFar: 120,
    hemiSky: '#9aa4d8', hemiGround: '#6a4f40', hemi: 1.7, key: '#ffb46e', keyInt: 1.9, keyDir: [-0.75, 0.32, -0.45],
    rim: '#ffc98c', rimAmbient: 0.45, sun: { color: '#ffe0a0', size: 6, dir: [-0.75, 0.12, -0.6] }, windows: '#ffcf7a', windowsLit: true,
  },
  dusk: {
    skyTop: '#2a2556', skyHorizon: '#e48a70', skyBottom: '#f0a57a', fog: '#8a5f86', fogNear: 20, fogFar: 110,
    hemiSky: '#7b6fc0', hemiGround: '#3c2c44', hemi: 1.7, key: '#ffa27e', keyInt: 1.4, keyDir: [-0.6, 0.3, -0.5],
    rim: '#ffbf95', rimAmbient: 0.5, sun: { color: '#ffd6a8', size: 7, dir: [-0.6, 0.06, -0.8] }, windows: '#ffcf7a', windowsLit: true,
  },
  night: {
    skyTop: '#060a1c', skyHorizon: '#1d2c58', skyBottom: '#1d2c58', fog: '#121a36', fogNear: 18, fogFar: 95,
    hemiSky: '#3a4c8c', hemiGround: '#161624', hemi: 1.4, key: '#a7c0ff', keyInt: 0.8, keyDir: [0.4, 0.7, -0.5],
    rim: '#b3ccff', rimAmbient: 0.55, stars: true, sun: { color: '#e9efff', size: 3.2, dir: [0.4, 0.45, -0.8] }, windows: '#ffcf7a', windowsLit: true,
  },
  interior: {
    skyTop: '#8fc0e6', skyHorizon: '#d7ecf6', skyBottom: '#d7ecf6', fog: '#2f2a28', fogNear: 25, fogFar: 80,
    hemiSky: '#fff1df', hemiGround: '#7a6656', hemi: 2.1, key: '#ffe6c2', keyInt: 1.4, keyDir: [0.6, 0.65, 0.4],
    rim: '#ffd8a6', rimAmbient: 0.4, windows: '#bfe0f5', windowsLit: false,
  },
  interiorNight: {
    skyTop: '#0a1028', skyHorizon: '#24345f', skyBottom: '#24345f', fog: '#14121c', fogNear: 20, fogFar: 70,
    hemiSky: '#4a4f86', hemiGround: '#221c24', hemi: 1.5, key: '#ffbb78', keyInt: 1.1, keyDir: [0.6, 0.55, 0.5],
    rim: '#ffc286', rimAmbient: 0.45, windows: '#2a3d6e', windowsLit: true,
  },
  void: {
    skyTop: '#0e1428', skyHorizon: '#1d2846', skyBottom: '#1d2846', fog: '#141c33', fogNear: 12, fogFar: 45,
    hemiSky: '#4a5a8c', hemiGround: '#141a2c', hemi: 1.7, key: '#fff0d6', keyInt: 1.3, keyDir: [0.5, 0.7, 0.4],
    rim: '#f0b44c', rimAmbient: 0.6, windows: '#f0b44c', windowsLit: true,
  },
};

const skyMat = (p: Palette) =>
  new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
    uniforms: {
      top: { value: new THREE.Color(p.skyTop) }, hor: { value: new THREE.Color(p.skyHorizon) }, bot: { value: new THREE.Color(p.skyBottom) },
      sunDir: { value: new THREE.Vector3(...(p.sun?.dir || [0, -1, 0])).normalize() },
      sunCol: { value: new THREE.Color(p.sun?.color || '#000') }, sunSize: { value: p.sun?.size || 0 },
      stars: { value: p.stars ? 1 : 0 },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 top; uniform vec3 hor; uniform vec3 bot; uniform vec3 sunDir; uniform vec3 sunCol; uniform float sunSize; uniform float stars;
      varying vec3 vDir;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
      void main(){
        float y = vDir.y;
        vec3 c = y > 0.0 ? mix(hor, top, pow(clamp(y, 0.0, 1.0), 0.55)) : mix(hor, bot, clamp(-y * 4.0, 0.0, 1.0));
        float d = max(dot(normalize(vDir), sunDir), 0.0);
        float ang = acos(clamp(d, -1.0, 1.0)) * 57.2958;
        c += sunCol * smoothstep(sunSize, sunSize * 0.85, ang) * 0.9;
        c += sunCol * exp(-ang / (sunSize * 2.5)) * 0.35;
        if (stars > 0.5 && y > 0.05) {
          vec3 q = floor(vDir * 260.0);
          float s = h(q);
          c += vec3(step(0.996, s) * (0.5 + 0.5 * h(q + 1.0))) * smoothstep(0.05, 0.3, y);
        }
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });

export const Sky: React.FC<{ p: Palette }> = ({ p }) => {
  const m = useMemo(() => skyMat(p), [p]);
  return (
    <mesh material={m} scale={300} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[1, 48, 24]} />
    </mesh>
  );
};

/** Lights + fog + sky + global rim uniforms for a palette. `shadowBox` sizes the sun's shadow frustum. */
export const Lighting: React.FC<{ p: Palette; center?: Vec3; shadowBox?: number; sky?: boolean; bg?: boolean; desat?: number; rim?: boolean }> = ({ p, center = [0, 0, 0], shadowBox = 18, sky = true, bg = true, desat = 0, rim = true }) => {
  const dir = new THREE.Vector3(...p.keyDir).normalize();
  if (rim) {
    LOOK.uRimColor.value.set(p.rim);
    LOOK.uRimAmbient.value = p.rimAmbient;
  }
  LOOK.uKeyDir.value.copy(dir);
  LOOK.uDesat.value = desat;
  const lightPos = new THREE.Vector3(...center).addScaledVector(dir, 40);
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(...center);
  return (
    <>
      {bg && <color attach="background" args={[p.skyHorizon]} />}
      <fog attach="fog" args={[p.fog, p.fogNear, p.fogFar]} />
      <hemisphereLight args={[p.hemiSky, p.hemiGround, p.hemi]} />
      <primitive object={target} />
      <directionalLight
        color={p.key}
        intensity={p.keyInt}
        position={lightPos}
        target={target}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-shadowBox}
        shadow-camera-right={shadowBox}
        shadow-camera-top={shadowBox}
        shadow-camera-bottom={-shadowBox}
        shadow-camera-near={1}
        shadow-camera-far={90}
      />
      {sky && <Sky p={p} />}
    </>
  );
};
