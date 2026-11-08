// Apartment street for the fire set piece: a five-storey pastel apartment block with balconies,
// facing a two-lane street. The middle flat on the 4th floor (level 3) is on fire: flames in its
// balcony doorway and window, soot on the wall, smoke pouring up the facade. Neighbouring blocks
// on both sides, a row of buildings across the street, towers behind.
//
// Layout (metres, y up):
//   road (asphalt, top y = 0)       |z| < 5, yellow centre dashes
//   sidewalks (top y = 0.15)        5 < |z| < 9.5
//   block front                     z = -9.5, x ∈ [-14, 14], floors every 3 m from y = 0.15
//   balconies (levels 1–4)          bays x = -8, 0, 8; 3.0 m wide, 1.4 m deep (front rail z = -8.1)
//   fire                            level 3 (floor y = 9.15), bay 0 doorway + window at x = 4
import React from 'react';
import { envMaterial } from '../engine/materials';
import { Glow } from '../engine/fx';
import type { Vec3 } from '../types';
import type { SetProps } from './index';
import { At, Box, Building, Car, G, mix, Plane, Tree } from './kit';
import { CityLamp, decalMaterial, Hydrant, Inst, Instances, lampsOn, nightness, TrashCan } from './outdoorKit';
import { Smoke, WorldProp } from './props';

const WALK_Y = 0.15;
const FRONT = -9.5;
const FLOOR = 3;
const LEVELS = 5;
const HALF_W = 14;
const BAYS = [-8, 0, 8];
const WIN_X = [-12, -4, 4, 12];
const BAL_W = 3.0, BAL_D = 1.4;
const FIRE_LEVEL = 3;
const fy = (k: number) => WALK_Y + k * FLOOR;
const WALL = '#e6c9a8', BAND = '#cfae8b', PLINTH = '#b98f74', TRIM = '#f4ede2', RAIL = '#3d4150';
const GLASS = '#7f9bb8';

/** Railing bars of every balcony (one instanced mesh). */
function railItems(): Inst[] {
  const out: Inst[] = [];
  for (let k = 1; k < LEVELS; k++)
    for (const bx of BAYS) {
      const y = fy(k) + 0.5, zf = FRONT + BAL_D;
      for (let i = 0; i <= 14; i++) out.push({ p: [bx - BAL_W / 2 + (i * BAL_W) / 14, y, zf - 0.03], s: [0.035, 1.0, 0.035] });
      for (const sx of [-1, 1]) for (let i = 1; i <= 6; i++) out.push({ p: [bx + sx * (BAL_W / 2 - 0.02), y, FRONT + (i * BAL_D) / 7], s: [0.035, 1.0, 0.035] });
    }
  return out;
}

const Balcony: React.FC<{ x: number; k: number }> = ({ x, k }) => {
  const y = fy(k), zf = FRONT + BAL_D;
  return (
    <group>
      <Box p={[x, y - 0.1, FRONT + BAL_D / 2]} s={[BAL_W, 0.2, BAL_D]} c={TRIM} />
      <Box p={[x, y + 1.02, zf - 0.03]} s={[BAL_W + 0.04, 0.06, 0.07]} c={RAIL} />
      {[-1, 1].map(s => <Box key={s} p={[x + s * (BAL_W / 2 - 0.02), y + 1.02, FRONT + BAL_D / 2]} s={[0.07, 0.06, BAL_D]} c={RAIL} />)}
    </group>
  );
};

/** One window or balcony door on the facade: frame + glass (or a burning opening). */
const Opening: React.FC<{ x: number; y: number; w: number; h: number; fire?: boolean; lit?: boolean }> = ({ x, y, w, h, fire, lit }) => (
  <group>
    <Box p={[x, y + h / 2, FRONT + 0.03]} s={[w + 0.24, h + 0.24, 0.06]} c={fire ? '#2b2526' : TRIM} />
    <Plane p={[x, y + h / 2, FRONT + 0.07]} s={[w, h, 1]} c={fire ? '#ff7a2a' : lit ? '#ffd27e' : GLASS} glow={fire || lit} />
    {!fire && <Box p={[x, y + h / 2, FRONT + 0.08]} s={[0.05, h, 0.02]} c={TRIM} />}
  </group>
);

