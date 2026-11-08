// IFOLOGY-style suburban street that tiles forever along X (so speed shots never run out of world).
// Road on z∈[-3.5,3.5]; the "home" sidewalk is z≈-4.5 with lawns and houses behind it (−z).
import React from 'react';
import * as THREE from 'three';
import { clothMaterial, envMaterial } from '../engine/materials';
import { At, Ball, Box, Car, Cyl, Door, G, rng, Window } from './kit';

export const SEG = 26;

const roofGeo = (() => {
  const s = new THREE.Shape();
  s.moveTo(-0.5, 0);
  s.lineTo(0.5, 0);
  s.lineTo(0, 0.5);
  s.lineTo(-0.5, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  g.computeVertexNormals();
  return g;
})();

const blob = new THREE.SphereGeometry(1, 32, 20);

const WALLS = ['#eab7a4', '#f1d8a0', '#a8c6da', '#dccbb2', '#c8d9a6', '#e2c4d4', '#f2e2c8'];
const ROOFS = ['#8e5b4c', '#5f5876', '#4d5b73', '#9c6a4e', '#6b4e46'];
const DOORS = ['#a33b3b', '#2f5f8a', '#3f7a52', '#7a4fa0', '#c98a2b'];
const CARS = ['#c8402f', '#3d6fb6', '#e9e4da', '#2b2f3a', '#f2b632'];

export const House2: React.FC<{ p: [number, number, number]; seed: number; r?: number }> = ({ p, seed, r = 0 }) => {
  const rand = rng(seed * 7 + 3);
  const wall = WALLS[Math.floor(rand() * WALLS.length)];
  const roof = ROOFS[Math.floor(rand() * ROOFS.length)];
  const door = DOORS[Math.floor(rand() * DOORS.length)];
  const w = 8 + rand() * 2.5, d = 7, h = rand() < 0.75 ? 5.6 : 3.1;
  const trim = '#f7f1e6';
  const glass = '#b9d4e6';
  const twoStory = h > 4;
  return (
    <At p={p} r={r}>
      <Box p={[0, h / 2, 0]} s={[w, h, d]} c={wall} />
      <Box p={[0, 0.12, 0]} s={[w + 0.15, 0.24, d + 0.15]} c="#c9bfae" />
      <mesh geometry={roofGeo} material={envMaterial(roof)} position={[0, h - 0.02, 0]} rotation={[0, Math.PI / 2, 0]} scale={[d + 0.9, 3.2, w + 0.7]} castShadow receiveShadow />
      <Box p={[0, h + 0.02, d / 2 + 0.3]} s={[w + 0.7, 0.12, 0.1]} c={trim} />
      <Door p={[w * 0.22, 0.24, d / 2]} c={door} frame={trim} />
      <Box p={[w * 0.22, 0.28, d / 2 + 0.45]} s={[1.5, 0.12, 0.8]} c="#d8d0c2" />
      <Window p={[-w * 0.22, 1.75, d / 2 + 0.01]} glass={glass} lit={false} frame={trim} w={1.6} h={1.2} bars={2} />
      {twoStory && (
        <>
          <Window p={[-w * 0.22, 4.0, d / 2 + 0.01]} glass={glass} lit={false} frame={trim} w={1.3} h={1.1} bars={2} />
          <Window p={[w * 0.22, 4.0, d / 2 + 0.01]} glass={glass} lit={false} frame={trim} w={1.3} h={1.1} bars={2} />
        </>
      )}
    </At>
  );
};

export const RoundTree: React.FC<{ p: [number, number, number]; s?: number; seed?: number }> = ({ p, s = 1, seed = 1 }) => {
  const rand = rng(seed * 13 + 1);
  const leaf = ['#5aa54a', '#4f9b45', '#62ad4f', '#4a9441'][Math.floor(rand() * 4)];
  return (
    <At p={p} s={s}>
      <Cyl p={[0, 1.2, 0]} s={[0.13, 2.4, 0.13]} c="#6b4a35" />
      <mesh geometry={blob} material={envMaterial(leaf)} position={[0, 3.3, 0]} scale={[1.45, 1.35, 1.45]} castShadow receiveShadow />
      <mesh geometry={blob} material={envMaterial(leaf)} position={[0.55, 2.75, 0.35]} scale={0.85} castShadow receiveShadow />
      <mesh geometry={blob} material={envMaterial(leaf)} position={[-0.6, 2.85, -0.2]} scale={0.9} castShadow receiveShadow />
    </At>
  );
};

/** Bumpy rounded hedge like IFOLOGY's (row of fat blobs). */
export const Hedge: React.FC<{ p: [number, number, number]; len: number; h?: number; c?: string }> = ({ p, len, h = 1.1, c = '#4e9a45' }) => {
  const n = Math.max(2, Math.round(len / 0.7));
  const m = envMaterial(c);
  return (
    <At p={p}>
      <mesh geometry={G.box} material={m} position={[0, h * 0.42, 0]} scale={[len, h * 0.84, 0.95]} castShadow receiveShadow />
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} geometry={blob} material={m} position={[-len / 2 + (i + 0.5) * (len / n), h * 0.72, 0]} scale={[len / n * 0.62, h * 0.38, 0.5]} castShadow receiveShadow />
      ))}
    </At>
  );
};

