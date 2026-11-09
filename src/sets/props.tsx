// Props: things held in a hand (attached to the hand bone, which points down -Y) and
// free-standing scene props placed by shot specs ({ type, pos, rot, scale, color, text, path }).
import React from 'react';
import * as THREE from 'three';
import { Glow, Pill } from '../engine/fx';
import type { PropSpec, Vec3 } from '../types';
import { At, Ball, Bed, Box, Building, Car, Chair, Cone, Cyl, Desk, DeskLamp, Door, Fence, G, House, Plane, Plant, Rug, Shelf, Sign, StreetLamp, Table, Tree, Bush, WallClock, Window, Crowd, mix } from './kit';
import { envMaterial } from '../engine/materials';
import { TrafficLight } from './outdoorKit';

/** Small object in a fist. Local frame: palm centre at origin, fingers toward -Y, front +Z. */
export const HandProp: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'pill':
      // pinched between fingertips at the top of the fist
      return (
        <>
          <Pill p={[0, -0.095, 0.02]} r={[0.3, 0, 0.9]} s={2.1} />
          <Glow p={[0, -0.095, 0.02]} size={0.16} color="#b07cff" opacity={0.55} />
        </>
      );
    case 'tray':
      return (
        <At p={[0, -0.05, 0.16]} r={[1.45, 0, 0]}>
          <Box s={[0.36, 0.25, 0.02]} c="#3d6fb6" />
          <Box p={[0.06, 0.02, 0.02]} r={[0, 0, 0.5]} s={[0.12, 0.09, 0.012]} c="#f2b632" />
          <Cyl p={[-0.1, 0.0, 0.05]} r={[Math.PI / 2, 0, 0]} s={[0.035, 0.09, 0.035]} c="#f3efe6" />
        </At>
      );
    case 'stopwatch':
      return (
        <At p={[0, -0.06, 0.05]} r={[-1.2, 0, 0]}>
          <Cyl r={[Math.PI / 2, 0, 0]} s={[0.05, 0.02, 0.05]} c="#e9e4da" />
          <Cyl p={[0, 0, 0.011]} r={[Math.PI / 2, 0, 0]} s={[0.04, 0.002, 0.04]} c="#ffffff" glow />
          <Cyl p={[0, 0.06, 0]} s={[0.008, 0.02, 0.008]} c="#2b2d36" />
        </At>
      );
    case 'whistle':
      // coach's whistle: orange barrel + mouthpiece, held up at the fist
      return (
        <At p={[0, -0.04, 0.05]} r={[-0.3, 0, 0]}>
          <Cyl r={[0, 0, Math.PI / 2]} s={[0.032, 0.07, 0.032]} c="#ff8a1f" />
          <Box p={[0.05, 0.012, 0]} s={[0.05, 0.022, 0.026]} c="#ff8a1f" />
          <Box p={[0.0, 0.03, 0]} s={[0.022, 0.012, 0.02]} c="#2b2d36" />
        </At>
      );
    case 'phone':
      return (
        <At p={[0, -0.06, 0.03]} r={[-1.2, 0, 0]}>
          <Box s={[0.075, 0.15, 0.012]} c="#17181e" />
          <Plane p={[0, 0, 0.007]} s={[0.064, 0.135, 1]} c="#8fc2ff" glow />
        </At>
      );
    case 'jar':
      // specimen jar: glass body, glowing green fungus inside, dark lid
      return (
        <At p={[0, -0.02, 0.07]}>
          <Cyl p={[0, 0.1, 0]} s={[0.075, 0.2, 0.075]} c="#cfeee4" />
          <Cyl p={[0, 0.07, 0]} s={[0.06, 0.1, 0.06]} c="#8dff6a" glow />
          <Cyl p={[0, 0.215, 0]} s={[0.08, 0.035, 0.08]} c="#2b2d36" />
        </At>
      );
    case 'cup':
      return <At p={[0, -0.05, 0.05]}><Cyl s={[0.045, 0.11, 0.045]} c="#f3efe6" /><Cyl p={[0, 0.056, 0]} s={[0.04, 0.005, 0.04]} c="#5b3a2a" /></At>;
    case 'book':
      return <At p={[0, -0.08, 0.04]} r={[0.2, 0, 0]}><Box s={[0.17, 0.23, 0.04]} c="#c8402f" /><Box p={[0, 0, 0.001]} s={[0.16, 0.22, 0.036]} c="#f4efe2" /></At>;
    case 'ball':
      return <Ball p={[0, -0.12, 0.08]} s={0.11} c="#f4f1ea" />;
    case 'pen':
      return <Cyl p={[0, -0.04, 0.04]} r={[1.2, 0, 0]} s={[0.008, 0.14, 0.008]} c="#2a5bd7" />;
    case 'flower':
      return (
        <At p={[0, -0.02, 0.03]}>
          <Cyl p={[0, 0.12, 0]} s={[0.008, 0.28, 0.008]} c="#3f8a4a" />
          <Ball p={[0, 0.27, 0]} s={0.045} c="#e3456b" />
          <Ball p={[0.04, 0.24, 0.02]} s={0.035} c="#f2b632" />
        </At>
      );
    case 'bag':
      return <At p={[0, -0.22, 0]}><Box s={[0.32, 0.36, 0.12]} c="#7a5a3a" /><Box p={[0, 0.2, 0]} s={[0.02, 0.1, 0.02]} c="#3a2a1a" /></At>;
    case 'umbrella':
      return (
        <At p={[0, 0, 0]}>
          <Cyl p={[0, 0.5, 0]} s={[0.012, 1.0, 0.012]} c="#2a2b33" />
          <Cone p={[0, 1.05, 0]} s={[0.65, 0.3, 0.65]} c="#f2b632" />
        </At>
      );
    case 'coin':
      return <Cyl p={[0, -0.04, 0.05]} r={[1.4, 0, 0]} s={[0.035, 0.006, 0.035]} c="#e8b84a" />;
    case 'paper':
    case 'letter':
      return <Box p={[0, -0.09, 0.03]} r={[0.2, 0, 0]} s={[0.17, 0.22, 0.004]} c="#f6f2e8" />;
    case 'key':
      return <At p={[0, -0.05, 0.04]}><Cyl r={[1.4, 0, 0]} s={[0.025, 0.006, 0.025]} c="#e8b84a" /><Box p={[0, -0.05, 0]} s={[0.01, 0.07, 0.006]} c="#e8b84a" /></At>;
    case 'controller':
      return <Box p={[0, -0.04, 0.06]} r={[-0.9, 0, 0]} s={[0.16, 0.03, 0.09]} c="#26262e" />;
    case 'dumbbell':
      return <At p={[0, -0.02, 0]} r={[0, 0, Math.PI / 2]}><Cyl s={[0.015, 0.3, 0.015]} c="#3a3a44" /><Cyl p={[0, 0.13, 0]} s={[0.06, 0.06, 0.06]} c="#1b1b20" /><Cyl p={[0, -0.13, 0]} s={[0.06, 0.06, 0.06]} c="#1b1b20" /></At>;
    case 'torch':
    case 'flashlight':
      return <At p={[0, -0.03, 0.06]} r={[-1.4, 0, 0]}><Cyl s={[0.025, 0.18, 0.025]} c="#2b2d36" /><Cyl p={[0, 0.095, 0]} s={[0.03, 0.01, 0.03]} c="#fff5c8" glow /></At>;
    default:
      return <Box p={[0, -0.06, 0.04]} s={0.08} c="#e8b84a" />;
  }
};

