// City rooftop at night: a 26 × 20 m tar roof 45 m above the street with a 1 m parapet, a stair
// door hut, a wooden water tower, AC units, vents, an antenna, string lights and a little lounge;
// a lit skyline all around (instanced windows), a big moon over the front (-z) ledge.
//
// Roof floor y = 0 (x ∈ [-12.65, 12.65], z ∈ [-9.65, 9.65] inside the parapet); parapet top y = 1.1;
// the street is at y = -45. The open "view" side is -z (moon, skyline); hut + water tower at +z.
import React from 'react';
import * as THREE from 'three';
import { envMaterial, flat } from '../engine/materials';
import type { Vec3 } from '../types';
import type { SetProps } from './index';
import { At, Ball, Box, Chair, Cone, Cyl, Door, G, mix, Plant, rng, Table } from './kit';
import { PALETTES } from './look';
import { decalMaterial, facadeWindows, glowMaterial, Halo, Inst, Instances, LightPool, nightness, skyFlat, WindowSet } from './outdoorKit';

const RW = 26, RD = 20; // roof footprint
const STREET = -45;
const IN_X = RW / 2 - 0.35, IN_Z = RD / 2 - 0.35; // inner parapet faces
const MOON_DIR = new THREE.Vector3(0.32, 0.27, -0.91).normalize();

Object.assign(PALETTES, {
  // Night over the city: dark sky with stars, soft blue moonlight from the moon side, fog pushed back so
  // the lit skyline reads. (The moon itself is a mesh in the rooftop set.)
  rooftopNight: {
    skyTop: '#060a1e', skyHorizon: '#2a3366', skyBottom: '#2a3366', fog: '#1d2549', fogNear: 70, fogFar: 360,
    hemiSky: '#6c7ac4', hemiGround: '#2c2638', hemi: 1.8, key: '#c9d6ff', keyInt: 1.05, keyDir: [0.38, 0.62, -0.68],
    rim: '#c4d4ff', rimAmbient: 0.55, stars: true, windows: '#ffcf7a', windowsLit: true,
  },
});

const WALL = '#8f7f8e', CAP = '#b3aab4', FLOOR = '#66687e';
const SKY_COLS = ['#7d84a4', '#8b88a6', '#968fa4', '#6f7998', '#a199ae', '#857d97', '#7b8fa6'];

// ---------------------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------------------
export const WaterTower: React.FC<{ p: Vec3; s?: number }> = ({ p, s = 1 }) => {
  const steel = '#3c3f4c', wood = '#9a6844', hoop = '#34303a';
  return (
    <At p={p} s={s}>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Cyl key={i} p={[x * 1.3, 2.2, z * 1.3]} s={[0.11, 4.4, 0.11]} c={steel} seg8 />)}
      {[1.2, 3.3].map(y => (
        <group key={y}>
          <Box p={[0, y, 1.3]} s={[2.6, 0.1, 0.1]} c={steel} />
          <Box p={[0, y, -1.3]} s={[2.6, 0.1, 0.1]} c={steel} />
          <Box p={[1.3, y, 0]} s={[0.1, 0.1, 2.6]} c={steel} />
          <Box p={[-1.3, y, 0]} s={[0.1, 0.1, 2.6]} c={steel} />
        </group>
      ))}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((r, i) => (
        <At key={i} r={r}>
          <Box p={[0, 2.25, 1.3]} r={[0, 0, 0.68]} s={[3.2, 0.06, 0.06]} c={steel} />
        </At>
      ))}
      <Cyl p={[0, 4.45, 0]} s={[2.25, 0.16, 2.25]} c={steel} />
      <Cyl p={[0, 6.25, 0]} s={[1.9, 3.5, 1.9]} c={wood} />
      {[4.9, 6.2, 7.5].map(y => <Cyl key={y} p={[0, y, 0]} s={[1.93, 0.09, 1.93]} c={hoop} />)}
      <Cone p={[0, 8.6, 0]} s={[2.1, 1.3, 2.1]} c="#5c4c56" />
      <Ball p={[0, 9.3, 0]} s={0.12} c="#5c4c56" />
      {/* ladder */}
      <Box p={[0.35, 6.3, 1.93]} s={[0.04, 3.6, 0.04]} c={steel} />
      <Box p={[-0.35, 6.3, 1.93]} s={[0.04, 3.6, 0.04]} c={steel} />
      {Array.from({ length: 9 }, (_, i) => <Box key={i} p={[0, 4.7 + i * 0.4, 1.93]} s={[0.7, 0.04, 0.04]} c={steel} />)}
    </At>
  );
};

