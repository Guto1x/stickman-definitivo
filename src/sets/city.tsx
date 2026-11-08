// Downtown street that tiles forever along X (like the suburb), IFOLOGY "10x Faster" downtown look:
// simple tall pastel-grey towers, shop fronts with striped awnings and signs, a wide 4-lane road with
// a zebra crossing every block, and (block k = 0 only) a parking lot with orange cones on the +z side.
//
// Layout (metres, y up):
//   road (asphalt, top y = 0)       |z| < 6, yellow double centre line, lane dashes at z = ±3
//   sidewalks (top y = 0.15)        6 < |z| < 10.5
//   building fronts                 |z| = 10.5 (shops on the ground floor, windows above)
//   zebra crossing                  x = k·40 + 12 (x ∈ [10, 14] in block 0)
//   parking lot (block 0, y = 0)    x ∈ [-18, 18], z ∈ [11, 32]; tall towers behind it at z ≥ 36
import React from 'react';
import * as THREE from 'three';
import { envMaterial, flat } from '../engine/materials';
import type { Vec3 } from '../types';
import type { SetProps } from './index';
import { At, Box, Car, Door, G, mix, rng, Sign } from './kit';
import {
  CityLamp, decalMaterial, facadeWindows, Hydrant, Inst, Instances, lampsOn, mapMaterial, nightness, ParkingSign, PlanterTree, TrafficCone, TrafficLight, TrashCan, WindowSet,
} from './outdoorKit';

export const CITY_SEG = 40;
const FRONT = 10.5; // building front line
const WALK_Y = 0.15; // sidewalk top
const CROSS_X = 12; // zebra crossing (local to block)
const STREET_POOLS: [number, number, number, number, number][] = [[0, -WALK_Y, 1.55, 3.4, 3.0], [0, 0, -1.5, 3.0, 1.75]];

const WALLS = ['#a9a7c2', '#c4bdd0', '#d6cbb8', '#9fb1c6', '#bfc6cf', '#d9bfae', '#b6b0a6', '#c9d2c0', '#e0d3bd', '#8f9ab3'];
const TOWERS = ['#9c9ab8', '#b3b0c9', '#a6b4c6', '#c2bccd', '#8e98b0', '#bdb6c4'];
const SHOPS = ['CAFE', 'PIZZA', 'BOOKS', 'BAKERY', 'FLOWERS', 'DONUTS', 'MARKET', 'SHOES', 'TOYS', 'DINER', 'BURGERS', 'GYM', 'SUSHI', 'TACOS', 'NOODLES', 'DELI', 'ARCADE', 'ICE CREAM'];
const SIGN_BG = ['#1f2a44', '#b8342c', '#2f6b4f', '#f4ead6', '#5a3d8a', '#d9822b', '#2d63b8'];
const AWNINGS: [string, string][] = [['#d8433a', '#f6f1e6'], ['#2f7a5a', '#f6f1e6'], ['#2d63b8', '#f6f1e6'], ['#f2b632', '#f6f1e6'], ['#7a4fa0', '#f6f1e6'], ['#e46f8e', '#f6f1e6'], ['#20283c', '#e9c46a']];
const CARS = ['#c8402f', '#3d6fb6', '#e9e4da', '#2b2f3a', '#f2b632', '#4e9a6b', '#e9e4da'];

// Striped canvas texture for awnings (cached by colours/count).
const stripeCache = new Map<string, THREE.CanvasTexture>();
function stripes(a: string, b: string, n: number) {
  const key = `${a}${b}${n}`;
  let t = stripeCache.get(key);
  if (!t) {
    const c = document.createElement('canvas');
    c.width = 64 * n;
    c.height = 8;
    const g = c.getContext('2d')!;
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? b : a;
      g.fillRect(i * 64, 0, 64, 8);
    }
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    stripeCache.set(key, t);
  }
  return t;
}

const AW_TILT = 0.32;
/** Striped awning (local: wall at z = 0, top edge at y = 0, projects to +z). */
const Awning: React.FC<{ w: number; cols: [string, string] }> = ({ w, cols }) => {
  const n = Math.max(4, Math.round(w / 0.55) | 1);
  const m = mapMaterial(stripes(cols[0], cols[1], n));
  const d = 1.45;
  const yF = -Math.sin(AW_TILT) * d, zF = Math.cos(AW_TILT) * d;
  return (
    <group>
      <mesh geometry={G.box} material={m} position={[0, yF / 2, zF / 2]} rotation={[AW_TILT, 0, 0]} scale={[w, 0.05, d]} castShadow receiveShadow />
      <mesh geometry={G.box} material={m} position={[0, yF - 0.16, zF]} scale={[w, 0.32, 0.04]} castShadow receiveShadow />
    </group>
  );
};