const Facade: React.FC<{ night: boolean; t: number }> = React.memo(({ night }) => {
  const parts: React.ReactNode[] = [];
  for (let k = 0; k < LEVELS; k++) {
    const y = fy(k);
    if (k > 0) parts.push(<Box key={`band${k}`} p={[0, y - 0.08, FRONT + 0.06]} s={[HALF_W * 2 + 0.1, 0.16, 0.14]} c={BAND} />);
    WIN_X.forEach((x, j) => {
      const fire = k === FIRE_LEVEL && x === 4;
      if (k === 0 && x === -4) return; // the entrance takes this slot
      parts.push(<Opening key={`w${k}-${j}`} x={x} y={y + 0.85} w={1.5} h={1.5} fire={fire} lit={night && (k * 7 + j * 3) % 5 === 1} />);
    });
    BAYS.forEach((x, j) => {
      const fire = k === FIRE_LEVEL && x === 0;
      if (k === 0) parts.push(<Opening key={`s${j}`} x={x} y={y + 0.3} w={2.4} h={2.0} lit={night} />);
      else parts.push(<Opening key={`d${k}-${j}`} x={x} y={y} w={1.7} h={2.25} fire={fire} lit={night && (k + j) % 3 === 0} />);
    });
  }
  return (
    <group>
      {/* the block */}
      <Box p={[0, WALK_Y + (LEVELS * FLOOR) / 2, FRONT - 5.75]} s={[HALF_W * 2, LEVELS * FLOOR, 11.5]} c={WALL} />
      <Box p={[0, WALK_Y + 1.6, FRONT + 0.05]} s={[HALF_W * 2 + 0.1, 3.2, 0.12]} c={PLINTH} />
      <Box p={[0, WALK_Y + LEVELS * FLOOR + 0.3, FRONT - 5.75]} s={[HALF_W * 2 + 0.4, 0.6, 11.9]} c={BAND} />
      {parts}
      {/* entrance: door, canopy, number */}
      <Box p={[-4, WALK_Y + 1.15, FRONT + 0.08]} s={[1.6, 2.3, 0.08]} c="#3d5c86" />
      <Box p={[-4, WALK_Y + 2.55, FRONT + 0.6]} s={[2.4, 0.12, 1.2]} c="#2f6b4f" />
      {BAYS.map(x => [1, 2, 3, 4].map(k => <Balcony key={`b${x}${k}`} x={x} k={k} />))}
      <Instances geo={G.box} mat={envMaterial(RAIL)} items={railItems} k="aptRails" cast />
      {/* soot above the burning openings */}
      <Plane p={[0, fy(FIRE_LEVEL) + 2.75, FRONT + 0.09]} s={[2.4, 1.1, 1]} c="#2e2a2d" />
      <Plane p={[4, fy(FIRE_LEVEL) + 2.75, FRONT + 0.09]} s={[2.0, 1.3, 1]} c="#2e2a2d" />
    </group>
  );
});

const Street: React.FC = React.memo(() => {
  const dashes: Inst[] = [];
  for (let x = -120; x <= 120; x += 6) dashes.push({ p: [x, 0.006, 0], s: [3, 0.012, 0.14] });
  return (
    <group>
      <mesh geometry={G.plane} material={envMaterial('#474a55')} rotation={[-Math.PI / 2, 0, 0]} scale={[600, 600, 1]} receiveShadow />
      <Instances geo={G.box} mat={decalMaterial('#f2c94c')} items={() => dashes} k="aptDash" />
      {[-1, 1].map(s => (
        <group key={s}>
          <Box p={[0, WALK_Y / 2, s * 7.25]} s={[300, WALK_Y, 4.5]} c="#d4cdc0" />
          <Box p={[0, WALK_Y / 2 + 0.01, s * 5.05]} s={[300, WALK_Y + 0.02, 0.18]} c="#b6afa3" />
        </group>
      ))}
    </group>
  );
});

/** Neighbours: lower blocks either side, a row across the street (facing -z), towers behind. */
const Neighbours: React.FC = React.memo(() => {
  const side: [number, number, number, string][] = [[-21, 12, 10.5, '#a9b6c8'], [21, 12, 12.2, '#c9b7cf'], [-34.5, 14, 8.6, '#d6cbb8'], [34.5, 14, 13.4, '#9fb1c6'], [-48, 12, 11, '#c4bdd0'], [48, 12, 9.4, '#d9bfae']];
  const across: [number, number, number, string][] = [[-26, 13, 9, '#bfc6cf'], [-12, 13, 12, '#d6cbb8'], [2, 13, 8, '#a9a7c2'], [16, 13, 13, '#c9d2c0'], [30, 13, 10, '#e0d3bd']];
  return (
    <group>
      {side.map(([x, w, h, c], i) => <Building key={'s' + i} p={[x, 0, FRONT - 6]} w={w} d={12} h={h} c={c} seed={i + 3} />)}
      {across.map(([x, w, h, c], i) => (
        <At key={'a' + i} p={[x, 0, 9.5 + 6]} r={Math.PI}>
          <Building w={w} d={12} h={h} c={c} seed={i + 11} />
        </At>
      ))}
      {[-40, -22, -6, 10, 26, 42].map((x, i) => <Building key={'t' + i} p={[x, 0, -48]} w={12} d={12} h={24 + ((i * 7) % 5) * 4} c={mix('#9c9ab8', '#c2bccd', (i % 3) / 2)} seed={i + 21} />)}
    </group>
  );
});