const ACUnit: React.FC<{ p: Vec3; r?: number }> = ({ p, r = 0 }) => (
  <At p={p} r={r}>
    <Box p={[0, 0.08, 0]} s={[1.9, 0.16, 1.4]} c="#4c4f5c" />
    <Box p={[0, 0.7, 0]} s={[1.8, 1.08, 1.3]} c="#c6c9d3" />
    <mesh geometry={G.circle} material={envMaterial('#2c2e38')} position={[0, 1.245, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.46} />
    <Box p={[0, 1.26, 0]} r={0.5} s={[0.85, 0.03, 0.1]} c="#7d8090" />
    <Box p={[0, 1.26, 0]} r={2.07} s={[0.85, 0.03, 0.1]} c="#7d8090" />
    {[-0.3, -0.1, 0.1, 0.3].map(y => <Box key={y} p={[0, 0.7 + y, 0.655]} s={[1.5, 0.04, 0.02]} c="#8f93a2" />)}
  </At>
);

const Vent: React.FC<{ p: Vec3; h?: number }> = ({ p, h = 0.9 }) => (
  <At p={p}>
    <Cyl p={[0, h / 2, 0]} s={[0.16, h, 0.16]} c="#a9adb9" />
    <Cone p={[0, h + 0.12, 0]} s={[0.32, 0.24, 0.32]} c="#a9adb9" />
  </At>
);

const DoorHut: React.FC<{ p: Vec3; lit: boolean }> = ({ p, lit }) => (
  <At p={p}>
    <Box p={[0, 1.5, 0]} s={[3.4, 3.0, 3.2]} c="#9a7d86" />
    <Box p={[0, 3.08, 0]} s={[3.7, 0.16, 3.5]} c={CAP} />
    <Door p={[0.4, 0, -1.6]} r={Math.PI} c="#5a6f8f" frame="#d9d2c8" />
    {/* lamp over the door */}
    <Box p={[0.4, 2.55, -1.68]} s={[0.34, 0.12, 0.2]} c="#2c2e38" />
    <Box p={[0.4, 2.48, -1.7]} s={[0.26, 0.03, 0.14]} c={lit ? '#fff0c8' : '#d8d2c6'} glow={lit} />
    {lit && <Halo p={[0.4, 2.4, -1.8]} r={0.9} />}
    {lit && <LightPool p={[0.4, -p[1], -2.6]} rx={2.4} rz={1.8} o={0.4} />}
    {/* small window */}
    <mesh geometry={G.plane} material={lit ? flat('#ffd890') : envMaterial('#9fb9cf')} position={[-1.71, 1.8, 0.2]} rotation={[0, -Math.PI / 2, 0]} scale={[0.9, 0.7, 1]} />
    {/* antenna */}
    <Cyl p={[1.0, 5.2, 0.9]} s={[0.04, 4.2, 0.04]} c="#3c3f4c" seg8 />
    {[4.0, 5.0, 6.0].map((y, i) => <Box key={y} p={[1.0, y, 0.9]} s={[0.9 - i * 0.2, 0.03, 0.03]} c="#3c3f4c" />)}
    <Ball p={[1.0, 7.35, 0.9]} s={0.09} c="#ff4a3a" glow />
    {lit && <Halo p={[1.0, 7.35, 0.9]} r={0.5} c="#ff5a40" o={0.6} />}
  </At>
);

const BULB_COLS = ['#ffd27e', '#ff6a5a', '#7fe08a', '#7fc2ff', '#ffe9a8', '#f7a0e0'];
/** Festoon lights hanging between points (each span sags). */
const StringLights: React.FC<{ pts: Vec3[]; on: boolean }> = ({ pts, on }) => {
  const bulbs: React.ReactNode[] = [];
  const wire: React.ReactNode[] = [];
  let k = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
    const n = Math.max(2, Math.round(len / 0.65));
    const sag = 0.06 * len;
    let prev: Vec3 = a;
    for (let j = 1; j <= n; j++) {
      const t = j / n;
      const p: Vec3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t];
      const mid: Vec3 = [(prev[0] + p[0]) / 2, (prev[1] + p[1]) / 2, (prev[2] + p[2]) / 2];
      const d = new THREE.Vector3(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      wire.push(<mesh key={'w' + k} geometry={G.cyl8} material={envMaterial('#26242c')} position={mid} quaternion={q} scale={[0.012, d.length(), 0.012]} />);
      if (j < n) {
        const c = BULB_COLS[k % BULB_COLS.length];
        bulbs.push(<Ball key={'b' + k} p={[p[0], p[1] - 0.09, p[2]]} s={[0.06, 0.08, 0.06]} c={on ? c : mix(c, '#ffffff', 0.5)} glow={on} />);
        if (on) bulbs.push(<sprite key={'h' + k} material={glowMaterial(c, 0.45)} position={[p[0], p[1] - 0.09, p[2]]} scale={[0.55, 0.55, 1]} renderOrder={6} />);
      }
      prev = p;
      k++;
    }
  }
  return <group>{wire}{bulbs}</group>;
};