/** Ground-floor shop (local: facade plane z = 0, facing +z). */
const ShopFront: React.FC<{ w: number; seed: number; night: boolean; wall: string }> = ({ w, seed, night, wall }) => {
  const rand = rng(seed * 17 + 5);
  const name = SHOPS[Math.floor(rand() * SHOPS.length)];
  const bg = SIGN_BG[Math.floor(rand() * SIGN_BG.length)];
  const fg = bg === '#f4ead6' ? '#2a2f45' : '#ffffff';
  const aw = AWNINGS[Math.floor(rand() * AWNINGS.length)];
  const hasAwning = rand() < 0.75;
  const doorLeft = rand() < 0.5;
  const sw = w - 0.8; // usable width
  const dx = (doorLeft ? -1 : 1) * (sw / 2 - 0.75);
  const gw = sw - 1.9, gx = doorLeft ? 0.95 : -0.95; // display glass
  const frame = mix(wall, '#2a2a33', 0.55);
  const glass = night ? '#ffd890' : '#a9cbe0';
  const signW = Math.min(sw * 0.62, 1.0 + name.length * 0.42);
  return (
    <group>
      {/* display window on a low plinth */}
      <Box p={[gx, 0.25, 0.07]} s={[gw + 0.2, 0.5, 0.14]} c={frame} />
      <mesh geometry={G.plane} material={night ? flat(glass) : envMaterial(glass)} position={[gx, 1.775, 0.03]} scale={[gw, 2.45, 1]} receiveShadow={!night} />
      {!night && (
        <>
          <mesh geometry={G.plane} material={flat('#ffffff', 0.35)} position={[gx - gw * 0.22, 1.85, 0.04]} rotation={[0, 0, 0.7]} scale={[0.16, 1.5, 1]} />
          <mesh geometry={G.plane} material={flat('#ffffff', 0.3)} position={[gx - gw * 0.22 + 0.32, 1.8, 0.04]} rotation={[0, 0, 0.7]} scale={[0.07, 1.2, 1]} />
        </>
      )}
      <Box p={[gx, 3.03, 0.06]} s={[gw + 0.2, 0.1, 0.12]} c={frame} />
      <Box p={[gx - gw / 2, 1.775, 0.06]} s={[0.1, 2.55, 0.12]} c={frame} />
      <Box p={[gx + gw / 2, 1.775, 0.06]} s={[0.1, 2.55, 0.12]} c={frame} />
      {gw > 3.4 && <Box p={[gx, 1.775, 0.06]} s={[0.07, 2.45, 0.08]} c={frame} />}
      {/* door: glass panel in a dark frame */}
      <Door p={[dx, 0.0, 0.0]} c={night ? '#e9b65a' : mix(frame, '#8fb3cc', 0.45)} frame={frame} />
      {/* sign band */}
      <Box p={[0, 3.75, 0.1]} s={[sw + 0.3, 0.95, 0.2]} c={mix(wall, '#000', 0.12)} />
      <Sign p={[0, 3.75, 0.205]} w={signW} h={0.72} text={name} bg={bg} fg={fg} />
      {hasAwning && (
        <group position={[gx, 3.18, 0.0]}>
          <Awning w={gw + 0.4} cols={aw} />
        </group>
      )}
    </group>
  );
};

type Bld = { x: number; w: number; h: number; d: number; c: string; seed: number; shop: boolean; setback: boolean };

/** Lay buildings shoulder to shoulder across one block side. */
function packBlock(x0: number, seed: number, hMin: number, hMax: number, shop = true): Bld[] {
  const rand = rng(seed);
  const out: Bld[] = [];
  let x = x0 - CITY_SEG / 2;
  const end = x0 + CITY_SEG / 2;
  let i = 0;
  while (x < end - 0.5) {
    let w = 7 + Math.floor(rand() * 4) * 2;
    if (end - (x + w) < 6) w = end - x;
    const h = hMin + Math.floor(rand() * ((hMax - hMin) / 3.2 + 1)) * 3.2;
    out.push({ x: x + w / 2, w, h, d: 14, c: WALLS[Math.floor(rand() * WALLS.length)], seed: seed * 10 + i, shop, setback: h > 24 && rand() < 0.6 });
    x += w;
    i++;
  }
  return out;
}

