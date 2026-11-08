// "Void" explanation stage (IFOLOGY's navy mind-space): endless navy floor that fades into the
// horizon, a soft spotlight pool + faint beam at the origin, a subtle blueprint grid and a few
// slowly drifting low-poly shapes far behind. Floor y=0; stage centre is the origin.
import React from 'react';
import * as THREE from 'three';
import type { SetProps } from './index';
import type { Vec3 } from '../types';
import { envMaterial, flat, toon } from '../engine/materials';
import { G } from './kit';
import { Batched } from './roomkit';

const FLOOR = '#1c2649';
const GRID = '#1b2549';

let poolTex: THREE.CanvasTexture | null = null;
function poolTexture() {
  if (poolTex) return poolTex;
  const W = 256, H = 256;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d')!;
  const gr = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.45, 'rgba(255,255,255,0.55)');
  gr.addColorStop(0.8, 'rgba(255,255,255,0.12)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  poolTex = new THREE.CanvasTexture(cv);
  poolTex.colorSpace = THREE.SRGBColorSpace;
  return poolTex;
}

const poolMats = new Map<string, THREE.MeshBasicMaterial>();
function poolMaterial(color: string, opacity: number) {
  const key = `${color}|${opacity}`;
  let m = poolMats.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ map: poolTexture(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false });
    poolMats.set(key, m);
  }
  return m;
}

const BEAM = new THREE.CylinderGeometry(0.5, 2.7, 9, 48, 1, true);
// Soft volumetric-looking beam: only back faces draw (so it never tints a character standing in
// it), brightest through the middle and toward the floor, fading out at the silhouette and top.
// When the camera is inside the cone every face is a back face and the far wall would wash a
// character standing behind it navy, so the beam fades out as the camera enters it.
const beamMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
  uniforms: { uColor: { value: new THREE.Color('#5d73c9') }, uOpacity: { value: 0.55 } },
  vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY; varying float vIn;
    void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; vY = uv.y;
      vec4 o = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      float r = 2.7 - 2.2 * clamp((cameraPosition.y - o.y + 4.5) / 9.0, 0.0, 1.0);
      vIn = 1.0 - smoothstep(r - 0.5, r + 0.3, length(cameraPosition.xz - o.xz));
      gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying vec3 vN; varying vec3 vV; varying float vY; varying float vIn;
    void main(){ float f = abs(dot(normalize(vN), normalize(vV))); float a = pow(f, 2.5) * pow(1.0 - vY, 1.4) * uOpacity * (1.0 - vIn); gl_FragColor = vec4(uColor, a); }`,
});
// Backdrop: matches the fog colour at the horizon so the floor melts into it, a faint glow band
// just above, darkening to deep navy overhead.
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
  uniforms: { uHor: { value: new THREE.Color('#141c33') }, uBand: { value: new THREE.Color('#1f2b52') }, uTop: { value: new THREE.Color('#090d1c') } },
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform vec3 uHor; uniform vec3 uBand; uniform vec3 uTop; varying vec3 vD;
    void main(){ float y = max(vD.y, 0.0);
      vec3 c = mix(uHor, uBand, smoothstep(0.0, 0.06, y));
      c = mix(c, uTop, smoothstep(0.08, 0.7, y));
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }`,
});
const SKY = new THREE.SphereGeometry(1, 48, 24);
const RING = new THREE.RingGeometry(0.985, 1, 96);
const OCTA = new THREE.OctahedronGeometry(1, 0);
const TORUS = new THREE.TorusGeometry(1, 0.22, 10, 28);

const ACCENTS: { p: Vec3; s: number; c: string; geo: THREE.BufferGeometry; spin: number; ph: number }[] = [
  { p: [-7.5, 3.4, -10], s: 0.7, c: '#8473d6', geo: G.ico, spin: 0.25, ph: 0 },
  { p: [7.2, 2.4, -12], s: 0.55, c: '#efb54a', geo: OCTA, spin: -0.3, ph: 1.3 },
  { p: [-4.2, 5.6, -17], s: 0.9, c: '#4aa8c4', geo: TORUS, spin: 0.18, ph: 2.1 },
  { p: [10.5, 5.8, -19], s: 0.8, c: '#8473d6', geo: OCTA, spin: 0.22, ph: 3.2 },
  { p: [2.6, 7.2, -22], s: 0.75, c: '#efb54a', geo: G.ico, spin: -0.2, ph: 4.4 },
  { p: [-12, 2.2, -16], s: 0.6, c: '#4aa8c4', geo: G.box, spin: 0.3, ph: 5.1 },
];

export const VoidStage: React.FC<SetProps> = ({ t }) => (
  <group>
    {/* endless floor (fog fades it into the horizon) */}
    <mesh geometry={SKY} material={skyMat} scale={250} renderOrder={-10} frustumCulled={false} />
    <mesh geometry={G.circle} material={toon(FLOOR, { rim: 0, levels: [110, 190, 255] })} rotation={[-Math.PI / 2, 0, 0]} scale={160} receiveShadow />
    {/* faint blueprint grid around the stage */}
    <Batched
      id="void-grid"
      build={b => {
        for (let i = -18; i <= 18; i++) {
          b.add('plane', GRID, [i, 0.002, -6], [0.018, 36, 1], [-Math.PI / 2, 0, 0], { kind: 'glow' });
          b.add('plane', GRID, [0, 0.002, i - 6], [36, 0.018, 1], [-Math.PI / 2, 0, 0], { kind: 'glow' });
        }
      }}
    />
    {/* spotlight pool + rings + faint beam */}
    <mesh geometry={G.circle} material={poolMaterial('#3b4f99', 0.9)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} scale={3.6} renderOrder={2} />
    <mesh geometry={G.circle} material={poolMaterial('#5a6fc0', 0.5)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} scale={1.7} renderOrder={3} />
    <mesh geometry={RING} material={flat('#3a4c8a')} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} scale={3.4} />
    <mesh geometry={RING} material={flat('#2c3a6a')} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} scale={5.2} />
    <mesh geometry={BEAM} material={beamMat} position={[0, 4.5, 0]} renderOrder={4} />
    {/* drifting accents far behind */}
    {ACCENTS.map((a, i) => (
      <mesh
        key={i}
        geometry={a.geo}
        material={envMaterial(a.c)}
        position={[a.p[0], a.p[1] + Math.sin(t * 0.6 + a.ph) * 0.25, a.p[2]]}
        rotation={[t * a.spin + a.ph, t * a.spin * 0.7 + a.ph * 0.5, 0.3]}
        scale={a.s}
      />
    ))}
  </group>
);

export const VOID_MARKS: Record<string, Vec3> = {
  center: [0, 0, 0],
  left: [-2.2, 0, 0.3],
  right: [2.2, 0, 0.3],
  back: [0, 0, -3],
  front: [0, 0, 2],
  farLeft: [-4.5, 0, -1.5],
  farRight: [4.5, 0, -1.5],
};