const N = (v: unknown, d: number) => (typeof v === 'number' ? v : d);
const flameGeo = new THREE.ConeGeometry(1, 1, 7);
const flameOuter = new THREE.MeshBasicMaterial({ color: '#ff5a1a', toneMapped: false });
const flameInner = new THREE.MeshBasicMaterial({ color: '#ffd34d', toneMapped: false });

/** Toon flame tongues on a ring; k = 0..1 grows them in. */
const Flames: React.FC<{ r: number; k: number; t: number }> = ({ r, k, t }) => {
  if (k <= 0) return null;
  const tongues = Array.from({ length: 22 }, (_, i) => {
    const inner = i >= 15, a = (i / (inner ? 7 : 15)) * Math.PI * 2 + (inner ? 0.4 : 0);
    const rr = r * (inner ? 0.42 : 0.82), f = 0.55 + 0.45 * Math.abs(Math.sin(t * (7 + (i % 5)) + i * 1.7));
    const h = k * r * (inner ? 0.9 : 0.75) * f, w = r * (inner ? 0.16 : 0.13) * (0.6 + 0.4 * k);
    return <mesh key={i} geometry={flameGeo} material={inner ? flameInner : flameOuter} position={[Math.cos(a) * rr, h / 2 + 0.01, Math.sin(a) * rr]} scale={[w, h, w]} renderOrder={5} />;
  });
  return (
    <group>
      {tongues}
      <Glow p={[0, r * 0.45, 0]} size={r * 3.2} color="#ff7a2f" opacity={0.55 * k} />
    </group>
  );
};
const S = (v: unknown, d: string) => (typeof v === 'string' ? v : d);
const triGeo = new THREE.CylinderGeometry(1, 1, 1, 3);
const V3 = (v: unknown, d: Vec3): Vec3 => (Array.isArray(v) && v.length === 3 ? (v as Vec3) : d);