export const Apartments: React.FC<SetProps> = ({ t, time }) => {
  const night = nightness(time) >= 0.6;
  const on = lampsOn(time);
  const fireY = fy(FIRE_LEVEL);
  return (
    <group>
      <Street />
      <Facade night={night} t={0} />
      <Neighbours />
      {[-11, 11, -25, 25].map(x => <Tree key={x} p={[x, WALK_Y, -6.6]} s={1.1} />)}
      {[-18, 10, 22].map(x => <Tree key={'f' + x} p={[x, WALK_Y, 6.9]} s={1.0} kind={x === 10 ? 'autumn' : 'round'} />)}
      {[-17, 17].map(x => <CityLamp key={x} p={[x, WALK_Y, -5.7]} on={on} />)}
      <Hydrant p={[5.6, WALK_Y, -6.1]} />
      <TrashCan p={[-6.6, WALK_Y, -6.2]} />
      {[[-20, 4.2, -1], [-12.5, 4.2, -1], [24, 4.2, 1]].map(([x, z, d], i) => <Car key={i} p={[x, 0, z]} r={(d * Math.PI) / 2} c={['#3d6fb6', '#e9e4da', '#4e9a6b'][i]} />)}
      {/* the fire: flames in the balcony doorway and the window, glow, smoke up the facade */}
      <WorldProp spec={{ type: 'fire', pos: [-0.35, fireY + 0.02, FRONT - 0.4], size: 0.75 }} t={t} />
      <WorldProp spec={{ type: 'fire', pos: [0.45, fireY + 0.02, FRONT - 0.5], size: 0.6, seed: 1.7 }} t={t} />
      <WorldProp spec={{ type: 'fire', pos: [4, fireY + 0.85, FRONT - 0.3], size: 0.6, seed: 3 }} t={t} />
      <Glow p={[0, fireY + 1.2, FRONT + 0.4]} size={4.2} color="#ff7a2f" opacity={0.45} />
      <Glow p={[4, fireY + 1.6, FRONT + 0.4]} size={3.4} color="#ff7a2f" opacity={0.4} />
      <group position={[0, fireY + 2.1, FRONT + 0.45]}>
        <Smoke t={t} h={11} r={0.75} n={46} wind={[0.18, 0.06]} speed={1.2} seed={2} out={0.9} />
      </group>
      {/* smoke pressing down under the balcony ceiling, just above standing head height: clear air near the floor */}
      <group position={[0, fireY + 1.95, FRONT + 0.25]}>
        <Smoke t={t + 1.3} h={0.9} r={0.36} n={30} wind={[0.0, 0.8]} speed={0.3} seed={9} out={0.7} />
      </group>
      <group position={[4, fireY + 2.25, FRONT + 0.4]}>
        <Smoke t={t + 3.7} h={10} r={0.6} n={36} wind={[0.22, 0.05]} speed={1.1} seed={5} out={0.7} />
      </group>
    </group>
  );
};

/** Where the ladder truck parks (rot 0, cab toward -x) and its ladder pivot (turntable top). */
export const APT_TRUCK: Vec3 = [9, 0, -2.4];
export const APT_PIVOT: Vec3 = [APT_TRUCK[0] + 2.6, 2.75, APT_TRUCK[2]];

export const APARTMENTS_MARKS: Record<string, Vec3> = {
  street: [0, WALK_Y, -6.6], // sidewalk under the burning balcony (rot 180 looks up at it, rot 0 faces the road)
  crowd: [0, WALK_Y, 7.2], // far sidewalk, across the road
  balcony: [0, fy(FIRE_LEVEL), FRONT + 0.8], // on the burning 4th-floor balcony
  doorway: [0, fy(FIRE_LEVEL), FRONT + 0.25], // right in front of the burning balcony door
  truck: APT_TRUCK,
  pivot: APT_PIVOT,
  road: [0, 0, 0],
};