export const LampPost: React.FC<{ p: [number, number, number]; r?: number }> = ({ p, r = 0 }) => (
  <At p={p} r={r}>
    <Cyl p={[0, 2.4, 0]} s={[0.055, 4.8, 0.055]} c="#2b2e38" />
    <Box p={[0, 4.78, 0.35]} s={[0.08, 0.07, 0.75]} c="#2b2e38" />
    <Box p={[0, 4.7, 0.68]} s={[0.32, 0.12, 0.26]} c="#2b2e38" />
  </At>
);

const Mailbox: React.FC<{ p: [number, number, number]; c?: string }> = ({ p, c = '#2f5f8a' }) => (
  <At p={p}>
    <Cyl p={[0, 0.5, 0]} s={[0.04, 1.0, 0.04]} c="#6b4a35" />
    <Box p={[0, 1.08, 0]} s={[0.24, 0.24, 0.45]} c={c} />
  </At>
);

const Bin: React.FC<{ p: [number, number, number]; c?: string }> = ({ p, c = '#3f7a52' }) => (
  <At p={p}>
    <Box p={[0, 0.5, 0]} s={[0.6, 1.0, 0.7]} c={c} />
    <Box p={[0, 1.04, -0.02]} s={[0.64, 0.08, 0.76]} c={c} />
  </At>
);