/** Billowing toon smoke: opaque grey puffs rise from the origin, swell, drift with the wind and
 *  shrink away at the top. Deterministic in t. */
const SMOKE_SHADES = ['#3f3b45', '#524e58', '#67636d', '#7e7a83', '#96929a'];
export const Smoke: React.FC<{ t: number; h?: number; r?: number; n?: number; wind?: [number, number]; speed?: number; seed?: number; out?: number }> = ({ t, h = 8, r = 0.5, n = 34, wind = [0.25, 0.05], speed = 1.1, seed = 1, out = 0 }) => {
  const puffs: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const rnd = (k: number) => { const x = Math.sin(i * 12.9898 + seed * 78.233 + k * 37.719) * 43758.5453; return x - Math.floor(x); };
    const ph = (((t * speed) / h + i / n + rnd(1) * 0.25) % 1 + 1) % 1; // 0 = source, 1 = top
    const spread = r * (0.5 + 2.4 * ph);
    const drift = ph * ph * h;
    // `out`: smoke first rolls out of the opening (+z) before it climbs
    const p: Vec3 = [wind[0] * drift + (rnd(2) - 0.5) * spread, ph * h, wind[1] * drift + (rnd(3) - 0.5) * spread + out * Math.min(1, ph * 5)];
    const grow = Math.min(1, ph / 0.08) * Math.min(1, (1 - ph) / 0.18);
    const size = r * (0.6 + 1.9 * ph) * grow * (0.8 + 0.4 * rnd(4));
    if (size < 0.02) continue;
    const shade = SMOKE_SHADES[Math.min(SMOKE_SHADES.length - 1, Math.floor(ph * SMOKE_SHADES.length + rnd(5) * 0.8))];
    puffs.push(<mesh key={i} geometry={G.ico} material={envMaterial(shade)} position={p} scale={size} />);
  }
  return <group>{puffs}</group>;
};

/** Ladder-truck basket. Origin = 0.1 m under the rider's feet (so it can `follow` an actor);
 *  `from` = world point of the ladder pivot on the truck: the boom is drawn from there to the basket. */