/** One building (local: facade at z = 0 facing +z, body to -d). Windows are emitted separately. */
const CityBuilding: React.FC<{ b: Bld; night: boolean }> = ({ b, night }) => {
  const trim = mix(b.c, '#ffffff', 0.35);
  return (
    <group>
      <Box p={[0, b.h / 2, -b.d / 2]} s={[b.w, b.h, b.d]} c={b.c} />
      <Box p={[0, b.h + 0.22, -b.d / 2 + 0.1]} s={[b.w, 0.44, b.d + 0.2]} c={mix(b.c, '#000', 0.18)} />
      <Box p={[0, 4.62, 0.1]} s={[b.w, 0.22, 0.2]} c={trim} />
      {b.setback && (
        <>
          <Box p={[0, b.h + 3.6, -b.d / 2]} s={[b.w * 0.66, 7.2, b.d * 0.66]} c={mix(b.c, '#ffffff', 0.1)} />
          <Box p={[0, b.h + 7.4, -b.d / 2]} s={[b.w * 0.66 + 0.2, 0.4, b.d * 0.66 + 0.2]} c={mix(b.c, '#000', 0.18)} />
        </>
      )}
      {b.shop && <group position={[0, WALK_Y, 0]}><ShopFront w={b.w} seed={b.seed} night={night} wall={b.c} /></group>}
    </group>
  );
};

/** Background tower (facade at local z = 0 facing +z). */
const Tower: React.FC<{ w: number; h: number; d: number; c: string; crown?: boolean; lit: boolean }> = ({ w, h, d, c, crown, lit }) => (
  <group>
    <Box p={[0, h / 2, -d / 2]} s={[w, h, d]} c={c} shadow={false} />
    <Box p={[0, h + 0.3, -d / 2]} s={[w + 0.4, 0.6, d + 0.4]} c={mix(c, '#000', 0.18)} shadow={false} />
    {crown && (
      <>
        <Box p={[0, h + 2.5, -d / 2]} s={[w * 0.5, 4, d * 0.5]} c={mix(c, '#ffffff', 0.12)} shadow={false} />
        <Box p={[0, h + 7, -d / 2]} s={[0.25, 6, 0.25]} c="#5b5e6c" shadow={false} />
        <mesh geometry={G.sphere} material={lit ? flat('#ff4a3a') : envMaterial('#c84a3a')} position={[0, h + 10.1, -d / 2]} scale={0.22} />
      </>
    )}
  </group>
);