// ---------------------------------------------------------------------------------------
// Skyline
// ---------------------------------------------------------------------------------------
type SB = { x: number; z: number; w: number; d: number; top: number; c: string; spire: boolean; tank: boolean; crown: string | null };
const SKYLINE: SB[] = (() => {
  const rand = rng(1234);
  const out: SB[] = [];
  const step = 34;
  for (let gx = -6; gx <= 6; gx++)
    for (let gz = -6; gz <= 6; gz++) {
      const x = gx * step + (rand() - 0.5) * 8, z = gz * step + (rand() - 0.5) * 8;
      const r = Math.hypot(x, z);
      const skip = rand() < 0.12;
      if (r < 27 || r > 215 || skip) continue;
      const w = 12 + rand() * 14, d = 12 + rand() * 14;
      let top = -32 + rand() * 38 + Math.min(1, r / 110) * 34; // rises with distance
      if (rand() < 0.1) top += 30; // the odd skyscraper
      if (z < 0 && Math.abs(x) < 60 && r < 70) top = Math.min(top, -8); // keep the front view open
      // keep a clear corridor under the moon
      const az = Math.atan2(x, -z) - Math.atan2(MOON_DIR.x, -MOON_DIR.z);
      if (z < 0 && Math.abs(az) < 0.2) top = Math.min(top, r * 0.14 - 8);
      out.push({ x, z, w, d, top, c: SKY_COLS[Math.floor(rand() * SKY_COLS.length)], spire: top > 30 && rand() < 0.5, tank: top < 12 && rand() < 0.3, crown: top > 20 && rand() < 0.35 ? (rand() < 0.5 ? '#7fe0ff' : '#ffcf7a') : null });
    }
  // landmark tower under the moon
  out.push({ x: 18, z: -175, w: 22, d: 22, top: 62, c: '#8d8aa8', spire: true, tank: false, crown: '#ffcf7a' });
  out.push({ x: -70, z: -140, w: 18, d: 18, top: 48, c: '#7b8fa6', spire: false, tank: false, crown: '#7fe0ff' });
  return out;
})();

