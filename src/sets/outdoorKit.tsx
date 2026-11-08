// Shared pieces for the outdoor sets (city, park, stadium, rooftop): instancing helper, time-of-day
// switches, street furniture and extra palettes. Geometries are module-level constants; materials
// come only from envMaterial/flat (cached) or the small module-level caches below.
import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { envMaterial, flat, toonGradient } from '../engine/materials';
import type { Vec3 } from '../types';
import { At, Ball, Box, Cyl, G, mix, Sign } from './kit';
import { PALETTES } from './look';

// ---------------------------------------------------------------------------------------
// Palettes for night scenes. The stock `night` palette fogs out anything beyond ~90 m, which turns a
// lit skyline or a floodlit stadium into murk; these keep the dark sky but push the fog back.
// ---------------------------------------------------------------------------------------
Object.assign(PALETTES, {
  cityNight: {
    skyTop: '#070b20', skyHorizon: '#2a3466', skyBottom: '#2a3466', fog: '#1a2246', fogNear: 35, fogFar: 230,
    hemiSky: '#5a6cb0', hemiGround: '#2a2430', hemi: 1.75, key: '#b9ccff', keyInt: 0.9, keyDir: [0.4, 0.7, 0.5],
    rim: '#b3ccff', rimAmbient: 0.55, stars: true, windows: '#ffcf7a', windowsLit: true,
  },
  stadiumNight: {
    skyTop: '#050918', skyHorizon: '#1f2a55', skyBottom: '#1f2a55', fog: '#141c3a', fogNear: 60, fogFar: 320,
    hemiSky: '#dfe6ff', hemiGround: '#3a4a3a', hemi: 1.9, key: '#ffffff', keyInt: 1.25, keyDir: [0.35, 0.85, 0.4],
    rim: '#e8efff', rimAmbient: 0.45, stars: true, windows: '#ffcf7a', windowsLit: true,
  },
});

// ---------------------------------------------------------------------------------------
// Time of day
// ---------------------------------------------------------------------------------------
/** 0 = daylight … 1 = full night, from the palette key. */
export function nightness(time: string): number {
  const t = (time || '').toLowerCase();
  if (t.includes('night')) return 1;
  if (t.includes('dusk')) return 0.8;
  if (t.includes('golden')) return 0.4;
  return 0;
}
export const lampsOn = (time: string) => nightness(time) >= 0.75;

// ---------------------------------------------------------------------------------------
// Instancing: one draw call for hundreds of windows / spectators / seats.
// ---------------------------------------------------------------------------------------
export type Inst = { p: Vec3; s?: Vec3 | number; r?: Vec3 | number; q?: THREE.Quaternion; c?: string };

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

