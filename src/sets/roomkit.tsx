// Shared building blocks for the indoor sets (home, bedroom, classroom, cafeteria, void).
// Owned by the indoor-sets builder. Rooms are "dollhouses": every wall is a one-sided plane facing
// into the room, so a camera outside any wall (usually the open +z side) sees straight in, and the
// sun (a directional light from outside) passes through walls/ceiling: only furniture casts shadows.
// Repeated geometry (tiles, planks, desks, extras) is merged once per colour with `Batched`.
import React from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Vec3 } from '../types';
import { envMaterial, flat, inkMaterial, toonGradient } from '../engine/materials';
import { At, Box, Cyl, G, Plane, rng, mix } from './kit';
import { PALETTES } from './look';

type R = Vec3 | number;
const rotV = (r?: R): Vec3 => (typeof r === 'number' ? [0, r, 0] : r || [0, 0, 0]);
const sclV = (s?: Vec3 | number): Vec3 => (typeof s === 'number' ? [s, s, s] : s || [1, 1, 1]);

export const SEMI = new THREE.CircleGeometry(1, 24, 0, Math.PI);
const TEMPL = {
  box: G.box, cyl: G.cyl, cyl8: G.cyl8, sphere: G.sphere, ico: G.ico, cone: G.cone, cone4: G.cone4,
  plane: G.plane, circle: G.circle, semi: SEMI,
} as const;
export type Shape = keyof typeof TEMPL;
type Kind = 'env' | 'glow' | 'ink';
type AddOpts = { kind?: Kind; cast?: boolean };
type BatchMesh = { geo: THREE.BufferGeometry; kind: Kind; c: string; cast: boolean };

const mtx = (p: Vec3, r?: R, s?: Vec3 | number) =>
  new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotV(r))), new THREE.Vector3(...sclV(s)));

/** Collects primitives and merges them into one geometry per (colour, material kind, cast flag). */
export class Batch {
  private groups = new Map<string, { kind: Kind; c: string; cast: boolean; geos: THREE.BufferGeometry[] }>();
  private stack: THREE.Matrix4[] = [new THREE.Matrix4()];
  private top() {
    return this.stack[this.stack.length - 1];
  }
  /** Run `fn` inside a local transform (position, yaw or euler, scale). */
  at(p: Vec3, r: R | undefined, fn: () => void, s?: Vec3 | number) {
    this.stack.push(this.top().clone().multiply(mtx(p, r, s)));
    fn();
    this.stack.pop();
  }
  add(shape: Shape, c: string, p: Vec3, s: Vec3 | number, r?: R, o: AddOpts = {}) {
    const kind = o.kind ?? 'env';
    const cast = kind === 'glow' ? false : o.cast ?? true;
    const key = `${kind}|${c}|${cast}`;
    let g = this.groups.get(key);
    if (!g) {
      g = { kind, c, cast, geos: [] };
      this.groups.set(key, g);
    }
    g.geos.push(TEMPL[shape].clone().applyMatrix4(this.top().clone().multiply(mtx(p, r, s))));
  }
  box(p: Vec3, s: Vec3, c: string, r?: R, o?: AddOpts) {
    this.add('box', c, p, s, r, o);
  }
  /** Box given by its min/max corners (handy for architecture). */
  span(a: Vec3, b: Vec3, c: string, o?: AddOpts) {
    this.add('box', c, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2])], 0, o);
  }
  /** Cylinder/stick between two points. */
  stick(a: Vec3, b: Vec3, rad: number, c: string, o?: AddOpts, seg8 = true) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const d = vb.clone().sub(va);
    const len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    const e = new THREE.Euler().setFromQuaternion(q);
    const mid = va.add(vb).multiplyScalar(0.5);
    this.add(seg8 ? 'cyl8' : 'cyl', c, [mid.x, mid.y, mid.z], [rad, len, rad], [e.x, e.y, e.z], o);
  }
  done(): BatchMesh[] {
    const out: BatchMesh[] = [];
    this.groups.forEach(g => {
      const geo = mergeGeometries(g.geos, false);
      g.geos.forEach(x => x.dispose());
      if (geo) out.push({ geo, kind: g.kind, c: g.c, cast: g.cast });
    });
    return out;
  }
}