/** One 26 m block of street. Back side (−z) is the detailed side; front side (+z) is dressed lighter. */
const Segment: React.FC<{ k: number; lamps?: boolean }> = ({ k, lamps = true }) => {
  const x0 = k * SEG;
  const rand = rng(Math.abs(k * 31 + 7));
  const dash: React.ReactNode[] = [];
  for (let i = 0; i < SEG / 3; i++) dash.push(<Box key={i} p={[x0 + i * 3 + 0.75, 0.012, 0]} s={[1.5, 0.01, 0.14]} c="#f0c33c" shadow={false} />);
  return (
    <group>
      {/* road, curbs, sidewalks, lawns */}
      <Box p={[x0 + SEG / 2, -0.05, 0]} s={[SEG, 0.1, 7]} c="#3c404d" shadow={false} />
      {dash}
      {[-1, 1].map(sd => (
        <group key={sd}>
          <Box p={[x0 + SEG / 2, 0.012, sd * 3.2]} s={[SEG, 0.01, 0.1]} c="#e8e4da" shadow={false} />
          <Box p={[x0 + SEG / 2, 0.06, sd * 3.575]} s={[SEG, 0.12, 0.15]} c="#bdb7ab" />
          <Box p={[x0 + SEG / 2, 0.05, sd * 4.55]} s={[SEG, 0.1, 1.8]} c="#d9cfbb" shadow={false} />
          {/* sidewalk joints */}
          {Array.from({ length: SEG / 2 }, (_, i) => (
            <Box key={i} p={[x0 + i * 2, 0.102, sd * 4.55]} s={[0.035, 0.005, 1.8]} c="#b9ae98" shadow={false} />
          ))}
          <Box p={[x0 + SEG / 2, 0.04, sd * 15]} s={[SEG, 0.08, 20.9]} c="#5aa548" shadow={false} />
        </group>
      ))}
      {/* back side: houses, trees, hedges, lamps */}
      <House2 p={[x0 + 6.5, 0.08, -17]} seed={k * 2} />
      <House2 p={[x0 + 19.5, 0.08, -17]} seed={k * 2 + 1} />
      <RoundTree p={[x0 + 13, 0.08, -8.5 - rand() * 2]} s={0.95 + rand() * 0.25} seed={k} />
      {rand() < 0.6 && <RoundTree p={[x0 + 1 + rand() * 3, 0.08, -11]} s={0.8 + rand() * 0.2} seed={k + 50} />}
      <Hedge p={[x0 + 6.5, 0.08, -7.2]} len={6.5 + rand() * 2} />
      {rand() < 0.7 && <Hedge p={[x0 + 19.5, 0.08, -7.2]} len={5 + rand() * 3} c="#4a9441" />}
      <Box p={[x0 + 6.5 + 1.95, 0.085, -10.5]} s={[1.3, 0.02, 6.5]} c="#d9cfbb" shadow={false} />
      <Box p={[x0 + 19.5 + 1.95, 0.085, -10.5]} s={[1.3, 0.02, 6.5]} c="#d9cfbb" shadow={false} />
      <Mailbox p={[x0 + 10.2, 0.1, -5.7]} c={DOORS[Math.floor(rand() * DOORS.length)]} />
      {rand() < 0.5 && <Bin p={[x0 + 22.7, 0.1, -5.8]} />}
      {lamps && k % 2 === 0 && <LampPost p={[x0 + 15, 0.1, -3.9]} r={Math.PI} />}
      {/* front side */}
      <House2 p={[x0 + 13, 0.08, 18]} seed={k * 5 + 101} r={Math.PI} />
      <RoundTree p={[x0 + 4, 0.08, 9]} seed={k + 200} s={1.05} />
      <RoundTree p={[x0 + 22, 0.08, 9.5]} seed={k + 300} />
      <Hedge p={[x0 + 13, 0.08, 7.4]} len={9} />
      {k % 2 === 1 && <LampPost p={[x0 + 15, 0.1, 3.9]} />}
      {rand() < 0.45 && <Car p={[x0 + 8 + rand() * 8, 0, 2.2]} r={Math.PI / 2} c={CARS[Math.floor(rand() * CARS.length)]} />}
    </group>
  );
};

/** Street tiled around `centerX`; covers `behind`/`ahead` metres. */
export const Suburb: React.FC<{ centerX?: number; behind?: number; ahead?: number; lamps?: boolean }> = ({ centerX = 0, behind = 120, ahead = 160, lamps = true }) => {
  const k0 = Math.floor((centerX - behind) / SEG), k1 = Math.floor((centerX + ahead) / SEG);
  const segs: React.ReactNode[] = [];
  for (let k = k0; k <= k1; k++) segs.push(<Segment key={k} k={k} lamps={lamps} />);
  return (
    <group>
      {segs}
      {/* far ground under everything */}
      <mesh geometry={G.plane} material={envMaterial('#5aa548')} rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.02, 0]} scale={[1200, 600, 1]} receiveShadow />
      {/* distant tree line so the horizon isn't empty */}
      {Array.from({ length: 40 }, (_, i) => {
        const x = Math.floor(centerX / 30) * 30 - 600 + i * 30;
        return <mesh key={i} geometry={blob} material={clothMaterial('#4b8f4a')} position={[x, 3, -60 - (i % 3) * 6]} scale={[14, 7 + (i % 4), 6]} />;
      })}
    </group>
  );
};

export { Ball };