const Basket: React.FC<{ pos: Vec3; from?: Vec3; c: string }> = ({ pos, from, c }) => {
  const rail = '#d9dde4';
  let boom: React.ReactNode = null;
  if (from) {
    const a = new THREE.Vector3(0, 0.2, 0.25);
    const b = new THREE.Vector3(from[0] - pos[0], from[1] - pos[1], from[2] - pos[2]);
    const d = b.clone().sub(a), len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), d.clone().normalize());
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const rungs = Math.floor(len / 0.45);
    boom = (
      <group position={mid.toArray()} quaternion={q}>
        {[-0.32, 0.32].map(z => <Box key={z} p={[0, 0, z]} s={[len, 0.2, 0.08]} c="#b9bec8" />)}
        <Box p={[0, -0.12, 0]} s={[len, 0.06, 0.6]} c="#8d929c" />
        {Array.from({ length: rungs }, (_, i) => <Box key={i} p={[-len / 2 + (i + 0.5) * (len / rungs), 0.02, 0]} s={[0.05, 0.05, 0.62]} c={rail} />)}
      </group>
    );
  }
  return (
    <group>
      {boom}
      <Box p={[0, 0.05, 0]} s={[1.3, 0.1, 1.0]} c={c} />
      {/* solid lower panels, open rails above */}
      <Box p={[0, 0.38, 0.49]} s={[1.3, 0.56, 0.04]} c={c} />
      <Box p={[0, 0.38, -0.49]} s={[1.3, 0.56, 0.04]} c={c} />
      {[-0.64, 0.64].map(x => <Box key={x} p={[x, 0.38, 0]} s={[0.04, 0.56, 1.0]} c={c} />)}
      {[[-0.62, -0.47], [0.62, -0.47], [-0.62, 0.47], [0.62, 0.47]].map(([x, z], i) => <Box key={i} p={[x, 0.62, z]} s={[0.05, 1.05, 0.05]} c={rail} />)}
      {[-0.47, 0.47].map(z => <Box key={z} p={[0, 1.13, z]} s={[1.3, 0.05, 0.05]} c={rail} />)}
      {[-0.62, 0.62].map(x => <Box key={x} p={[x, 1.13, 0]} s={[0.05, 0.05, 1.0]} c={rail} />)}
    </group>
  );
};

/** Red ladder truck, length along x with the cab at -x. Ladder pivot (turntable top) at local [2.6, 2.75, 0].
 *  `stowed` draws the ladder folded along the roof (no basket shot). */
const FireTruck: React.FC<{ t: number; c: string; stowed?: boolean }> = ({ t, c, stowed }) => {
  const on = Math.floor(t * 4) % 2 === 0;
  return (
    <group>
      <Box p={[0.4, 0.95, 0]} s={[8.4, 1.1, 2.5]} c={c} />
      <Box p={[0.9, 1.9, 0]} s={[5.6, 0.85, 2.46]} c={mix(c, '#000', 0.12)} />
      <Box p={[-3.6, 1.95, 0]} s={[1.9, 1.5, 2.45]} c={c} />
      <Box p={[-4.56, 2.15, 0]} s={[0.04, 0.75, 2.1]} c="#a9c6de" />
      {[-1, 1].map(s => <Box key={s} p={[-3.55, 2.15, s * 1.23]} s={[1.2, 0.6, 0.03]} c="#a9c6de" />)}
      {[-1, 1].map(s => <Box key={'st' + s} p={[0.4, 1.12, s * 1.26]} s={[8.4, 0.14, 0.02]} c="#f4f1ea" />)}
      {[-3.1, 1.6, 3.3].flatMap(x => [-1, 1].map(s => <Cyl key={`${x}${s}`} p={[x, 0.5, s * 1.12]} r={[Math.PI / 2, 0, 0]} s={[0.5, 0.32, 0.5]} c="#1b1b20" />))}
      <Box p={[-3.6, 2.76, -0.45]} s={[0.35, 0.13, 0.8]} c={on ? '#ff3b30' : '#6a1a16'} glow={on} />
      <Box p={[-3.6, 2.76, 0.45]} s={[0.35, 0.13, 0.8]} c={!on ? '#3b8bff' : '#16306a'} glow={!on} />
      {on && <Glow p={[-3.6, 2.9, -0.45]} size={1.6} color="#ff3b30" opacity={0.5} />}
      {!on && <Glow p={[-3.6, 2.9, 0.45]} size={1.6} color="#3b8bff" opacity={0.5} />}
      <Cyl p={[2.6, 2.5, 0]} s={[0.8, 0.3, 0.8]} c="#9aa0aa" />
      {[-1, 1].flatMap(sx => [-1, 1].map(sz => <Box key={`o${sx}${sz}`} p={[0.4 + sx * 3.6, 0.25, sz * 1.65]} s={[0.25, 0.5, 0.8]} c="#9aa0aa" />))}
      {stowed && <Box p={[-0.2, 2.82, 0]} s={[6.4, 0.2, 0.75]} c="#b9bec8" />}
    </group>
  );
};