const batchCache = new Map<string, BatchMesh[]>();
/** Static merged geometry, built once per `id` (include anything the build depends on in the id). */
export const Batched: React.FC<{ id: string; build: (b: Batch) => void }> = ({ id, build }) => {
  let meshes = batchCache.get(id);
  if (!meshes) {
    const b = new Batch();
    build(b);
    meshes = b.done();
    batchCache.set(id, meshes);
  }
  return (
    <>
      {meshes.map((m, i) => (
        <mesh key={i} geometry={m.geo} material={m.kind === 'glow' ? flat(m.c) : m.kind === 'ink' ? inkMaterial() : envMaterial(m.c)} castShadow={m.cast} receiveShadow={m.kind !== 'glow'} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------------------------------
// Floors
// ---------------------------------------------------------------------------------------

const FLAT: Vec3 = [-Math.PI / 2, 0, 0];

/** Checkerboard floor tiles (no overlap, so no z-fighting). */
export function checkerFloor(b: Batch, x0: number, x1: number, z0: number, z1: number, size: number, cA: string, cB: string, y = 0) {
  for (let i = 0, x = x0; x < x1 - 1e-4; i++, x += size)
    for (let j = 0, z = z0; z < z1 - 1e-4; j++, z += size) {
      const w = Math.min(size, x1 - x), d = Math.min(size, z1 - z);
      b.add('plane', (i + j) % 2 ? cB : cA, [x + w / 2, y, z + d / 2], [w, d, 1], FLAT, { cast: false });
    }
}

/** Wooden planks running along z, staggered, a few tones. */
export function plankFloor(b: Batch, x0: number, x1: number, z0: number, z1: number, pw: number, tones: string[], seed = 1, y = 0) {
  const rand = rng(seed);
  for (let x = x0; x < x1 - 1e-4; x += pw) {
    const w = Math.min(pw, x1 - x);
    let z = z0 - rand() * 1.6;
    while (z < z1) {
      const len = 1.4 + rand() * 1.4;
      const za = Math.max(z, z0), zb = Math.min(z + len, z1);
      if (zb > za + 1e-4) b.add('plane', tones[Math.floor(rand() * tones.length)], [x + w / 2, y, (za + zb) / 2], [w - 0.008, zb - za - 0.008, 1], FLAT, { cast: false });
      z += len;
    }
  }
  // seam colour underneath the plank gaps
  b.add('plane', mix(tones[0], '#000000', 0.35), [(x0 + x1) / 2, y - 0.002, (z0 + z1) / 2], [x1 - x0, z1 - z0, 1], FLAT, { cast: false });
}

// ---------------------------------------------------------------------------------------
// Room shell
// ---------------------------------------------------------------------------------------

type WallProps = { len: number; h: number; c: string; lower?: string; railY?: number; rail?: string; base?: string; thin?: boolean };
const Wall: React.FC<WallProps & { p: Vec3; r: number }> = ({ p, r, len, h, c, lower, railY = 1.0, rail, base, thin }) => (
  <At p={p} r={r}>
    {lower ? (
      <>
        <Plane p={[0, railY / 2, 0]} s={[len, railY, 1]} c={lower} />
        <Plane p={[0, railY + (h - railY) / 2, 0]} s={[len, h - railY, 1]} c={c} />
      </>
    ) : (
      <Plane p={[0, h / 2, 0]} s={[len, h, 1]} c={c} />
    )}
    {base && (thin ? <Plane p={[0, 0.07, 0.006]} s={[len, 0.14, 1]} c={base} /> : <Box p={[0, 0.07, 0.016]} s={[len, 0.14, 0.032]} c={base} shadow={false} />)}
    {rail && lower && (thin ? <Plane p={[0, railY, 0.006]} s={[len, 0.07, 1]} c={rail} /> : <Box p={[0, railY, 0.02]} s={[len, 0.07, 0.04]} c={rail} shadow={false} />)}
  </At>
);

export type ShellProps = {
  x0: number; x1: number; z0: number; z1: number; h: number;
  wall: string; lower?: string; railY?: number; rail?: string; base?: string;
  ceiling: string; ceilingEmissive?: string;
  back?: string; left?: string; right?: string; // per-wall upper colour overrides
  fourth?: boolean; // one-sided wall at z1, visible only from inside (reverse shots)
};

/** Four inward-facing walls + ceiling. Floors are drawn by each set. */
export const Shell: React.FC<ShellProps> = o => {
  const W = o.x1 - o.x0, D = o.z1 - o.z0, cx = (o.x0 + o.x1) / 2, cz = (o.z0 + o.z1) / 2;
  const common = { h: o.h, lower: o.lower, railY: o.railY, rail: o.rail, base: o.base };
  return (
    <>
      <Wall p={[cx, 0, o.z0]} r={0} len={W} c={o.back ?? o.wall} {...common} />
      <Wall p={[o.x0, 0, cz]} r={Math.PI / 2} len={D} c={o.left ?? o.wall} {...common} />
      <Wall p={[o.x1, 0, cz]} r={-Math.PI / 2} len={D} c={o.right ?? o.wall} {...common} />
      {o.fourth && <Wall p={[cx, 0, o.z1]} r={Math.PI} len={W} c={o.wall} {...common} thin />}
      <mesh geometry={G.plane} material={envMaterial(o.ceiling, o.ceilingEmissive)} position={[cx, o.h, cz]} rotation={[Math.PI / 2, 0, 0]} scale={[W, D, 1]} receiveShadow />
    </>
  );
};

// ---------------------------------------------------------------------------------------
// Windows with a painted view (unlit, so they glow like daylight)
// ---------------------------------------------------------------------------------------

export const isNight = (time: string) => !!PALETTES[time]?.windowsLit && time !== 'void';

const viewTexCache = new Map<string, THREE.CanvasTexture>();
function viewTexture(night: boolean, seed: number) {
  const key = `${night}|${seed}`;
  const hit = viewTexCache.get(key);
  if (hit) return hit;
  const W = 512, H = 384;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d')!;
  const rand = rng(seed * 17 + 5);
  const sky = g.createLinearGradient(0, 0, 0, H);
  if (night) {
    sky.addColorStop(0, '#0b1433');
    sky.addColorStop(1, '#2b3f73');
  } else {
    sky.addColorStop(0, '#7db4e6');
    sky.addColorStop(0.75, '#d6ecf7');
    sky.addColorStop(1, '#e8f4f8');
  }
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  const blob = (x: number, y: number, rx: number, ry: number, c: string) => {
    g.fillStyle = c;
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    g.fill();
  };
  if (night) {
    for (let i = 0; i < 40; i++) blob(rand() * W, rand() * H * 0.6, 1.3, 1.3, '#dfe6ff');
    blob(W * (0.2 + rand() * 0.6), H * 0.18, 18, 18, '#f3efd9');
  } else {
    for (let i = 0; i < 3; i++) {
      const x = rand() * W, y = 40 + rand() * 90;
      blob(x, y, 46, 16, '#ffffff');
      blob(x + 30, y - 8, 30, 16, '#ffffff');
    }
  }
  // distant hills, trees, hedge
  const hill = night ? '#1b2a4c' : '#a9cf8c';
  const tree = night ? '#15213d' : '#5aa54a';
  const tree2 = night ? '#121c34' : '#4a9441';
  const hedge = night ? '#101830' : '#4e9a45';
  blob(W * 0.25, H * 0.86, W * 0.45, H * 0.2, hill);
  blob(W * 0.8, H * 0.88, W * 0.4, H * 0.17, hill);
  if (!night) {
    // a house roof peeking over the hedge
    const hx = W * (0.25 + rand() * 0.5);
    g.fillStyle = '#e8c9a0';
    g.fillRect(hx - 60, H * 0.62, 120, 80);
    g.fillStyle = '#8e5b4c';
    g.beginPath();
    g.moveTo(hx - 74, H * 0.63);
    g.lineTo(hx, H * 0.48);
    g.lineTo(hx + 74, H * 0.63);
    g.fill();
    g.fillStyle = '#b9d4e6';
    g.fillRect(hx - 40, H * 0.68, 26, 22);
    g.fillRect(hx + 14, H * 0.68, 26, 22);
  }
  for (let i = 0; i < 4; i++) {
    const x = (i + 0.3 + rand() * 0.4) * (W / 4);
    const s = 0.8 + rand() * 0.5;
    g.fillStyle = night ? '#0e1529' : '#6b4a35';
    g.fillRect(x - 5 * s, H * 0.7, 10 * s, H * 0.2);
    blob(x, H * 0.62 - 10 * s, 48 * s, 52 * s, i % 2 ? tree : tree2);
  }
  g.fillStyle = hedge;
  g.fillRect(0, H * 0.84, W, H * 0.16);
  for (let x = 0; x < W + 40; x += 40) blob(x, H * 0.85, 26, 16, hedge);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  viewTexCache.set(key, tex);
  return tex;
}

const viewMatCache = new Map<string, THREE.MeshBasicMaterial>();
export function viewMaterial(night: boolean, seed = 1) {
  const key = `${night}|${seed % 4}`;
  let m = viewMatCache.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ map: viewTexture(night, seed % 4), toneMapped: false });
    viewMatCache.set(key, m);
  }
  return m;
}

/** Window on a wall. Local +z points into the room; `p` is the pane centre on the wall plane. */
export const RoomWindow: React.FC<{
  p: Vec3; r?: number; w: number; h: number; frame?: string; night?: boolean; seed?: number; cols?: number; cross?: boolean;
  sill?: boolean; curtain?: string; blinds?: boolean;
}> = ({ p, r = 0, w, h, frame = '#f4f0e8', night = false, seed = 1, cols = 2, cross = true, sill = true, curtain }) => {
  const t = 0.07;
  return (
    <At p={p} r={r}>
      <mesh geometry={G.plane} material={viewMaterial(night, seed)} position={[0, 0, 0.008]} scale={[w, h, 1]} />
      <Box p={[0, h / 2 + t / 2, 0.05]} s={[w + 2 * t, t, 0.1]} c={frame} />
      <Box p={[0, -h / 2 - t / 2, 0.05]} s={[w + 2 * t, t, 0.1]} c={frame} />
      <Box p={[-w / 2 - t / 2, 0, 0.05]} s={[t, h, 0.1]} c={frame} />
      <Box p={[w / 2 + t / 2, 0, 0.05]} s={[t, h, 0.1]} c={frame} />
      {Array.from({ length: cols - 1 }, (_, i) => (
        <Box key={i} p={[-w / 2 + ((i + 1) * w) / cols, 0, 0.03]} s={[0.045, h, 0.05]} c={frame} />
      ))}
      {cross && <Box p={[0, h * 0.12, 0.03]} s={[w, 0.045, 0.05]} c={frame} />}
      {sill && <Box p={[0, -h / 2 - t - 0.02, 0.1]} s={[w + 0.3, 0.05, 0.2]} c={frame} />}
      {curtain && (
        <>
          <Cyl p={[0, h / 2 + 0.2, 0.16]} r={[0, 0, Math.PI / 2]} s={[0.02, w + 1.1, 0.02]} c="#3a3438" />
          {[-1, 1].map(sd => (
            <group key={sd}>
              <Box p={[sd * (w / 2 + 0.22), -0.08, 0.16]} s={[0.4, h + 0.55, 0.07]} c={curtain} />
              <Box p={[sd * (w / 2 + 0.1), -0.08, 0.2]} s={[0.12, h + 0.55, 0.05]} c={mix(curtain, '#000000', 0.12)} />
              <Box p={[sd * (w / 2 + 0.34), -0.08, 0.2]} s={[0.12, h + 0.55, 0.05]} c={mix(curtain, '#ffffff', 0.12)} />
            </group>
          ))}
        </>
      )}
    </At>
  );
};

// ---------------------------------------------------------------------------------------
// Painted (canvas-textured) surfaces: boards, posters, menus. Cached per id.
// ---------------------------------------------------------------------------------------

type Draw = (g: CanvasRenderingContext2D, W: number, H: number) => void;
const paintCache = new Map<string, THREE.Material>();
export function paintedMaterial(id: string, W: number, H: number, draw: Draw, lit = true): THREE.Material {
  const key = `${id}|${lit}`;
  let m = paintCache.get(key);
  if (!m) {
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    draw(cv.getContext('2d')!, W, H);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    m = lit ? new THREE.MeshToonMaterial({ map: tex, gradientMap: toonGradient([110, 190, 255]) }) : new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    paintCache.set(key, m);
  }
  return m;
}

/** A plane showing a canvas drawing (`px` = canvas pixels per metre). Local +z faces out. */
export const Painted: React.FC<{ id: string; p: Vec3; r?: R; w: number; h: number; px?: number; draw: Draw; lit?: boolean }> = ({ id, p, r, w, h, px = 256, draw, lit = true }) => (
  <mesh geometry={G.plane} material={paintedMaterial(id, Math.round(w * px), Math.round(h * px), draw, lit)} position={p} rotation={rotV(r)} scale={[w, h, 1]} receiveShadow={lit} />
);

export const HAND_FONT = '"Comic Sans MS", "Segoe Print", "Chalkboard SE", cursive';
export const BOLD_FONT = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';

// ---------------------------------------------------------------------------------------
// Wall decor
// ---------------------------------------------------------------------------------------

/** Framed picture. Local +z out of the wall. */
export const Picture: React.FC<{ p: Vec3; r?: number; w: number; h: number; frame?: string; art?: 'abstract' | 'landscape' | 'dots' | 'sun'; bg?: string; seed?: number }> = ({
  p, r = 0, w, h, frame = '#2a2b33', art = 'abstract', bg, seed = 1,
}) => {
  const rand = rng(seed * 11 + 3);
  const iw = w - 0.1, ih = h - 0.1;
  const z = 0.036;
  const C = (x: number, y: number, rad: number, c: string, k: number) => (
    <mesh key={k} geometry={G.circle} material={envMaterial(c)} position={[x * iw, y * ih, z + 0.004 * (k + 1)]} scale={rad * Math.min(iw, ih)} receiveShadow />
  );
  const S = (x: number, y: number, rad: number, c: string, k: number) => (
    <mesh key={k} geometry={SEMI} material={envMaterial(c)} position={[x * iw, y * ih, z + 0.004 * (k + 1)]} scale={[rad * iw, rad * iw * 0.7, 1]} receiveShadow />
  );
  let shapes: React.ReactNode[] = [];
  let back = bg;
  if (art === 'abstract') {
    back = back ?? '#22232c';
    const cols = ['#e2483d', '#f2b632', '#f4efe2', '#3d8fd6', '#e46f8e'];
    const o = Math.floor(rand() * cols.length);
    shapes = [C(-0.12 + rand() * 0.1, 0.12, 0.26, cols[o], 0), C(0.15, -0.1 - rand() * 0.1, 0.18, cols[(o + 1) % 5], 1), C(-0.18, -0.25, 0.1, cols[(o + 2) % 5], 2)];
  } else if (art === 'landscape') {
    back = back ?? '#9fd0ee';
    shapes = [C(0.22, 0.22, 0.12, '#f7d65a', 0), S(-0.2, -0.5, 0.55, '#6cb85a', 1), S(0.3, -0.5, 0.45, '#4f9a45', 2)];
  } else if (art === 'dots') {
    back = back ?? '#f4efe2';
    const cols = ['#e2483d', '#3d6fb6', '#f2b632', '#4e9a6b'];
    shapes = cols.map((c, i) => C(-0.3 + (i % 2) * 0.6 * 0.9, 0.22 - Math.floor(i / 2) * 0.44, 0.15, c, i));
  } else {
    back = back ?? '#f3d9a4';
    shapes = [C(0, 0.05, 0.3, '#e9853d', 0), C(0, 0.05, 0.2, '#f6c04a', 1)];
  }
  return (
    <At p={p} r={r}>
      <Box p={[0, 0, 0.016]} s={[w, h, 0.032]} c={frame} />
      <Plane p={[0, 0, z]} s={[iw, ih, 1]} c={back} />
      {shapes}
    </At>
  );
};

/** Cork pin board with pastel notes (IFOLOGY kitchen). Local +z out of the wall. */
export const Pinboard: React.FC<{ p: Vec3; r?: number; w?: number; h?: number; seed?: number }> = ({ p, r = 0, w = 0.9, h = 0.65, seed = 2 }) => {
  const notes = ['#f2a7b5', '#9fd0ee', '#f7d65a', '#a9d98f', '#f4efe2'];
  const rand = rng(seed);
  return (
    <At p={p} r={r}>
      <Box p={[0, 0, 0.02]} s={[w, h, 0.04]} c="#9a6a42" />
      <Plane p={[0, 0, 0.041]} s={[w - 0.08, h - 0.08, 1]} c="#c99a63" />
      {[0, 1, 2, 3].map(i => {
        const x = (i % 2 ? 0.2 : -0.2) * w + (rand() - 0.5) * 0.06, y = (i < 2 ? 0.17 : -0.15) * h + (rand() - 0.5) * 0.04;
        return (
          <group key={i}>
            <Box p={[x, y, 0.046]} r={[0, 0, (rand() - 0.5) * 0.25]} s={[0.26 * w, 0.32 * h, 0.006]} c={notes[(i + seed) % notes.length]} shadow={false} />
            <Cyl p={[x, y + 0.11 * h, 0.052]} r={[Math.PI / 2, 0, 0]} s={[0.012, 0.01, 0.012]} c="#d9472b" shadow={false} />
          </group>
        );
      })}
    </At>
  );
};

/** Glowing flush ceiling panel (classroom) or round lamp. Sits just under the ceiling at y=h. */
export const CeilingPanel: React.FC<{ p: Vec3; w?: number; d?: number; round?: boolean; frame?: string; lit?: string }> = ({ p, w = 1.2, d = 0.6, round, frame = '#d9dbe0', lit = '#fbfaf4' }) =>
  round ? (
    <At p={p}>
      <Cyl p={[0, -0.03, 0]} s={[w / 2, 0.06, w / 2]} c={frame} shadow={false} />
      <mesh geometry={G.circle} material={flat(lit)} position={[0, -0.061, 0]} rotation={[Math.PI / 2, 0, 0]} scale={w / 2 - 0.04} />
    </At>
  ) : (
    <At p={p}>
      <Box p={[0, -0.025, 0]} s={[w + 0.08, 0.05, d + 0.08]} c={frame} shadow={false} />
      <mesh geometry={G.plane} material={flat(lit)} position={[0, -0.051, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[w, d, 1]} />
    </At>
  );

/** Leafy potted plant (spiky leaves, like IFOLOGY's kitchen plants). */
export const LeafPlant: React.FC<{ p?: Vec3; s?: number; pot?: string; leaf?: string; seed?: number }> = ({ p, s = 1, pot = '#e9e2d4', leaf = '#4e9a45', seed = 1 }) => {
  const rand = rng(seed * 7 + 1);
  const n = 7;
  return (
    <At p={p} s={s}>
      <Cyl p={[0, 0.16, 0]} s={[0.17, 0.32, 0.17]} c={pot} />
      <Cyl p={[0, 0.33, 0]} s={[0.15, 0.02, 0.15]} c="#5b3d2e" shadow={false} />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + rand() * 0.4;
        const tilt = 0.35 + rand() * 0.45;
        const len = 0.42 + rand() * 0.25;
        return (
          <group key={i} position={[0, 0.32, 0]} rotation={[0, a, 0]}>
            <group rotation={[tilt, 0, 0]}>
              <mesh geometry={G.sphere} material={envMaterial(i % 2 ? leaf : mix(leaf, '#ffffff', 0.15))} position={[0, len / 2, 0]} scale={[0.07, len / 2, 0.025]} castShadow receiveShadow />
            </group>
          </group>
        );
      })}
    </At>
  );
};