/** A block side: street buildings + background towers, with all their windows instanced. */
const BlockSide: React.FC<{ k: number; side: 1 | -1; time: string; lot?: boolean }> = React.memo(({ k, side, time, lot }) => {
  const x0 = k * CITY_SEG;
  const n = nightness(time);
  const night = n > 0.3; // shop windows lit from golden hour on
  const litFrac = n >= 1 ? 0.5 : n >= 0.75 ? 0.38 : n > 0.3 ? 0.14 : 0;
  const seed = Math.abs(k * 7919 + (side > 0 ? 3 : 11));
  // back side (side = -1, z < 0) is the detailed "hero" side with taller buildings
  const blds = lot ? [] : side < 0 ? packBlock(x0, seed, 11.2, 33.6) : packBlock(x0, seed, 8, 14.4);
  const rand = rng(seed + 5);
  const towers: { x: number; z: number; w: number; h: number; d: number; c: string; crown: boolean }[] = [];
  if (lot) {
    // tall grey backdrop behind the parking lot (fixed so the lot shot is always the same)
    towers.push({ x: x0 - 13, z: 37, w: 16, h: 52.8, d: 16, c: TOWERS[0], crown: false });
    towers.push({ x: x0 + 3, z: 46, w: 18, h: 72, d: 16, c: TOWERS[2], crown: true });
    towers.push({ x: x0 + 15, z: 37, w: 14, h: 43.2, d: 16, c: TOWERS[3], crown: false });
    towers.push({ x: x0 - 1, z: 38, w: 12, h: 33.6, d: 14, c: TOWERS[5], crown: false });
  } else {
    for (let i = 0; i < 2; i++) {
      const w = 14 + rand() * 6;
      towers.push({ x: x0 - 10 + i * 20 + (rand() - 0.5) * 4, z: 44 + i * 9 + rand() * 6, w, h: 36 + Math.floor(rand() * 10) * 4.8, d: 16, c: TOWERS[Math.floor(rand() * TOWERS.length)], crown: rand() < 0.35 });
    }
  }
  const ry = side < 0 ? 0 : Math.PI;
  const zw = (dist: number) => (side < 0 ? -dist : dist);
  const lit: Inst[] = [], dark: Inst[] = [];
  blds.forEach(b => {
    facadeWindows({ x: b.x, z: zw(FRONT), ry, w: b.w - 0.6, h: b.h, y0: 5.3, wall: b.c, seed: b.seed }, litFrac, lit, dark);
    if (b.setback) facadeWindows({ x: b.x, z: zw(FRONT + b.d * 0.17), ry, w: b.w * 0.66 - 0.6, h: b.h + 7.2, y0: b.h + 0.9, wall: b.c, seed: b.seed + 1 }, litFrac, lit, dark);
  });
  towers.forEach((t, i) => facadeWindows({ x: t.x, z: zw(t.z), ry, w: t.w - 1, h: t.h, y0: 2, col: 2.6, floor: 3.6, ww: 1.6, wh: 2.2, off: 0.08, wall: t.c, seed: seed + 100 + i }, litFrac * 1.1, lit, dark, '#9ab3cf'));
  return (
    <group>
      {blds.map((b, i) => (
        <At key={i} p={[b.x, 0, zw(FRONT)]} r={ry}>
          <CityBuilding b={b} night={night} />
        </At>
      ))}
      {towers.map((t, i) => (
        <At key={'t' + i} p={[t.x, 0, zw(t.z)]} r={ry}>
          <Tower w={t.w} h={t.h} d={t.d} c={t.c} crown={t.crown} lit={night} />
        </At>
      ))}
      <WindowSet lit={lit} dark={dark} k={`${k}|${side}|${time}|${lot ? 1 : 0}`} />
    </group>
  );
});