export function buildInstanced(geo: THREE.BufferGeometry, mat: THREE.Material, items: Inst[], cast = false, receive = true) {
  const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, items.length));
  mesh.count = items.length;
  const colored = items.some(i => i.c);
  items.forEach((it, i) => {
    const r = typeof it.r === 'number' ? [0, it.r, 0] : it.r || [0, 0, 0];
    const s = typeof it.s === 'number' ? [it.s, it.s, it.s] : it.s || [1, 1, 1];
    if (it.q) _q.copy(it.q);
    else _q.setFromEuler(_e.set(r[0], r[1], r[2]));
    _v.set(it.p[0], it.p[1], it.p[2]);
    _s.set(s[0], s[1], s[2]);
    _m.compose(_v, _q, _s);
    mesh.setMatrixAt(i, _m);
    if (colored) mesh.setColorAt(i, _c.set(it.c || '#ffffff'));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  mesh.computeBoundingSphere();
  return mesh;
}

/**
 * Instanced mesh rebuilt only when `k` changes (callers encode seed/time/layout in it). Use a
 * white material (envMaterial('#ffffff') / flat('#ffffff')): per-instance `c` tints it.
 */
export const Instances: React.FC<{ geo: THREE.BufferGeometry; mat: THREE.Material; items: () => Inst[]; k: string; cast?: boolean; receive?: boolean }> = ({ geo, mat, items, k, cast, receive = true }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mesh = useMemo(() => buildInstanced(geo, mat, items(), cast, receive), [geo, mat, k, cast, receive]);
  useEffect(() => () => { mesh.dispose(); }, [mesh]);
  return <primitive object={mesh} />;
};

// ---------------------------------------------------------------------------------------
// Windows on big facades (instanced: one lit + one unlit mesh per call site)
// ---------------------------------------------------------------------------------------
export type Facade = {
  x: number; z: number; ry: number; // facade centre (on the wall plane) and facing (0 = +z)
  w: number; h: number; y0: number; // facade width, top height, first window row height
  floor?: number; col?: number; ww?: number; wh?: number; off?: number;
  wall: string; seed: number;
};

/** Push window rects for a facade into lit/unlit lists. `litFrac` 0 = all dark glass. */
export function facadeWindows(f: Facade, litFrac: number, lit: Inst[], dark: Inst[], dayGlass = '#8fa9c4') {
  const floor = f.floor ?? 3.2, col = f.col ?? 2.2, ww = f.ww ?? 1.2, wh = f.wh ?? 1.7, off = f.off ?? 0.03;
  const cols = Math.max(1, Math.floor((f.w - 0.8) / col));
  const rows = Math.max(0, Math.floor((f.h - f.y0 - 0.8) / floor) + 1);
  let s = (Math.abs(f.seed) * 9301 + 49297) % 233280;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const cos = Math.cos(f.ry), sin = Math.sin(f.ry);
  const glass = mix(f.wall, dayGlass, 0.6);
  const unlitNight = mix(f.wall, '#1a1c2c', 0.55);
  for (let i = 0; i < rows; i++) {
    const y = f.y0 + i * floor + wh / 2;
    if (y + wh / 2 > f.h - 0.4) break;
    for (let j = 0; j < cols; j++) {
      const u = -((cols - 1) * col) / 2 + j * col; // along the facade
      const px = f.x + u * cos + off * sin, pz = f.z - u * sin + off * cos;
      const on = rand() < litFrac;
      const tone = rand();
      if (on) lit.push({ p: [px, y, pz], s: [ww, wh, 1], r: f.ry, c: tone < 0.78 ? (tone < 0.4 ? '#ffd27e' : '#ffe2a6') : '#cfe6ff' });
      else dark.push({ p: [px, y, pz], s: [ww, wh, 1], r: f.ry, c: litFrac > 0 ? unlitNight : mix(glass, '#ffffff', tone * 0.12) });
    }
  }
}

/** `fogLit: false` keeps lit windows bright through fog (a far skyline at night reads as city lights). */
export const WindowSet: React.FC<{ lit: Inst[]; dark: Inst[]; k: string; fogLit?: boolean }> = ({ lit, dark, k, fogLit = true }) => (
  <>
    {lit.length > 0 && <Instances geo={G.plane} mat={fogLit ? flat('#ffffff') : skyFlat('#ffffff')} items={() => lit} k={'L' + k} receive={false} />}
    {dark.length > 0 && <Instances geo={G.plane} mat={envMaterial('#ffffff')} items={() => dark} k={'D' + k} />}
  </>
);

// ---------------------------------------------------------------------------------------
// Materials with a texture map (painted field text, posters) — cached by texture.
// ---------------------------------------------------------------------------------------
const mapMats = new Map<string, THREE.Material>();
/** Toon material (3 bands, like envMaterial) carrying a texture; cached per texture uuid. `cutout`
 *  uses the texture alpha as a mask (painted numbers/letters on the ground). */
export function mapMaterial(tex: THREE.Texture, transparent = false, cutout = false): THREE.Material {
  const key = tex.uuid + (transparent ? 't' : '') + (cutout ? 'c' : '');
  let m = mapMats.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({
      map: tex, gradientMap: toonGradient([110, 190, 255]), transparent, depthWrite: !transparent,
      alphaTest: cutout ? 0.5 : 0, polygonOffset: cutout, polygonOffsetFactor: -2, polygonOffsetUnits: -6,
    });
    mapMats.set(key, m);
  }
  return m;
}

/** Ground paint (road lines, field lines): toon colour with a depth offset so it never z-fights the
 *  surface it lies on, even 100 m away. Cached per colour. */
export function decalMaterial(color: string): THREE.Material {
  const key = 'decal|' + color;
  let m = mapMats.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: toonGradient([110, 190, 255]), polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 });
    mapMats.set(key, m);
  }
  return m;
}