/** Bowl of fruit for tables and counters. */
export const FruitBowl: React.FC<{ p: Vec3; s?: number }> = ({ p, s = 1 }) => (
  <At p={p} s={s}>
    <Cyl p={[0, 0.04, 0]} s={[0.17, 0.08, 0.17]} c="#f4efe2" />
    <Cyl p={[0, 0.01, 0]} s={[0.1, 0.02, 0.1]} c="#e3dccd" />
    <mesh geometry={G.sphere} material={envMaterial('#f08a24')} position={[-0.06, 0.12, 0.02]} scale={0.065} castShadow receiveShadow />
    <mesh geometry={G.sphere} material={envMaterial('#d9332b')} position={[0.06, 0.12, -0.02]} scale={0.06} castShadow receiveShadow />
    <mesh geometry={G.sphere} material={envMaterial('#9bc53d')} position={[0.0, 0.17, 0.04]} scale={0.058} castShadow receiveShadow />
    <mesh geometry={G.sphere} material={envMaterial('#f2c94c')} position={[0.02, 0.13, -0.08]} rotation-z={0.6} scale={[0.11, 0.035, 0.035]} castShadow receiveShadow />
  </At>
);

/** Low-poly sofa. Faces local +z. Seat top ≈ 0.52 m. */
export const Sofa: React.FC<{ p?: Vec3; r?: number; w?: number; c?: string; pillow?: string }> = ({ p, r = 0, w = 2.2, c = '#3e5c8a', pillow = '#e8b84a' }) => {
  const cu = mix(c, '#ffffff', 0.12);
  const iw = (w - 0.44) / 2 - 0.02;
  return (
    <At p={p} r={r}>
      <Box p={[0, 0.25, 0]} s={[w, 0.3, 0.92]} c={c} />
      <Box p={[0, 0.68, -0.36]} s={[w, 0.66, 0.2]} c={c} />
      {[-1, 1].map(sd => (
        <group key={sd}>
          <Box p={[sd * (w / 2 - 0.11), 0.48, 0.02]} s={[0.22, 0.42, 0.92]} c={c} />
          <Box p={[sd * (iw / 2 + 0.01), 0.46, 0.08]} s={[iw, 0.16, 0.7]} c={cu} />
          <Box p={[sd * (iw / 2 + 0.01), 0.76, -0.2]} r={[-0.14, 0, 0]} s={[iw, 0.44, 0.15]} c={cu} />
          <Cyl p={[sd * (w / 2 - 0.12), 0.05, 0.36]} s={[0.04, 0.1, 0.04]} c="#3a2a22" />
          <Cyl p={[sd * (w / 2 - 0.12), 0.05, -0.36]} s={[0.04, 0.1, 0.04]} c="#3a2a22" />
        </group>
      ))}
      <Box p={[-w / 2 + 0.42, 0.68, -0.08]} r={[-0.2, 0.25, 0.1]} s={[0.36, 0.34, 0.12]} c={pillow} />
      <Box p={[w / 2 - 0.42, 0.68, -0.08]} r={[-0.2, -0.3, -0.08]} s={[0.34, 0.32, 0.12]} c={mix(pillow, '#e2483d', 0.6)} />
    </At>
  );
};