/** Parking lot (block 0, +z side). Stalls in two rows facing an aisle; cones in the aisle. */
const ParkingLot: React.FC<{ night: boolean }> = React.memo(({ night }) => {
  const rand = rng(77);
  const lines: Inst[] = [];
  const cars: React.ReactNode[] = [];
  const rows = [{ z0: 11.4, z1: 16.8, face: 1 }, { z0: 25.6, z1: 31.0, face: -1 }];
  rows.forEach((row, ri) => {
    for (let i = 0; i <= 12; i++) {
      const x = -16.8 + i * 2.8;
      lines.push({ p: [x, 0.006, (row.z0 + row.z1) / 2], s: [0.12, 0.012, row.z1 - row.z0] });
      if (i < 12 && rand() < (ri === 0 ? 0.42 : 0.6)) {
        const cx = x + 1.4;
        if (ri === 0 && Math.abs(cx) < 4) continue; // keep the camera lane open
        cars.push(<Car key={`${ri}-${i}`} p={[cx, 0, (row.z0 + row.z1) / 2 + row.face * 0.2]} r={row.face > 0 ? Math.PI : 0} c={CARS[Math.floor(rand() * CARS.length)]} />);
      }
    }
    lines.push({ p: [0, 0.006, row.face > 0 ? row.z0 : row.z1], s: [33.6, 0.012, 0.12] });
  });
  // arrows/aisle edge line
  lines.push({ p: [0, 0.006, 21.2], s: [30, 0.012, 0.12] });
  const cones: Vec3[] = [[-2.6, 0, 19.0], [-0.6, 0, 18.6], [1.6, 0, 19.2], [3.6, 0, 18.8], [5.8, 0, 19.4], [8.2, 0, 23.4], [9.4, 0, 22.2]];
  return (
    <group>
      <Instances geo={G.box} mat={decalMaterial('#efece4')} items={() => lines} k="lotlines" />
      {cars}
      {cones.map((p, i) => <TrafficCone key={i} p={p} r={i * 0.7} />)}
      {/* lot lights */}
      {[-11, 11].map(x => (
        <group key={x}>
          <CityLamp p={[x, 0, 21.2]} r={0} on={night} />
          <CityLamp p={[x, 0, 21.2]} r={Math.PI} on={night} />
        </group>
      ))}
      {/* back wall with a strip of hedge */}
      <Box p={[0, 0.45, 33.2]} s={[40, 0.9, 0.4]} c="#b9b2a6" />
      <Box p={[0, 0.94, 33.2]} s={[40.2, 0.08, 0.5]} c="#d6d0c4" />
      {/* side kerbs */}
      {[-19.6, 19.6].map(x => <Box key={x} p={[x, 0.08, 21.8]} s={[0.4, 0.16, 22.6]} c="#c9c3b6" />)}
      {/* pay booth */}
      <At p={[16.5, 0, 21.2]}>
        <Box p={[0, 1.3, 0]} s={[2.0, 2.6, 2.0]} c="#e9e2d2" />
        <Box p={[0, 2.68, 0]} s={[2.4, 0.16, 2.4]} c="#2f5f8a" />
        <mesh geometry={G.plane} material={night ? flat('#ffd890') : envMaterial('#a9cbe0')} position={[-1.005, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[1.4, 1.0, 1]} />
        <Box p={[-1.05, 1.05, 0]} s={[0.12, 0.08, 1.5]} c="#c9c3b6" />
      </At>
      <ParkingSign p={[-17.5, 0, 11.6]} r={0} />
    </group>
  );
});

/** One 40 m block: road, sidewalks, furniture, both building rows. */
const Block: React.FC<{ k: number; time: string }> = React.memo(({ k, time }) => {
  const x0 = k * CITY_SEG;
  const xs = x0 - CITY_SEG / 2;
  const rand = rng(Math.abs(k * 131 + 17));
  const night = lampsOn(time);
  const marks: Inst[] = []; // white road paint
  const yellow: Inst[] = [];
  const cx = x0 + CROSS_X;
  // centre double line + lane dashes, broken at the crossing
  [[xs, cx - 2.6], [cx + 2.6, xs + CITY_SEG]].forEach(([a, b]) => {
    [-0.14, 0.14].forEach(z => yellow.push({ p: [(a + b) / 2, 0.006, z], s: [b - a, 0.012, 0.12] }));
    [-3, 3].forEach(z => {
      for (let x = Math.ceil(a / 6) * 6; x + 3 <= b; x += 6) marks.push({ p: [x + 1.5, 0.006, z], s: [3, 0.012, 0.13] });
    });
    [-5.6, 5.6].forEach(z => marks.push({ p: [(a + b) / 2, 0.006, z], s: [b - a, 0.012, 0.13] }));
  });
  // zebra
  for (let i = 0; i < 10; i++) marks.push({ p: [cx, 0.007, -5.1 + i * 1.133], s: [4, 0.014, 0.6] });
  marks.push({ p: [cx - 2.9, 0.006, -3], s: [0.4, 0.012, 5.8] });
  marks.push({ p: [cx + 2.9, 0.006, 3], s: [0.4, 0.012, 5.8] });
  // sidewalk joints
  const joints: Inst[] = [];
  [-1, 1].forEach(sd => {
    for (let i = 0; i < CITY_SEG / 2.5; i++) joints.push({ p: [xs + i * 2.5, WALK_Y + 0.002, sd * 8.3], s: [0.04, 0.004, 4.3] });
    joints.push({ p: [x0, WALK_Y + 0.002, sd * 6.75], s: [CITY_SEG, 0.004, 0.04] });
  });
  const parked: React.ReactNode[] = [];
  [-1, 1].forEach(sd => {
    for (let i = 0; i < 3; i++) {
      const x = xs + 4 + i * 12 + rand() * 4;
      if (Math.abs(x - cx) < 5) continue;
      if (k === 0 && sd < 0 && x < 9) continue; // keep the hero sidewalk + down-street cam clear
      if (rand() < 0.55) parked.push(<Car key={`${sd}${i}`} p={[x, 0, sd * 4.35]} r={sd < 0 ? Math.PI / 2 : -Math.PI / 2} c={CARS[Math.floor(rand() * CARS.length)]} />);
    }
  });
  const moving = k !== 0 && rand() < 0.4 ? <Car p={[x0 + (rand() - 0.5) * 20, 0, rand() < 0.5 ? -1.5 : 1.5]} r={Math.PI / 2} c={CARS[Math.floor(rand() * CARS.length)]} /> : null;
  return (
    <group>
      <Instances geo={G.box} mat={decalMaterial('#f1eee6')} items={() => marks} k={`m${k}`} />
      <Instances geo={G.box} mat={decalMaterial('#f0c33c')} items={() => yellow} k={`y${k}`} />
      {/* sidewalks + kerbs */}
      {[-1, 1].map(sd => (
        <group key={sd}>
          <Box p={[x0, WALK_Y / 2, sd * 8.25]} s={[CITY_SEG, WALK_Y, 4.5]} c="#cfc8bb" shadow={false} />
          <Box p={[x0, WALK_Y / 2 + 0.006, sd * 6.075]} s={[CITY_SEG, WALK_Y, 0.25]} c="#e2ddd2" shadow={false} />
        </group>
      ))}
      <Instances geo={G.box} mat={decalMaterial('#aaa293')} items={() => joints} k={`j${k}`} receive />
      {/* street furniture, back (-z) side */}
      <CityLamp p={[x0 - 14, WALK_Y, -6.7]} on={night} pools={STREET_POOLS} />
      <CityLamp p={[x0 + 4, WALK_Y, -6.7]} on={night} pools={STREET_POOLS} />
      <PlanterTree p={[x0 - 5, WALK_Y, -7.1]} s={0.95} />
      <PlanterTree p={[x0 + 20 - 1.5, WALK_Y, -7.1]} s={1.0} leaf="#4f9b45" />
      <Hydrant p={[x0 - 9, WALK_Y, -6.7]} />
      <TrashCan p={[x0 + 5.2, WALK_Y, -6.9]} />
      <TrafficLight p={[cx - 2.6, WALK_Y, -6.5]} r={0} state={rand() < 0.5 ? 'red' : 'green'} />
      {/* front (+z) side */}
      <CityLamp p={[x0 - 4, WALK_Y, 6.7]} r={Math.PI} on={night} pools={STREET_POOLS} />
      <CityLamp p={[x0 + 16, WALK_Y, 6.7]} r={Math.PI} on={night} pools={STREET_POOLS} />
      {k !== 0 && <PlanterTree p={[x0 + 6, WALK_Y, 7.1]} s={0.9} leaf="#62ad4f" />}
      <PlanterTree p={[x0 - 14, WALK_Y, 7.1]} s={0.95} />
      <TrafficLight p={[cx + 2.6, WALK_Y, 6.5]} r={Math.PI} state="green" />
      {parked}
      {moving}
      <BlockSide k={k} side={-1} time={time} />
      <BlockSide k={k} side={1} time={time} lot={k === 0} />
      {k === 0 && <ParkingLot night={night} />}
    </group>
  );
});

export const City: React.FC<{ centerX?: number; behind?: number; ahead?: number; time: string }> = ({ centerX = 0, behind = 90, ahead = 110, time }) => {
  const k0 = Math.round((centerX - behind) / CITY_SEG), k1 = Math.round((centerX + ahead) / CITY_SEG);
  const blocks: React.ReactNode[] = [];
  for (let k = k0; k <= k1; k++) blocks.push(<Block key={k} k={k} time={time} />);
  return (
    <group>
      {blocks}
      {/* asphalt ground under everything (road + lot) */}
      <mesh geometry={G.plane} material={envMaterial('#3f4350')} rotation={[-Math.PI / 2, 0, 0]} position={[centerX, 0, 0]} scale={[1200, 600, 1]} receiveShadow />
    </group>
  );
};

export const CitySet: React.FC<SetProps> = ({ center, time }) => <City centerX={center[0]} time={time} />;

export const CITY_MARKS: Record<string, Vec3> = {
  center: [0, WALK_Y, -8], // back sidewalk in front of the shops, facing the road (+z)
  shop: [-2, WALK_Y, -9.6], // right at a shop window
  corner: [8.6, WALK_Y, -7.2], // by the traffic light at the crossing
  crosswalk: [12, 0, 0], // middle of the zebra crossing
  road: [0, 0, -1.6], // inner lane (+x traffic side)
  farSidewalk: [0, WALK_Y, 8.2],
  parking: [0, 0, 21.2], // parking-lot aisle
  cones: [1.6, 0, 20.4], // just behind the line of cones
};