/** A pair of binoculars lying on a surface, barrels pointing along +z. */
const Binoculars: React.FC = () => (
  <At p={[0, 0.04, 0]}>
    {[-1, 1].map(s => (
      <group key={s}>
        <Cyl p={[s * 0.045, 0, 0]} r={[Math.PI / 2, 0, 0]} s={[0.036, 0.14, 0.036]} c="#22252f" />
        <Cyl p={[s * 0.045, 0, 0.075]} r={[Math.PI / 2, 0, 0]} s={[0.04, 0.02, 0.04]} c="#3a3f4c" />
        <Cyl p={[s * 0.045, 0, 0.087]} r={[Math.PI / 2, 0, 0]} s={[0.028, 0.004, 0.028]} c="#8fc2ff" glow />
      </group>
    ))}
    <Box p={[0, 0.01, -0.02]} s={[0.06, 0.03, 0.06]} c="#3a3f4c" />
  </At>
);

/** Free-standing prop by name. Every prop sits on y=0 at its origin unless noted. */
export const WorldProp: React.FC<{ spec: PropSpec; t: number }> = ({ spec, t }) => {
  const c = spec.color;
  const body = (() => {
    switch (spec.type) {
      case 'table': return <Table c={c || '#9b6a4a'} w={N(spec.w, 1.4)} d={N(spec.d, 0.8)} />;
      case 'roundTable': return <Table round w={N(spec.w, 0.9)} c={c || '#8f6a52'} cloth={S(spec.cloth, '') || undefined} />;
      case 'chair': return <Chair c={c} />;
      case 'bed': return <Bed c={c} />;
      case 'desk': return <Desk c={c} screen={S(spec.screen, '#7fb2ff')} lamp={!!spec.lamp} />;
      case 'deskLamp': return <DeskLamp />;
      case 'door': return <Door c={c} />;
      case 'window': return <Window glass={S(spec.glass, spec.lit ? '#ffd27e' : '#9fc6e8')} lit={!!spec.lit} w={N(spec.w, 1.2)} h={N(spec.h, 1.4)} />;
      case 'shelf': return <Shelf c={c} />;
      case 'plant': return <Plant leaf={c} />;
      case 'tree': return <Tree kind={(spec.kind as 'round') || 'round'} leaf={c} />;
      case 'bush': return <Bush c={c} />;
      case 'lamp': return <StreetLamp on={!!spec.on} />;
      case 'fence': return <Fence len={N(spec.len, 4)} c={c} />;
      case 'car': return <Car c={c} />;
      case 'house': return <House c={c} lit={!!spec.lit} seed={N(spec.seed, 1)} />;
      case 'building': return <Building c={c} h={N(spec.h, 20)} w={N(spec.w, 8)} lit={!!spec.lit} seed={N(spec.seed, 1)} />;
      case 'clock': return <WallClock t={t} frozen={!!spec.frozen} />;
      case 'rug': return <Rug c={c} w={N(spec.w, 2.4)} d={N(spec.d, 1.6)} round={!!spec.round} />;
      case 'crowd': return <Crowd rows={N(spec.rows, 4)} cols={N(spec.cols, 12)} seed={N(spec.seed, 5)} />;
      case 'sign': return <Sign w={N(spec.w, 2)} h={N(spec.h, 0.6)} text={S(spec.text, 'SIGN')} bg={S(spec.bg, '#1d2333')} fg={S(spec.fg, '#ffffff')} />;
      case 'screen': return <Sign w={N(spec.w, 1.6)} h={N(spec.h, 0.9)} text={S(spec.text, '')} bg={c || '#16203a'} fg={S(spec.fg, '#f0b44c')} />;
      case 'box':
      case 'crate': return <Box p={[0, N(spec.h, 0.5) / 2, 0]} s={[N(spec.w, 0.5), N(spec.h, 0.5), N(spec.d, 0.5)]} c={c || '#b98a5e'} />;
      case 'ball': return <Ball p={[0, 0.11, 0]} s={0.11} c={c || '#f4f1ea'} />;
      case 'basketball': return <Ball p={[0, 0.12, 0]} s={0.12} c={c || '#e0702b'} />;
      case 'jar': return (
        <At>
          <Cyl p={[0, 0.13, 0]} s={[0.1, 0.26, 0.1]} c={c || '#cfeee4'} />
          {spec.empty ? null : <Cyl p={[0, 0.09, 0]} s={[0.08, 0.14, 0.08]} c="#8dff6a" glow />}
          <Cyl p={[0, 0.28, 0]} s={[0.105, 0.045, 0.105]} c="#2b2d36" />
        </At>
      );
      case 'cup': return <At p={[0, 0.06, 0]}><Cyl s={[0.045, 0.11, 0.045]} c={c || '#f3efe6'} /></At>;
      case 'phone': return (
        <At p={[0, 0.006, 0]} r={[-Math.PI / 2, 0, 0]}>
          <Box s={[0.075, 0.15, 0.012]} c="#17181e" />
          <Plane p={[0, 0, 0.007]} s={[0.064, 0.135, 1]} c={spec.broken ? '#3a3d48' : c || '#8fc2ff'} glow={!spec.broken} />
          {spec.broken ? (
            <>
              <Box p={[-0.008, 0.02, 0.009]} r={[0, 0, 0.9]} s={[0.05, 0.003, 0.002]} c="#e9edf5" />
              <Box p={[0.012, -0.012, 0.009]} r={[0, 0, -0.5]} s={[0.055, 0.003, 0.002]} c="#e9edf5" />
              <Box p={[0.004, -0.04, 0.009]} r={[0, 0, 1.3]} s={[0.04, 0.003, 0.002]} c="#e9edf5" />
            </>
          ) : null}
        </At>
      );
      case 'book': return <Box p={[0, 0.02, 0]} s={[0.17, 0.04, 0.23]} c={c || '#c8402f'} />;
      case 'laptop': return (
        <At>
          <Box p={[0, 0.01, 0]} s={[0.36, 0.02, 0.25]} c="#c9ccd4" />
          <Box p={[0, 0.13, -0.12]} r={[-0.25, 0, 0]} s={[0.36, 0.24, 0.015]} c="#c9ccd4" />
          <Plane p={[0, 0.13, -0.11]} r={[-0.25, 0, 0]} s={[0.32, 0.2, 1]} c={c || '#8fc2ff'} glow />
        </At>
      );
      case 'glow': return <Ball p={[0, N(spec.y, 1), 0]} s={N(spec.size, 0.3)} c={c || '#ffe08a'} glow />;
      case 'pillar': return <Cyl p={[0, N(spec.h, 3) / 2, 0]} s={[N(spec.w, 0.3), N(spec.h, 3), N(spec.w, 0.3)]} c={c || '#d8d2c4'} />;
      case 'wall': return <Box p={[0, N(spec.h, 3) / 2, 0]} s={[N(spec.w, 4), N(spec.h, 3), 0.15]} c={c || '#d8cfc0'} />;
      case 'portal': return (
        <At p={[0, 1.3, 0]}>
          <mesh rotation={[0, 0, 0]} scale={[1, 1.4, 1]}>
            <torusGeometry args={[0.9, 0.08, 12, 48]} />
            <meshBasicMaterial color={c || '#8fd3ff'} toneMapped={false} />
          </mesh>
          <Plane s={[1.7, 2.4, 1]} c={mix(c || '#8fd3ff', '#ffffff', 0.4)} glow opacity={0.6} />
        </At>
      );
      case 'cone': return <Cone p={[0, 0.35, 0]} s={[0.22, 0.7, 0.22]} c={c || '#f07b2b'} />;
      case 'spot': {
        // a flat glowing ring on the floor ("the spot you leave behind")
        // `ignite` (seconds, cue-resolved): flames grow in over 0.5 s from that time
        const r = N(spec.size, 0.6);
        const ig = typeof spec.ignite === 'number' ? spec.ignite : undefined;
        const k = ig === undefined ? 0 : Math.max(0, Math.min(1, (t - ig) / 0.5));
        return (
          <group>
            <At p={[0, 0.012, 0]} r={[-Math.PI / 2, 0, 0]}>
              <mesh scale={r} renderOrder={3}><circleGeometry args={[1, 48]} /><meshBasicMaterial color={c || '#b07cff'} transparent opacity={0.35 + 0.4 * k} depthWrite={false} toneMapped={false} /></mesh>
              <mesh scale={r} renderOrder={4}><ringGeometry args={[0.86, 1, 64]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.85} depthWrite={false} toneMapped={false} /></mesh>
              <mesh scale={r * 1.25} renderOrder={3}><ringGeometry args={[0.8, 1, 64]} /><meshBasicMaterial color={c || '#b07cff'} transparent opacity={0.25} depthWrite={false} toneMapped={false} /></mesh>
            </At>
            <Flames r={r} k={k} t={t} />
          </group>
        );
      }
      case 'dog': return (
        // a small toon dog facing +z: body, head with ears and snout, four legs, tail up; wags with t
        <At>
          <Box p={[0, 0.42, 0]} s={[0.26, 0.24, 0.55]} c={c || '#b5793f'} />
          <Box p={[0, 0.6, 0.33]} s={[0.22, 0.2, 0.22]} c={c || '#b5793f'} />
          <Box p={[0, 0.56, 0.47]} s={[0.12, 0.09, 0.1]} c="#e9d2b0" />
          <Box p={[0, 0.58, 0.53]} s={[0.05, 0.04, 0.03]} c="#1b1b20" />
          {[-1, 1].map(k => <Box key={'e' + k} p={[k * 0.09, 0.72, 0.3]} r={[0, 0, k * 0.3]} s={[0.06, 0.12, 0.05]} c="#6e4524" />)}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Box key={i} p={[x * 0.09, 0.15, z * 0.2]} s={[0.07, 0.3, 0.07]} c={c || '#b5793f'} />)}
          <At p={[0, 0.52, -0.28]} r={[-0.7, Math.sin(t * 14) * 0.5, 0]}><Box p={[0, 0.1, 0]} s={[0.05, 0.22, 0.05]} c={c || '#b5793f'} /></At>
        </At>
      );
      case 'iceHole': {
        // a break in pond ice: crack lines grow over the second before `ignite` (cue-resolved), then the
        // hole opens (dark water, broken slabs round the rim). `cracks: true` = cracks only, no hole.
        // An actor standing at the same spot with pos y ≈ -0.9 reads as treading water (the water disc hides the body).
        const r = N(spec.size, 0.75);
        const ig = typeof spec.ignite === 'number' ? spec.ignite : undefined;
        const ck = ig === undefined ? 1 : Math.max(0, Math.min(1, (t - ig + 1) / 1));
        const open = !spec.cracks && (ig === undefined || t >= ig);
        const ok = open ? Math.min(1, (t - (ig ?? -1)) / 0.15) : 0;
        return (
          <group>
            {Array.from({ length: 9 }, (_, i) => {
              const a = (i / 9) * Math.PI * 2 + (i % 3) * 0.31;
              const L = r * (1.4 + (i % 4) * 0.45) * ck;
              return <Box key={i} p={[Math.cos(a) * L / 2, 0.036, Math.sin(a) * L / 2]} r={[0, -a, 0]} s={[Math.max(0.001, L), 0.004, 0.025]} c="#5f7f90" />;
            })}
            {open && (
              <>
                <At p={[0, 0.038, 0]} s={[ok, 1, ok]}>
                  <Cyl s={[r, 0.01, r]} c={c || '#1d3f5e'} />
                  <Cyl p={[0, 0.006, 0]} s={[r * 0.55, 0.004, r * 0.55]} c="#2a5578" />
                </At>
                {Array.from({ length: 7 }, (_, i) => {
                  const a = (i / 7) * Math.PI * 2 + 0.4;
                  return <Box key={'s' + i} p={[Math.cos(a) * r * 1.02, 0.05, Math.sin(a) * r * 1.02]} r={[0.12 * ((i % 2) * 2 - 1), -a, 0.08]} s={[0.22 * ok, 0.05, 0.34 * ok]} c={i % 2 ? '#e6f4fa' : '#cfe6f1'} />;
                })}
              </>
            )}
          </group>
        );
      }
      case 'skateboard': return (
        <At p={[0, 0.07, 0]}>
          <Box s={[0.21, 0.025, 0.8]} c={c || '#7a4fa0'} />
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Cyl key={i} p={[x * 0.08, -0.04, z * 0.28]} r={[0, 0, Math.PI / 2]} s={[0.03, 0.03, 0.03]} c="#f3efe6" />)}
        </At>
      );
      case 'fire': {
        // free-standing toon flames (window/doorway fires); `ignite` grows them in like `spot`
        const ig = typeof spec.ignite === 'number' ? spec.ignite : undefined;
        const k = ig === undefined ? 1 : Math.max(0, Math.min(1, (t - ig) / 0.5));
        return <Flames r={N(spec.size, 0.5)} k={k} t={t + N(spec.seed, 0)} />;
      }
      case 'smoke': return <Smoke t={t} h={N(spec.h, 8)} r={N(spec.size, 0.5)} n={N(spec.n, 34)} speed={N(spec.speed, 1.1)} seed={N(spec.seed, 1)} wind={(Array.isArray(spec.wind) ? spec.wind : [0.25, 0.05]) as [number, number]} />;
      case 'firetruck': return <FireTruck t={t} c={c || '#c8302a'} stowed={!!spec.stowed} />;
      case 'basket': return <Basket pos={spec.pos || [0, 0, 0]} from={spec.from ? V3(spec.from, [0, 0, 0]) : undefined} c={c || '#c8302a'} />;
      case 'binoculars': return <Binoculars />;
      case 'pizza': return (
        // a slice lying flat, tip toward +z
        <At p={[0, 0.008, 0]} s={N(spec.size, 1)}>
          <mesh geometry={triGeo} material={envMaterial('#f2c14e')} rotation={[0, Math.PI, 0]} scale={[0.1, 0.014, 0.14]} castShadow />
          <Box p={[0, 0.006, -0.075]} s={[0.17, 0.026, 0.035]} c="#c98a45" />
          {[[-0.025, -0.03], [0.03, -0.035], [0.0, 0.02]].map(([x, z], i) => <Cyl key={i} p={[x, 0.009, z]} s={[0.016, 0.004, 0.016]} c="#a3312a" />)}
        </At>
      );
      case 'trafficlight': return <TrafficLight p={[0, 0, 0]} state={(S(spec.state, 'red') as 'red' | 'amber' | 'green')} arm={N(spec.arm, 3.2)} />;
      case 'trophy': return (
        <At>
          <Box p={[0, 0.06, 0]} s={[0.2, 0.12, 0.2]} c="#2b2d36" />
          <Cyl p={[0, 0.2, 0]} s={[0.03, 0.18, 0.03]} c="#e8b84a" />
          <Cone p={[0, 0.38, 0]} r={[Math.PI, 0, 0]} s={[0.13, 0.22, 0.13]} c="#e8b84a" />
        </At>
      );
      default:
        return <Box p={[0, 0.25, 0]} s={0.5} c={c || '#ff00ff'} />;
    }
  })();
  // optional path animation
  let pos: Vec3 = spec.pos || [0, 0, 0];
  let r = spec.rot;
  if (spec.path && spec.path.length) {
    const pts = spec.path;
    if (t <= pts[0].t) pos = pts[0].pos;
    else if (t >= pts[pts.length - 1].t) pos = pts[pts.length - 1].pos;
    else
      for (let i = 0; i < pts.length - 1; i++)
        if (t >= pts[i].t && t < pts[i + 1].t) {
          const k = (t - pts[i].t) / (pts[i + 1].t - pts[i].t);
          pos = pts[i].pos.map((v, j) => v + (pts[i + 1].pos[j] - v) * k) as Vec3;
          if (pts[i].rot && pts[i + 1].rot) r = pts[i].rot!.map((v, j) => v + (pts[i + 1].rot![j] - v) * k) as Vec3;
        }
  }
  const rr: Vec3 = typeof r === 'number' ? [0, (r * Math.PI) / 180, 0] : r ? (r.map(v => (v * Math.PI) / 180) as Vec3) : [0, 0, 0];
  return <group position={pos} rotation={rr} scale={spec.scale ?? 1}>{body}</group>;
};