/** Unlit material that ignores fog (moon, far glows). */
const noFog = new Map<string, THREE.MeshBasicMaterial>();
export function skyFlat(color: string, opacity = 1): THREE.MeshBasicMaterial {
  const key = color + opacity;
  let m = noFog.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, fog: false, toneMapped: false, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
    noFog.set(key, m);
  }
  return m;
}

// ---------------------------------------------------------------------------------------
// Street furniture
// ---------------------------------------------------------------------------------------
export const blob = new THREE.SphereGeometry(1, 28, 18);

// Traffic cone: orange cone with a white reflective band on a black square base.
const CONE_H = 0.72, CONE_R = 0.19;
const coneGeo = new THREE.ConeGeometry(CONE_R, CONE_H, 18);
const bandAt = (y0: number, y1: number) => {
  const r = (y: number) => CONE_R * (1 - y / CONE_H) + 0.006;
  const g = new THREE.CylinderGeometry(r(y1), r(y0), y1 - y0, 18, 1, true);
  return g;
};
const coneBand1 = bandAt(0.3, 0.42);
const coneBand2 = bandAt(0.5, 0.57);

export const TrafficCone: React.FC<{ p: Vec3; r?: number; s?: number; tipped?: boolean }> = ({ p, r = 0, s = 1, tipped }) => (
  <At p={p} r={tipped ? [Math.PI / 2, r, 0] : r} s={s}>
    <Box p={[0, 0.025, 0]} s={[0.5, 0.05, 0.5]} c="#24252c" />
    <mesh geometry={coneGeo} material={envMaterial('#f46a1f')} position={[0, 0.05 + CONE_H / 2, 0]} castShadow receiveShadow />
    <mesh geometry={coneBand1} material={envMaterial('#f6f3ec')} position={[0, 0.05 + 0.36, 0]} />
    <mesh geometry={coneBand2} material={envMaterial('#f6f3ec')} position={[0, 0.05 + 0.535, 0]} />
  </At>
);

/** Park bench (seat height 0.45, faces +z). */
export const Bench: React.FC<{ p: Vec3; r?: number; c?: string; len?: number }> = ({ p, r = 0, c = '#b5703f', len = 1.8 }) => {
  const metal = '#2d2f38';
  return (
    <At p={p} r={r}>
      {[0.1, -0.06, -0.22].map((z, i) => <Box key={i} p={[0, 0.45, z + 0.06]} s={[len, 0.05, 0.13]} c={c} />)}
      {[0.66, 0.84].map((y, i) => <Box key={i} p={[0, y, -0.25]} r={[-0.12, 0, 0]} s={[len, 0.12, 0.04]} c={c} />)}
      {[-1, 1].map(sd => (
        <At key={sd} p={[sd * (len / 2 - 0.15), 0, 0]}>
          <Box p={[0, 0.22, 0.12]} s={[0.06, 0.44, 0.06]} c={metal} />
          <Box p={[0, 0.5, -0.24]} s={[0.06, 1.0, 0.06]} c={metal} />
          <Box p={[0, 0.42, -0.04]} s={[0.06, 0.05, 0.42]} c={metal} />
          <Box p={[0, 0.66, 0.0]} s={[0.07, 0.05, 0.34]} c={metal} />
        </At>
      ))}
    </At>
  );
};

