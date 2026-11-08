// Low-poly building blocks shared by all sets and props. Everything is toon-shaded and
// casts/receives shadows; "glow" colours are unlit (windows at night, screens, bulbs).
import React from 'react';
import * as THREE from 'three';
import type { Vec3 } from '../types';
import { envMaterial, flat, inkMaterial } from '../engine/materials';

export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 20, 14),
  ico: new THREE.IcosahedronGeometry(1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 20),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
  cone: new THREE.ConeGeometry(1, 1, 16),
  cone4: new THREE.ConeGeometry(1, 1, 4),
  plane: new THREE.PlaneGeometry(1, 1),
  circle: new THREE.CircleGeometry(1, 40),
  torus: new THREE.TorusGeometry(1, 0.08, 8, 40),
};

type P = { p?: Vec3; r?: Vec3 | number; s?: Vec3 | number; c: string; glow?: boolean; shadow?: boolean; opacity?: number };
const rot = (r?: Vec3 | number): Vec3 => (typeof r === 'number' ? [0, r, 0] : r || [0, 0, 0]);
const scl = (s?: Vec3 | number): Vec3 => (typeof s === 'number' ? [s, s, s] : s || [1, 1, 1]);
const mat = (c: string, glow?: boolean, opacity?: number) => (glow ? flat(c, opacity ?? 1) : envMaterial(c));

export const Box: React.FC<P> = ({ p, r, s, c, glow, shadow = true, opacity }) => (
  <mesh geometry={G.box} material={mat(c, glow, opacity)} position={p} rotation={rot(r)} scale={scl(s)} castShadow={shadow && !glow} receiveShadow={!glow} />
);
export const Ball: React.FC<P & { ico?: boolean }> = ({ p, r, s, c, glow, shadow = true, ico }) => (
  <mesh geometry={ico ? G.ico : G.sphere} material={mat(c, glow)} position={p} rotation={rot(r)} scale={scl(s)} castShadow={shadow && !glow} receiveShadow={!glow} />
);
export const Cyl: React.FC<P & { seg8?: boolean }> = ({ p, r, s, c, glow, shadow = true, seg8 }) => (
  <mesh geometry={seg8 ? G.cyl8 : G.cyl} material={mat(c, glow)} position={p} rotation={rot(r)} scale={scl(s)} castShadow={shadow && !glow} receiveShadow={!glow} />
);
export const Cone: React.FC<P & { four?: boolean }> = ({ p, r, s, c, glow, shadow = true, four }) => (
  <mesh geometry={four ? G.cone4 : G.cone} material={mat(c, glow)} position={p} rotation={rot(r)} scale={scl(s)} castShadow={shadow && !glow} receiveShadow={!glow} />
);
export const Plane: React.FC<P> = ({ p, r, s, c, glow, opacity }) => (
  <mesh geometry={G.plane} material={mat(c, glow, opacity)} position={p} rotation={rot(r)} scale={scl(s)} receiveShadow={!glow} />
);

/** Translate a whole group. */
export const At: React.FC<{ p?: Vec3; r?: number | Vec3; s?: number | Vec3; children?: React.ReactNode }> = ({ p, r, s, children }) => (
  <group position={p} rotation={rot(r)} scale={scl(s)}>{children}</group>
);

/** Ground plane (large) receiving shadows. */
export const Ground: React.FC<{ c: string; size?: number; y?: number }> = ({ c, size = 400, y = 0 }) => (
  <mesh geometry={G.plane} material={envMaterial(c)} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} scale={[size, size, 1]} receiveShadow />
);