/** Simple floor lamp; `on` makes the shade glow. */
export const FloorLamp: React.FC<{ p: Vec3; on?: boolean; shade?: string }> = ({ p, on, shade = '#f4efe2' }) => (
  <At p={p}>
    <Cyl p={[0, 0.02, 0]} s={[0.17, 0.04, 0.17]} c="#2b2d36" />
    <Cyl p={[0, 0.8, 0]} s={[0.018, 1.56, 0.018]} c="#2b2d36" />
    <Cyl p={[0, 1.66, 0]} s={[0.2, 0.3, 0.2]} c={on ? '#ffe7b0' : shade} glow={on} />
  </At>
);

/** Low-poly seated extra (cheap stickman: merged into a Batch). Faces local +z, chair seat at ~0.47. */
export function seatedExtra(b: Batch, p: Vec3, yaw: number, shirt: string, pants: string, seed: number, armsOnDesk = true, handY = 0.3) {
  const rand = rng(seed * 13 + 7);
  const lean = (rand() - 0.5) * 0.12;
  b.at(p, yaw, () => {
    const hy = 0.5;
    b.box([0, hy + 0.27, -0.02], [0.36, 0.5, 0.22], shirt, [lean * 0.5, 0, 0]);
    b.box([0, hy + 0.04, 0.0], [0.34, 0.1, 0.24], pants);
    const hx = lean * 0.4, hh = hy + 0.73;
    b.add('sphere', '#020203', [hx, hh, 0.0], 0.2, 0, { kind: 'ink' });
    // tiny IFOLOGY face: two vertical eye ovals + a smile, unlit white
    const happy = rand() < 0.5;
    for (const sd of [-1, 1]) {
      b.add('sphere', '#f4f1ea', [hx + sd * 0.045, hh - 0.04, 0.188], happy ? [0.016, 0.008, 0.008] : [0.01, 0.018, 0.008], 0, { kind: 'glow' });
      b.add('sphere', '#f4f1ea', [hx + sd * 0.017, hh - 0.098, 0.176], [0.02, 0.0045, 0.008], [0, 0, sd * 0.35], { kind: 'glow' });
    }
    // legs: thighs forward, shins down
    for (const sd of [-1, 1]) {
      b.stick([sd * 0.09, hy, 0.02], [sd * 0.1, hy + 0.02, 0.42], 0.05, pants);
      b.stick([sd * 0.1, hy + 0.02, 0.42], [sd * 0.1, 0.06, 0.44], 0.025, '#111114');
      b.box([sd * 0.1, 0.04, 0.48], [0.1, 0.08, 0.2], '#f1eee8');
      if (armsOnDesk) {
        b.stick([sd * 0.2, hy + 0.48, -0.02], [sd * 0.22, hy + 0.26, 0.18], 0.035, shirt);
        b.stick([sd * 0.22, hy + 0.26, 0.18], [sd * 0.1, hy + handY, 0.42], 0.02, '#111114');
        b.add('sphere', '#020203', [sd * 0.09, hy + handY, 0.45], 0.03, 0, { kind: 'ink' });
      } else {
        b.stick([sd * 0.2, hy + 0.48, -0.02], [sd * 0.23, hy + 0.22, 0.1], 0.035, shirt);
        b.stick([sd * 0.23, hy + 0.22, 0.1], [sd * 0.15, hy + 0.08, 0.3], 0.02, '#111114');
      }
    }
  });
}

export { rng, mix };