/** Soft pool of lamp light on the ground (radial-gradient decal, additive). Sits just above `p`. */
export const LightPool: React.FC<{ p: Vec3; rx?: number; rz?: number; c?: string; o?: number }> = ({ p, rx = 2.6, rz, c = '#ffcf8a', o = 0.32 }) => (
  <mesh geometry={G.plane} material={poolMaterial(c, o)} position={[p[0], p[1] + 0.008, p[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[rx * 2, (rz ?? rx) * 2, 1]} renderOrder={2} />
);

// Soft radial glow sprite (always faces the camera). Additive, so it only brightens.
let glowTex: THREE.CanvasTexture | null = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.18, 'rgba(255,255,255,0.75)');
  grd.addColorStop(0.45, 'rgba(255,255,255,0.22)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}
const glowMats = new Map<string, THREE.SpriteMaterial>();
const poolMats = new Map<string, THREE.MeshBasicMaterial>();
export function poolMaterial(color: string, opacity: number) {
  const key = `${color}|${opacity}`;
  let m = poolMats.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({
      map: glowTexture(), color, opacity, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
      polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    });
    poolMats.set(key, m);
  }
  return m;
}
export function glowMaterial(color: string, opacity = 0.6, fog = true) {
  const key = `${color}|${opacity}|${fog}`;
  let m = glowMats.get(key);
  if (!m) {
    m = new THREE.SpriteMaterial({ map: glowTexture(), color, opacity, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog });
    glowMats.set(key, m);
  }
  return m;
}

/** Glow halo around a bulb (camera-facing additive sprite). `r` = radius in metres. */
export const Halo: React.FC<{ p: Vec3; r?: number; c?: string; o?: number }> = ({ p, r = 0.5, c = '#ffe3a8', o = 0.55 }) => (
  <sprite material={glowMaterial(c, o)} position={p} scale={[r * 2, r * 2, 1]} renderOrder={6} />
);

/** Downtown street light: 6.6 m pole, arm reaching +z over the road. `pools`: [x, y, z, rx, rz] in local
 *  coords (default one pool under the head). */
export const CityLamp: React.FC<{ p: Vec3; r?: number; on?: boolean; pools?: [number, number, number, number, number][] }> = ({ p, r = 0, on, pools = [[0, 0, 1.55, 3.2, 3.2]] }) => {
  const dark = '#2a2d36';
  return (
    <At p={p} r={r}>
      <Cyl p={[0, 0.25, 0]} s={[0.14, 0.5, 0.14]} c={dark} seg8 />
      <Cyl p={[0, 3.3, 0]} s={[0.07, 6.6, 0.07]} c={dark} seg8 />
      <Box p={[0, 6.55, 0.75]} s={[0.09, 0.09, 1.6]} c={dark} />
      <Box p={[0, 6.48, 1.55]} s={[0.36, 0.14, 0.62]} c={dark} />
      <Box p={[0, 6.4, 1.55]} s={[0.28, 0.03, 0.5]} c={on ? '#fff0c8' : '#d4d0c6'} glow={on} />
      {on && <Halo p={[0, 6.32, 1.55]} r={1.1} />}
      {on && pools.map(([x, y, z, rx, rz], i) => <LightPool key={i} p={[x, y, z]} rx={rx} rz={rz} />)}
    </At>
  );
};

/** Park lamp: slim black post with a globe. */
export const ParkLamp: React.FC<{ p: Vec3; on?: boolean; pool?: boolean }> = ({ p, on, pool = true }) => (
  <At p={p}>
    <Cyl p={[0, 0.2, 0]} s={[0.11, 0.4, 0.11]} c="#22252c" seg8 />
    <Cyl p={[0, 1.8, 0]} s={[0.05, 3.2, 0.05]} c="#22252c" seg8 />
    <Cyl p={[0, 3.42, 0]} s={[0.12, 0.08, 0.12]} c="#22252c" seg8 />
    <Ball p={[0, 3.64, 0]} s={0.22} c={on ? '#fff1cf' : '#f3efe4'} glow={on} />
    <Cyl p={[0, 3.88, 0]} s={[0.08, 0.06, 0.08]} c="#22252c" seg8 />
    {on && <Halo p={[0, 3.64, 0]} r={0.9} />}
    {on && pool && <LightPool p={[0, p[1] * 0, 0]} rx={2.4} />}
  </At>
);

export const Hydrant: React.FC<{ p: Vec3; c?: string }> = ({ p, c = '#d23b2f' }) => (
  <At p={p}>
    <Cyl p={[0, 0.3, 0]} s={[0.13, 0.6, 0.13]} c={c} />
    <Ball p={[0, 0.6, 0]} s={[0.14, 0.1, 0.14]} c={c} />
    <Cyl p={[0, 0.42, 0]} r={[0, 0, Math.PI / 2]} s={[0.06, 0.38, 0.06]} c={c} />
    <Cyl p={[0, 0.06, 0]} s={[0.17, 0.08, 0.17]} c={mix(c, '#000', 0.25)} />
  </At>
);

export const TrashCan: React.FC<{ p: Vec3; c?: string }> = ({ p, c = '#3f6f5a' }) => (
  <At p={p}>
    <Cyl p={[0, 0.45, 0]} s={[0.3, 0.9, 0.3]} c={c} />
    <Cyl p={[0, 0.93, 0]} s={[0.33, 0.08, 0.33]} c={mix(c, '#000', 0.25)} />
  </At>
);

/** Traffic signal: pole at the kerb, arm reaching +z over the road, signal head facing -x (towards
 *  oncoming traffic), pedestrian signal facing +z (across the crossing). */
export const TrafficLight: React.FC<{ p: Vec3; r?: number; state?: 'red' | 'amber' | 'green'; arm?: number }> = ({ p, r = 0, state = 'red', arm = 3.2 }) => {
  const dark = '#23252c';
  const lamp = (k: 'red' | 'amber' | 'green', y: number, col: string) => (
    <mesh geometry={G.circle} material={state === k ? flat(col) : envMaterial(mix(col, '#20222a', 0.75))} position={[0, y, 0.165]} scale={0.12} />
  );
  const ly = state === 'red' ? 0.34 : state === 'amber' ? 0 : -0.34;
  const lc = state === 'red' ? '#ff6a50' : state === 'amber' ? '#ffc060' : '#70ffa8';
  return (
    <At p={p} r={r}>
      <Cyl p={[0, 2.75, 0]} s={[0.075, 5.5, 0.075]} c={dark} seg8 />
      <Box p={[0, 5.3, arm / 2]} s={[0.1, 0.1, arm]} c={dark} />
      <At p={[0, 4.7, arm - 0.1]} r={-Math.PI / 2}>
        <Box s={[0.4, 1.12, 0.3]} c={dark} />
        <Box p={[0, 0, -0.17]} s={[0.56, 1.3, 0.04]} c={dark} />
        {lamp('red', 0.34, '#ff4a3a')}
        {lamp('amber', 0, '#ffb43a')}
        {lamp('green', -0.34, '#4af08a')}
        <Halo p={[0, ly, 0.2]} r={0.4} c={lc} o={0.5} />
      </At>
      <Box p={[0, 5.3 - 0.6, 0.0]} s={[0.12, 1.2, 0.12]} c={dark} />
      {/* pedestrian signal */}
      <Box p={[0, 2.6, 0.14]} s={[0.32, 0.34, 0.2]} c={dark} />
      <mesh geometry={G.plane} material={flat(state === 'red' ? '#7ff0ff' : '#ff8a3a')} position={[0, 2.6, 0.242]} scale={[0.22, 0.22, 1]} />
    </At>
  );
};

/** Square planter with a city tree (round crown). */
export const PlanterTree: React.FC<{ p: Vec3; s?: number; leaf?: string }> = ({ p, s = 1, leaf = '#5aa54a' }) => (
  <At p={p} s={s}>
    <Box p={[0, 0.06, 0]} s={[1.3, 0.12, 1.3]} c="#9c958a" />
    <Box p={[0, 0.125, 0]} s={[1.1, 0.01, 1.1]} c="#5b4636" shadow={false} />
    <Cyl p={[0, 1.4, 0]} s={[0.12, 2.8, 0.12]} c="#6b4a35" seg8 />
    <mesh geometry={blob} material={envMaterial(leaf)} position={[0, 3.6, 0]} scale={[1.35, 1.25, 1.35]} castShadow receiveShadow />
    <mesh geometry={blob} material={envMaterial(mix(leaf, '#ffffff', 0.06))} position={[0.5, 3.15, 0.3]} scale={0.75} castShadow receiveShadow />
    <mesh geometry={blob} material={envMaterial(mix(leaf, '#000000', 0.06))} position={[-0.55, 3.25, -0.2]} scale={0.8} castShadow receiveShadow />
  </At>
);

/** Blue "P" parking sign on a post. */
export const ParkingSign: React.FC<{ p: Vec3; r?: number }> = ({ p, r = 0 }) => (
  <At p={p} r={r}>
    <Cyl p={[0, 1.3, 0]} s={[0.04, 2.6, 0.04]} c="#5c6070" seg8 />
    <Box p={[0, 2.5, -0.025]} s={[0.66, 0.66, 0.03]} c="#e9eef5" />
    <Sign p={[0, 2.5, 0.0]} w={0.58} h={0.58} text="P" bg="#2d63b8" fg="#ffffff" glow={false} />
  </At>
);