// Deterministic pseudo-random for set dressing.
export function rng(seed: number) {
  let s = (((seed * 9301 + 49297) % 233280) + 233280) % 233280; // JS % keeps the sign: negative seeds gave negative values (undefined colours → white trees)
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function mix(a: string, b: string, k: number) {
  return '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
}

/** Text drawn to a canvas and shown on a plane (signs, posters, screens, boards). */
const texCache = new Map<string, THREE.CanvasTexture>();
export function textTexture(text: string, o: { w?: number; h?: number; bg?: string; fg?: string; font?: string; size?: number } = {}) {
  const key = JSON.stringify([text, o]);
  if (texCache.has(key)) return texCache.get(key)!;
  const W = o.w ?? 512, H = o.h ?? 256;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  if (o.bg) {
    g.fillStyle = o.bg;
    g.fillRect(0, 0, W, H);
  }
  g.fillStyle = o.fg ?? '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const lines = text.split('\n');
  const size = o.size ?? Math.min(H / (lines.length * 1.25), (W * 1.6) / Math.max(...lines.map(l => l.length || 1)));
  g.font = `${o.font ?? '800'} ${size}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
  lines.forEach((l, i) => g.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * size * 1.15));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}

export const Sign: React.FC<{ p?: Vec3; r?: number | Vec3; w: number; h: number; text: string; bg?: string; fg?: string; glow?: boolean }> = ({ p, r, w, h, text, bg = '#1d2333', fg = '#ffffff', glow = true }) => {
  const tex = textTexture(text, { w: Math.round(256 * (w / h)), h: 256, bg, fg });
  return (
    <mesh geometry={G.plane} position={p} rotation={rot(r)} scale={[w, h, 1]}>
      {glow ? <meshBasicMaterial map={tex} toneMapped={false} /> : <meshToonMaterial map={tex} />}
    </mesh>
  );
};

// ---------------------------------------------------------------------------------------
// Furniture & architecture
// ---------------------------------------------------------------------------------------

export const Window: React.FC<{ p?: Vec3; r?: number; w?: number; h?: number; frame?: string; glass: string; lit?: boolean; bars?: number }> = ({ p, r = 0, w = 1.2, h = 1.4, frame = '#e9e2d4', glass, lit = true, bars = 1 }) => (
  <At p={p} r={r}>
    <Plane p={[0, 0, 0.005]} s={[w, h, 1]} c={glass} glow={lit} />
    <Box p={[0, h / 2, 0.03]} s={[w + 0.1, 0.07, 0.06]} c={frame} />
    <Box p={[0, -h / 2, 0.05]} s={[w + 0.16, 0.07, 0.12]} c={frame} />
    <Box p={[-w / 2, 0, 0.03]} s={[0.07, h, 0.06]} c={frame} />
    <Box p={[w / 2, 0, 0.03]} s={[0.07, h, 0.06]} c={frame} />
    {bars >= 1 && <Box p={[0, 0, 0.03]} s={[0.04, h, 0.04]} c={frame} />}
    {bars >= 2 && <Box p={[0, 0, 0.03]} s={[w, 0.04, 0.04]} c={frame} />}
  </At>
);

export const Door: React.FC<{ p?: Vec3; r?: number; c?: string; frame?: string }> = ({ p, r = 0, c = '#8a4b3a', frame = '#e9e2d4' }) => (
  <At p={p} r={r}>
    <Box p={[0, 1.05, 0.02]} s={[0.95, 2.1, 0.05]} c={c} />
    <Box p={[0, 2.14, 0.04]} s={[1.08, 0.08, 0.08]} c={frame} />
    <Box p={[-0.52, 1.07, 0.04]} s={[0.07, 2.14, 0.08]} c={frame} />
    <Box p={[0.52, 1.07, 0.04]} s={[0.07, 2.14, 0.08]} c={frame} />
    <Ball p={[0.34, 1.0, 0.08]} s={0.035} c="#d9b45a" />
  </At>
);

export const Table: React.FC<{ p?: Vec3; r?: number; w?: number; d?: number; h?: number; c?: string; round?: boolean; cloth?: string }> = ({ p, r = 0, w = 1.4, d = 0.8, h = 0.75, c = '#9b6a4a', round, cloth }) => (
  <At p={p} r={r}>
    {round ? (
      <>
        <Cyl p={[0, h, 0]} s={[w / 2, 0.05, w / 2]} c={cloth || c} />
        {cloth && <Cyl p={[0, h - 0.2, 0]} s={[w / 2 + 0.01, 0.38, w / 2 + 0.01]} c={cloth} />}
        <Cyl p={[0, h / 2, 0]} s={[0.05, h, 0.05]} c="#3a3438" />
        <Cyl p={[0, 0.02, 0]} s={[0.28, 0.04, 0.28]} c="#3a3438" />
      </>
    ) : (
      <>
        <Box p={[0, h, 0]} s={[w, 0.06, d]} c={c} />
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
          <Box key={i} p={[x * (w / 2 - 0.06), h / 2, z * (d / 2 - 0.06)]} s={[0.06, h, 0.06]} c={mix(c, '#000', 0.25)} />
        ))}
      </>
    )}
  </At>
);

export const Chair: React.FC<{ p?: Vec3; r?: number; c?: string }> = ({ p, r = 0, c = '#6d4a3a' }) => (
  <At p={p} r={r}>
    <Box p={[0, 0.45, 0]} s={[0.46, 0.05, 0.44]} c={c} />
    <Box p={[0, 0.78, -0.2]} s={[0.46, 0.6, 0.05]} c={c} />
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
      <Box key={i} p={[x * 0.2, 0.22, z * 0.19]} s={[0.04, 0.45, 0.04]} c={mix(c, '#000', 0.3)} />
    ))}
  </At>
);

export const Bed: React.FC<{ p?: Vec3; r?: number; c?: string; sheet?: string; frame?: string }> = ({ p, r = 0, c = '#3d4f86', sheet = '#e8e4dc', frame = '#5a3e33' }) => (
  <At p={p} r={r}>
    <Box p={[0, 0.2, 0]} s={[1.5, 0.3, 2.1]} c={frame} />
    <Box p={[0, 0.42, 0.02]} s={[1.42, 0.16, 2.0]} c={sheet} />
    <Box p={[0, 0.52, 0.35]} s={[1.46, 0.08, 1.35]} c={c} />
    <Box p={[0, 0.56, -0.75]} s={[0.9, 0.12, 0.38]} c="#f4f1ea" />
    <Box p={[0, 0.65, -1.05]} s={[1.5, 0.95, 0.08]} c={frame} />
  </At>
);

export const Desk: React.FC<{ p?: Vec3; r?: number; c?: string; monitor?: boolean; screen?: string; lamp?: boolean }> = ({ p, r = 0, c = '#b98a5e', monitor = true, screen = '#7fb2ff', lamp }) => (
  <At p={p} r={r}>
    <Table w={1.4} d={0.7} h={0.75} c={c} />
    {monitor && (
      <>
        <Box p={[0, 1.08, -0.15]} s={[0.62, 0.38, 0.03]} c="#1a1b22" />
        <Plane p={[0, 1.08, -0.133]} s={[0.56, 0.32, 1]} c={screen} glow />
        <Box p={[0, 0.88, -0.17]} s={[0.05, 0.2, 0.05]} c="#1a1b22" />
        <Box p={[0, 0.79, 0.08]} s={[0.45, 0.02, 0.15]} c="#2a2b33" />
      </>
    )}
    {lamp && <DeskLamp p={[0.5, 0.78, -0.15]} />}
  </At>
);

export const DeskLamp: React.FC<{ p?: Vec3; c?: string }> = ({ p, c = '#2b2d36' }) => (
  <At p={p}>
    <Cyl p={[0, 0.01, 0]} s={[0.09, 0.02, 0.09]} c={c} />
    <Cyl p={[0, 0.2, 0]} s={[0.012, 0.4, 0.012]} c={c} />
    <Cone p={[0.04, 0.4, 0.04]} r={[0.6, 0, -0.3]} s={[0.1, 0.13, 0.1]} c={c} />
    <Ball p={[0.07, 0.35, 0.08]} s={0.035} c="#fff2c4" glow />
  </At>
);

export const Shelf: React.FC<{ p?: Vec3; r?: number; c?: string; seed?: number }> = ({ p, r = 0, c = '#8b6146', seed = 3 }) => {
  const rand = rng(seed);
  const books: React.ReactNode[] = [];
  const cols = ['#c8402f', '#3d6fb6', '#f2b632', '#4e9a6b', '#e7e1d3', '#7a4fa0'];
  for (let row = 0; row < 3; row++) {
    let x = -0.5;
    while (x < 0.45) {
      const w = 0.05 + rand() * 0.05, h = 0.22 + rand() * 0.1;
      books.push(<Box key={`${row}-${x}`} p={[x + w / 2, 0.42 + row * 0.5 + h / 2, 0]} s={[w, h, 0.22]} c={cols[Math.floor(rand() * cols.length)]} />);
      x += w + 0.01;
    }
  }
  return (
    <At p={p} r={r}>
      <Box p={[0, 0.95, -0.13]} s={[1.1, 1.9, 0.04]} c={mix(c, '#000', 0.2)} />
      {[0.4, 0.9, 1.4, 1.88].map(y => <Box key={y} p={[0, y, 0]} s={[1.1, 0.04, 0.3]} c={c} />)}
      <Box p={[-0.53, 0.95, 0]} s={[0.04, 1.9, 0.3]} c={c} />
      <Box p={[0.53, 0.95, 0]} s={[0.04, 1.9, 0.3]} c={c} />
      {books}
    </At>
  );
};

export const Plant: React.FC<{ p?: Vec3; s?: number; pot?: string; leaf?: string }> = ({ p, s = 1, pot = '#c46b47', leaf = '#4e9a6b' }) => (
  <At p={p} s={s}>
    <Cyl p={[0, 0.17, 0]} s={[0.16, 0.34, 0.16]} c={pot} />
    <Ball p={[0, 0.5, 0]} s={[0.26, 0.3, 0.26]} c={leaf} ico />
    <Ball p={[0.12, 0.66, 0.05]} s={0.15} c={mix(leaf, '#ffffff', 0.12)} ico />
  </At>
);

export const Tree: React.FC<{ p?: Vec3; s?: number; kind?: 'round' | 'pine' | 'autumn' | 'bare'; leaf?: string }> = ({ p, s = 1, kind = 'round', leaf }) => (
  <At p={p} s={s}>
    <Cyl p={[0, 0.9, 0]} s={[0.1, 1.8, 0.1]} c="#5b3d2e" seg8 />
    {kind === 'pine' ? (
      <>
        <Cone p={[0, 2.2, 0]} s={[0.9, 1.6, 0.9]} c={leaf || '#2f6b4f'} />
        <Cone p={[0, 3.0, 0]} s={[0.65, 1.3, 0.65]} c={leaf || '#2f6b4f'} />
      </>
    ) : kind === 'bare' ? (
      <>
        <Cyl p={[0.2, 2.0, 0]} r={[0, 0, -0.6]} s={[0.04, 0.8, 0.04]} c="#5b3d2e" />
        <Cyl p={[-0.2, 2.1, 0]} r={[0, 0, 0.7]} s={[0.04, 0.8, 0.04]} c="#5b3d2e" />
      </>
    ) : (
      <>
        <Ball p={[0, 2.3, 0]} s={[1.0, 0.95, 1.0]} c={leaf || (kind === 'autumn' ? '#e39b3a' : '#4f9a52')} ico />
        <Ball p={[0.45, 2.0, 0.2]} s={0.6} c={leaf || (kind === 'autumn' ? '#d9822b' : '#468c4a')} ico />
        <Ball p={[-0.4, 2.1, -0.2]} s={0.62} c={leaf || (kind === 'autumn' ? '#eab04a' : '#56a35a')} ico />
      </>
    )}
  </At>
);

export const Bush: React.FC<{ p?: Vec3; s?: number; c?: string }> = ({ p, s = 1, c = '#4a8f4f' }) => (
  <At p={p} s={s}>
    <Ball p={[0, 0.3, 0]} s={[0.55, 0.4, 0.45]} c={c} ico />
    <Ball p={[0.35, 0.25, 0.05]} s={0.32} c={mix(c, '#fff', 0.08)} ico />
  </At>
);

export const StreetLamp: React.FC<{ p?: Vec3; r?: number; on?: boolean }> = ({ p, r = 0, on }) => (
  <At p={p} r={r}>
    <Cyl p={[0, 2.0, 0]} s={[0.05, 4, 0.05]} c="#2b2e38" seg8 />
    <Box p={[0, 4.0, 0.3]} s={[0.08, 0.06, 0.65]} c="#2b2e38" />
    <Box p={[0, 3.93, 0.58]} s={[0.3, 0.1, 0.22]} c="#2b2e38" />
    <Box p={[0, 3.87, 0.58]} s={[0.24, 0.03, 0.16]} c={on ? '#ffe2a6' : '#c9c4b8'} glow={on} />
  </At>
);

export const Fence: React.FC<{ p?: Vec3; r?: number; len?: number; c?: string }> = ({ p, r = 0, len = 4, c = '#f1ede4' }) => {
  const n = Math.round(len / 0.25);
  return (
    <At p={p} r={r}>
      {Array.from({ length: n }, (_, i) => <Box key={i} p={[-len / 2 + i * 0.25, 0.45, 0]} s={[0.1, 0.9, 0.04]} c={c} />)}
      <Box p={[0, 0.65, 0.03]} s={[len, 0.07, 0.03]} c={c} />
      <Box p={[0, 0.3, 0.03]} s={[len, 0.07, 0.03]} c={c} />
    </At>
  );
};

export const Car: React.FC<{ p?: Vec3; r?: number; c?: string }> = ({ p, r = 0, c = '#3d6fb6' }) => (
  <At p={p} r={r}>
    <Box p={[0, 0.5, 0]} s={[1.8, 0.55, 4.0]} c={c} />
    <Box p={[0, 0.98, -0.2]} s={[1.6, 0.48, 2.1]} c={c} />
    <Box p={[0, 0.98, -0.2]} s={[1.62, 0.36, 1.9]} c="#a9c6de" />
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
      <Cyl key={i} p={[x * 0.88, 0.32, z * 1.25]} r={[0, 0, Math.PI / 2]} s={[0.32, 0.22, 0.32]} c="#1b1b20" />
    ))}
    <Box p={[0.6, 0.6, 2.0]} s={[0.3, 0.12, 0.04]} c="#fff6d8" glow />
    <Box p={[-0.6, 0.6, 2.0]} s={[0.3, 0.12, 0.04]} c="#fff6d8" glow />
  </At>
);

export const House: React.FC<{ p?: Vec3; r?: number; w?: number; d?: number; h?: number; c?: string; roof?: string; lit?: boolean; seed?: number; trim?: string }> = ({ p, r = 0, w = 6, d = 6, h = 3.2, c = '#e8c9a0', roof = '#7c4a46', lit, seed = 1, trim = '#f5efe4' }) => {
  const rand = rng(seed);
  const glass = lit ? '#ffcf7a' : '#9fb9cf';
  return (
    <At p={p} r={r}>
      <Box p={[0, h / 2, 0]} s={[w, h, d]} c={c} />
      <mesh geometry={G.cone4} material={envMaterial(roof)} position={[0, h + 1.0, 0]} rotation={[0, Math.PI / 4, 0]} scale={[w * 0.78, 2.0, d * 0.78]} castShadow receiveShadow />
      <Door p={[w * 0.18, 0, d / 2]} c={['#8a4b3a', '#3d5c86', '#4e7a5a', '#a33b3b'][Math.floor(rand() * 4)]} frame={trim} />
      <Window p={[-w * 0.24, 1.45, d / 2 + 0.01]} glass={glass} lit={lit} frame={trim} w={1.3} h={1.1} bars={2} />
      {h > 4.6 && <Window p={[w * 0.18, h - 1.3, d / 2 + 0.01]} glass={glass} lit={lit && rand() < 0.6} frame={trim} w={1.1} h={0.9} bars={2} />}
      <Box p={[w * 0.18, 0.08, d / 2 + 0.35]} s={[1.3, 0.16, 0.7]} c="#bdb6aa" />
    </At>
  );
};

export const Building: React.FC<{ p?: Vec3; w?: number; d?: number; h?: number; c?: string; lit?: boolean; seed?: number; windowColor?: string }> = ({ p, w = 8, d = 8, h = 20, c = '#3a4160', lit, seed = 1, windowColor }) => {
  const rand = rng(seed);
  const rows = Math.floor(h / 2.2), cols = Math.max(2, Math.floor(w / 1.6));
  const wins: React.ReactNode[] = [];
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const on = lit ? rand() < 0.42 : false;
      const col = on ? (rand() < 0.8 ? windowColor || '#ffcf7a' : '#bfe1ff') : mix(c, '#000', 0.35);
      wins.push(<Plane key={`${i}-${j}`} p={[-w / 2 + (j + 0.5) * (w / cols), 1.4 + i * 2.2, d / 2 + 0.02]} s={[w / cols * 0.55, 1.1, 1]} c={col} glow={on} />);
    }
  return (
    <At p={p}>
      <Box p={[0, h / 2, 0]} s={[w, h, d]} c={c} />
      <Box p={[0, h + 0.2, 0]} s={[w + 0.3, 0.4, d + 0.3]} c={mix(c, '#000', 0.2)} />
      {wins}
    </At>
  );
};

export const WallClock: React.FC<{ p?: Vec3; r?: number; s?: number; t?: number; frozen?: boolean }> = ({ p, r = 0, s = 1, t = 0, frozen }) => {
  const sec = frozen ? 0 : t;
  const minuteA = -((10 * 60 + sec) / 3600) * Math.PI * 2;
  const secA = -(sec / 60) * Math.PI * 2;
  return (
    <At p={p} r={r} s={s}>
      <Cyl p={[0, 0, 0]} r={[Math.PI / 2, 0, 0]} s={[0.32, 0.05, 0.32]} c="#2a2b33" />
      <Cyl p={[0, 0, 0.026]} r={[Math.PI / 2, 0, 0]} s={[0.28, 0.01, 0.28]} c="#f6f2e8" />
      <group position={[0, 0, 0.04]} rotation={[0, 0, minuteA]}><Box p={[0, 0.1, 0]} s={[0.02, 0.2, 0.01]} c="#1b1b20" /></group>
      <group position={[0, 0, 0.04]} rotation={[0, 0, -2.1]}><Box p={[0, 0.065, 0]} s={[0.028, 0.13, 0.01]} c="#1b1b20" /></group>
      <group position={[0, 0, 0.045]} rotation={[0, 0, secA]}><Box p={[0, 0.1, 0]} s={[0.008, 0.22, 0.01]} c="#d9472b" /></group>
    </At>
  );
};

export const Rug: React.FC<{ p?: Vec3; w?: number; d?: number; c?: string; round?: boolean }> = ({ p, w = 2.4, d = 1.6, c = '#b5584a', round }) =>
  round ? (
    <mesh geometry={G.circle} material={envMaterial(c)} position={p ? [p[0], (p[1] || 0) + 0.006, p[2]] : [0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[w / 2, d / 2, 1]} receiveShadow />
  ) : (
    <Plane p={p ? [p[0], (p[1] || 0) + 0.006, p[2]] : [0, 0.006, 0]} r={[-Math.PI / 2, 0, 0]} s={[w, d, 1]} c={c} />
  );

/** Crowd of simple seated/standing extras (cheap: head + body only). */
export const Crowd: React.FC<{ p?: Vec3; rows?: number; cols?: number; dx?: number; dz?: number; rise?: number; seed?: number; r?: number }> = ({ p, rows = 6, cols = 20, dx = 0.6, dz = 0.9, rise = 0.5, seed = 5, r = 0 }) => {
  const rand = rng(seed);
  const shirts = ['#5a8f9e', '#3d6fb6', '#f2b632', '#4e9a6b', '#e7e1d3', '#7a4fa0', '#e46f8e', '#2d2f3a'];
  const out: React.ReactNode[] = [];
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const x = -((cols - 1) * dx) / 2 + j * dx + (rand() - 0.5) * 0.15;
      const z = -i * dz, y = i * rise;
      out.push(
        <group key={`${i}-${j}`} position={[x, y, z]}>
          <mesh geometry={G.box} material={envMaterial(shirts[Math.floor(rand() * shirts.length)])} position={[0, 0.45, 0]} scale={[0.34, 0.5, 0.22]} />
          <mesh geometry={G.sphere} material={inkMaterial()} position={[0, 0.9 + rand() * 0.05, 0]} scale={0.17} />
        </group>,
      );
    }
  return <At p={p} r={r}>{out}</At>;
};