const Skyline: React.FC<{ time: string }> = React.memo(({ time }) => {
  const n = nightness(time);
  const lit = n >= 0.75;
  const litFrac = n >= 1 ? 0.55 : n >= 0.75 ? 0.42 : n > 0.3 ? 0.18 : 0;
  const L: Inst[] = [], D: Inst[] = [];
  SKYLINE.forEach((b, i) => {
    const h = b.top - STREET;
    // only the two facades that face our roof
    const fx = b.x < 0 ? { x: b.x + b.w / 2, ry: Math.PI / 2 } : { x: b.x - b.w / 2, ry: -Math.PI / 2 };
    const fz = b.z < 0 ? { z: b.z + b.d / 2, ry: 0 } : { z: b.z - b.d / 2, ry: Math.PI };
    const off = 0.12;
    const common = { h: b.top, y0: STREET + 4, floor: 3.4, col: 2.6, ww: 1.5, wh: 2.0, off, wall: b.c };
    if (h > 6) {
      facadeWindows({ ...common, x: fx.x, z: b.z, ry: fx.ry, w: b.d - 1.2, seed: i * 2 + 1 }, litFrac, L, D, '#8aa3c4');
      facadeWindows({ ...common, x: b.x, z: fz.z, ry: fz.ry, w: b.w - 1.2, seed: i * 2 + 2 }, litFrac, L, D, '#8aa3c4');
    }
  });
  // our own building, below the parapet
  [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((ry, i) => {
    const alongX = i % 2 === 0;
    facadeWindows({ x: alongX ? 0 : Math.sin(ry) * RW / 2, z: alongX ? Math.cos(ry) * RD / 2 : 0, ry, w: (alongX ? RW : RD) - 1.6, h: -2.4, y0: STREET + 4, floor: 3.4, col: 2.4, ww: 1.3, wh: 1.9, off: 0.04, wall: WALL, seed: 900 + i }, litFrac, L, D);
  });
  const roads: React.ReactNode[] = [];
  for (let i = -6; i <= 6; i++) {
    const o = i * 34 + 17;
    roads.push(<mesh key={'rx' + i} geometry={G.plane} material={lit ? flat('#ffb760', 0.55) : decalMaterial('#3a3d4c')} position={[0, STREET + 0.05, o]} rotation={[-Math.PI / 2, 0, 0]} scale={[460, 3, 1]} />);
    roads.push(<mesh key={'rz' + i} geometry={G.plane} material={lit ? flat('#ffb760', 0.55) : decalMaterial('#3a3d4c')} position={[o, STREET + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[3, 460, 1]} />);
  }
  return (
    <group>
      <mesh geometry={G.plane} material={envMaterial('#2c2f40')} position={[0, STREET, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[900, 900, 1]} />
      {roads}
      {SKYLINE.map((b, i) => {
        const h = b.top - STREET;
        return (
          <group key={i}>
            <Box p={[b.x, STREET + h / 2, b.z]} s={[b.w, h, b.d]} c={b.c} shadow={false} />
            <Box p={[b.x, b.top + 0.3, b.z]} s={[b.w + 0.4, 0.6, b.d + 0.4]} c={mix(b.c, '#000', 0.2)} shadow={false} />
            {b.crown && (
              <>
                <Box p={[b.x, b.top + 2.6, b.z]} s={[b.w * 0.7, 4, b.d * 0.7]} c={mix(b.c, '#fff', 0.1)} shadow={false} />
                <Box p={[b.x, b.top + 1.4, b.z]} s={[b.w * 0.7 + 0.1, 0.5, b.d * 0.7 + 0.1]} c={lit ? b.crown : mix(b.c, '#fff', 0.3)} glow={lit} shadow={false} />
              </>
            )}
            {b.spire && (
              <>
                <Cone p={[b.x, b.top + (b.crown ? 4.6 : 0.6) + 5, b.z]} s={[1.2, 10, 1.2]} c={mix(b.c, '#fff', 0.2)} four shadow={false} />
                <mesh geometry={G.sphere} material={flat('#ff4a3a')} position={[b.x, b.top + (b.crown ? 4.6 : 0.6) + 10.2, b.z]} scale={0.35} />
                {lit && <sprite material={glowMaterial('#ff5a40', 0.7)} position={[b.x, b.top + (b.crown ? 4.6 : 0.6) + 10.2, b.z]} scale={[4, 4, 1]} />}
              </>
            )}
            {b.tank && <WaterTower p={[b.x + b.w * 0.2, b.top + 0.6, b.z - b.d * 0.15]} s={0.8} />}
          </group>
        );
      })}
      <WindowSet lit={L} dark={D} k={`sky|${time}`} fogLit={false} />
    </group>
  );
});

const Moon: React.FC<{ dir: THREE.Vector3 }> = ({ dir }) => {
  const p = dir.clone().multiplyScalar(250);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().negate());
  return (
    <group position={p} quaternion={q}>
      <sprite material={glowMaterial('#b8c8ff', 0.5, false)} scale={[110, 110, 1]} renderOrder={-5} />
      <mesh geometry={G.circle} material={skyFlat('#f3ecd6')} scale={15} renderOrder={-4} />
      {[[-5, 4, 3.2], [4.5, -2, 2.4], [-2, -7, 1.8], [6, 6, 1.4], [0.5, 1.5, 1.2]].map(([x, y, r], i) => (
        <mesh key={i} geometry={G.circle} material={skyFlat('#e0d6bd')} position={[x, y, 0.05]} scale={r} renderOrder={-3} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------------------
// Roof
// ---------------------------------------------------------------------------------------
const Roof: React.FC<{ time: string }> = React.memo(({ time }) => {
  const n = nightness(time);
  const on = n >= 0.75;
  const pavers: Inst[] = [];
  for (let i = 0; i < 9; i++) pavers.push({ p: [-8.1 + (i % 2) * 0.05, 0.012, 3.9 - i * 1.15], s: [1.5, 0.024, 1.0] });
  for (let i = 0; i < 6; i++) pavers.push({ p: [-6.6 + i * 1.6, 0.012, -6.4], s: [1.4, 0.024, 1.0] });
  const seams: Inst[] = [];
  for (let i = 1; i < 8; i++) seams.push({ p: [-IN_X + i * (2 * IN_X / 8), 0.004, 0], s: [0.05, 0.008, 2 * IN_Z] });
  return (
    <group>
      {/* building + roof slab + parapet */}
      <Box p={[0, (STREET - 0.3) / 2, 0]} s={[RW, -STREET - 0.3, RD]} c={WALL} />
      <Box p={[0, -0.15, 0]} s={[2 * IN_X, 0.3, 2 * IN_Z]} c={FLOOR} />
      <Instances geo={G.box} mat={decalMaterial('#5a5c70')} items={() => seams} k="seams" />
      {[-1, 1].map(s => (
        <group key={s}>
          <Box p={[0, 0.35, s * (RD / 2 - 0.175)]} s={[RW, 1.3, 0.35]} c={WALL} />
          <Box p={[0, 1.05, s * (RD / 2 - 0.175)]} s={[RW + 0.3, 0.12, 0.6]} c={CAP} />
          <Box p={[s * (RW / 2 - 0.175), 0.35, 0]} s={[0.35, 1.3, RD - 0.7]} c={WALL} />
          <Box p={[s * (RW / 2 - 0.175), 1.05, 0]} s={[0.6, 0.12, RD - 0.95]} c={CAP} />
        </group>
      ))}
      <Instances geo={G.box} mat={decalMaterial('#9c97a6')} items={() => pavers} k="pavers" />
      <DoorHut p={[-8.5, 0, 6.6]} lit={on} />
      <WaterTower p={[7.6, 0, 5.6]} />
      <ACUnit p={[-2.6, 0, 8.4]} />
      <ACUnit p={[-0.4, 0, 8.4]} />
      <ACUnit p={[1.8, 0, 8.4]} />
      {/* duct from the AC bank into the hut */}
      <Box p={[-5.1, 0.55, 8.4]} s={[3.0, 0.6, 0.6]} c="#aeb2bf" />
      <Box p={[-3.75, 0.55, 8.4]} s={[0.2, 0.7, 0.7]} c="#8f93a2" />
      <Vent p={[-11.2, 0, -3.0]} />
      <Vent p={[-11.2, 0, -1.6]} h={0.6} />
      <Vent p={[11.4, 0, 0.8]} h={1.2} />
      <Vent p={[3.6, 0, 1.2]} h={0.5} />
      {/* satellite dish */}
      <At p={[11.0, 0, -6.2]} r={-0.6}>
        <Cyl p={[0, 0.5, 0]} s={[0.06, 1.0, 0.06]} c="#5c6070" seg8 />
        <mesh geometry={G.sphere} material={envMaterial('#dfe2ea')} position={[0, 1.15, 0.05]} rotation={[-0.9, 0, 0]} scale={[0.6, 0.6, 0.16]} castShadow receiveShadow />
      </At>
      {/* lounge corner */}
      <Table p={[-3.4, 0, 2.6]} round w={0.9} h={0.72} c="#e9e2d2" />
      <Chair p={[-4.2, 0, 2.5]} r={Math.PI / 2 + 0.3} c="#d8433a" />
      <Chair p={[-2.6, 0, 2.7]} r={-Math.PI / 2 - 0.2} c="#2f7a5a" />
      <Plant p={[-11.6, 0, 8.6]} s={1.6} />
      <Plant p={[-11.6, 0, 6.8]} s={1.3} leaf="#5aa54a" />
      <Plant p={[-6.4, 0, 8.7]} s={1.2} pot="#8a5a3c" />
      {/* string-light poles + lights */}
      <Cyl p={[5.4, 1.6, -5.2]} s={[0.05, 3.2, 0.05]} c="#3c3f4c" seg8 />
      <Cyl p={[-11.6, 1.6, -7.6]} s={[0.05, 3.2, 0.05]} c="#3c3f4c" seg8 />
      <StringLights pts={[[-6.9, 2.9, 4.95], [5.4, 3.15, -5.2], [6.3, 4.2, 4.3]]} on={on} />
      <StringLights pts={[[-6.9, 2.9, 4.95], [-11.6, 3.15, -7.6]]} on={on} />
    </group>
  );
});

const RooftopScene: React.FC<{ time: string }> = ({ time }) => {
  const isNight = nightness(time) >= 1;
  const pal = PALETTES[time];
  // with a palette that already draws a moon disc in the sky (stock `night`), sit on top of it
  const dir = time !== 'rooftopNight' && pal?.sun ? new THREE.Vector3(...pal.sun.dir).normalize() : MOON_DIR;
  return (
    <group>
      <Roof time={time} />
      <Skyline time={time} />
      {isNight && <Moon dir={dir} />}
    </group>
  );
};

export const RooftopSet: React.FC<SetProps> = ({ time }) => <RooftopScene time={time} />;

export const ROOFTOP_MARKS: Record<string, Vec3> = {
  center: [0, 0, -2], // open roof, moon side ahead (-z)
  ledge: [1.5, 0, -8.9], // at the front parapet (rot 180 looks out over the city, rot 0 faces back)
  onLedge: [4.5, 1.11, -9.83], // standing ON the parapet cap (danger shot)
  door: [-8.1, 0, 4.2], // just outside the stair door (door faces -z)
  waterTower: [6.2, 0, 2.2], // in front of the water tower
  acUnits: [-0.4, 0, 6.6], // in front of the AC bank
  lounge: [-3.4, 0, 1.6], // by the little table + chairs
  corner: [11.2, 0, -8.4], // front-right corner by the satellite dish
};
