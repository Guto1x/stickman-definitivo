// City park: big lawn, a round paved plaza with a two-tier fountain at the origin, three curving
// paths leaving it (towards +z, -x and +x/-z), a duck pond at (-17, -14), benches, park lamps,
// flower beds, round trees, a distant tree line and hills.
//
// Heights: lawn y = 0, path top y = 0.02, plaza top y = 0.03, fountain rim top y ≈ 0.7.
import React from 'react';
import * as THREE from 'three';
import { envMaterial, flat, toon } from '../engine/materials';
import type { Vec3 } from '../types';
import type { SetProps } from './index';
import { At, Ball, Box, Cone, Cyl, G, mix, rng, Tree } from './kit';
import { RoundTree } from './suburb';
import { Bench, blob, lampsOn, mapMaterial, ParkLamp, TrashCan } from './outdoorKit';

const GRASS = '#67b04f';
const PATH = '#e6d6b4';
const PATH_EDGE = '#c9b48c';
const PLAZA = '#e9dfc9';

// ---------------------------------------------------------------------------------------
// Geometry (module level)
// ---------------------------------------------------------------------------------------
const disc48 = new THREE.CylinderGeometry(1, 1, 1, 56);
// water veil falling from the upper bowl (lathe points bottom -> top so faces point outwards)
const veilGeo = new THREE.LatheGeometry([[1.34, 0.52], [1.31, 0.85], [1.24, 1.18], [1.14, 1.44], [1.04, 1.57]].map(([r, y]) => new THREE.Vector2(r, y)), 48);
// distant scenery: toon bands without the rim crescent (no glowing outlines on hill silhouettes)
const farMat = (c: string) => toon(c, { rim: 0, levels: [110, 190, 255] });
const rimTorus = new THREE.TorusGeometry(1, 0.055, 10, 64);

/** Flat ribbon along a curve (normals up), for paths. */
function ribbon(pts: [number, number][], width: number, samples = 120) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  const pos: number[] = [], nrm: number[] = [], uv: number[] = [], idx: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const side = new THREE.Vector3().crossVectors(tan, up).normalize().multiplyScalar(width / 2);
    pos.push(p.x + side.x, 0, p.z + side.z, p.x - side.x, 0, p.z - side.z);
    nrm.push(0, 1, 0, 0, 1, 0);
    uv.push(0, t, 1, t);
    if (i < samples) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return { geo: g, curve };
}

const PATHS: [number, number][][] = [
  [[0, 6.5], [1.5, 13], [-2.5, 21], [-2, 30], [4, 42], [6, 60]], // A: towards the default camera (+z)
  [[-6.5, 0], [-13, -2.5], [-21, 1.5], [-31, -0.5], [-44, -5], [-62, -4]], // B: west (-x)
  [[4.6, -4.6], [10, -9.5], [17, -8.5], [26, -13], [40, -11], [58, -16]], // C: east / back
];
const PATH_W = 2.6;
const pathGeos = PATHS.map(p => ({ inner: ribbon(p, PATH_W), edge: ribbon(p, PATH_W + 0.36) }));

/** Point on path i at parameter t (for placing benches/lamps beside it). */
function along(i: number, t: number, offset = 0): { p: Vec3; ry: number } {
  const c = pathGeos[i].inner.curve;
  const p = c.getPointAt(t), tan = c.getTangentAt(t);
  const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize(); // left of travel
  return { p: [p.x + side.x * offset, 0, p.z + side.z * offset], ry: Math.atan2(-side.x * Math.sign(offset || 1), -side.z * Math.sign(offset || 1)) };
}

// Streaky translucent material for the falling water veil (vertical streams, brighter at the lip).
let veilMat: THREE.MeshBasicMaterial | null = null;
function veilMaterial() {
  if (veilMat) return veilMat;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const g = c.getContext('2d')!;
  const rand = rng(77);
  for (let x = 0; x < 256; x += 4) {
    const a = 0.12 + rand() * 0.55;
    g.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
    g.fillRect(x, 0, 2 + Math.floor(rand() * 3), 64);
  }
  const grd = g.createLinearGradient(0, 0, 0, 64);
  grd.addColorStop(0, 'rgba(255,255,255,0.55)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(5, 1);
  t.flipY = false; // v = 0 at the bottom of the lathe, canvas row 0 = top: flip so the lip gets the bright band
  veilMat = new THREE.MeshBasicMaterial({ map: t, color: '#d6f2ff', transparent: true, depthWrite: false, toneMapped: false });
  return veilMat;
}

// Pond (ellipse) and picnic blanket texture
const POND: { c: [number, number]; rx: number; rz: number } = { c: [-17, -14], rx: 7.2, rz: 4.6 };
let checker: THREE.CanvasTexture | null = null;
function checkerTex() {
  if (checker) return checker;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    g.fillStyle = (i + j) % 2 ? '#f6f1e6' : '#d8433a';
    g.fillRect(i * 16, j * 16, 16, 16);
  }
  checker = new THREE.CanvasTexture(c);
  checker.colorSpace = THREE.SRGBColorSpace;
  checker.magFilter = THREE.NearestFilter;
  return checker;
}

// Spots trees must avoid (plaza, paths, pond, picnic).
function clearOf(x: number, z: number, margin: number) {
  if (Math.hypot(x, z) < 10 + margin) return false;
  const dx = (x - POND.c[0]) / (POND.rx + margin + 1.5), dz = (z - POND.c[1]) / (POND.rz + margin + 1.5);
  if (dx * dx + dz * dz < 1) return false;
  for (const p of PATHS) for (let i = 0; i < p.length - 1; i++) {
    const [ax, az] = p[i], [bx, bz] = p[i + 1];
    const vx = bx - ax, vz = bz - az, L = vx * vx + vz * vz;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L));
    if (Math.hypot(x - (ax + vx * t), z - (az + vz * t)) < PATH_W / 2 + margin + 1.2) return false;
  }
  if (Math.hypot(x - 9, z - 9) < 4.5) return false; // picnic lawn
  return true;
}

// Trees: hand-placed framing trees + a scattered grove (deterministic).
const TREES: { p: Vec3; s: number; seed: number; pine?: boolean }[] = (() => {
  const out: { p: Vec3; s: number; seed: number; pine?: boolean }[] = [
    { p: [-9, 0, 9], s: 1.15, seed: 1 }, { p: [10, 0, 2.5], s: 1.25, seed: 2 }, { p: [-9.5, 0, -11], s: 1.1, seed: 3 },
    { p: [6, 0, -14], s: 1.3, seed: 4 }, { p: [-5, 0, -13], s: 1.0, seed: 5 }, { p: [-26, 0, -10], s: 1.2, seed: 6 },
    { p: [-8, 0, 20], s: 1.2, seed: 7 }, { p: [7, 0, 22], s: 1.1, seed: 8 }, { p: [16, 0, 0], s: 1.0, seed: 9, pine: true },
  ];
  const rand = rng(41);
  let tries = 0;
  while (out.length < 60 && tries++ < 2000) {
    const a = rand() * Math.PI * 2, r = 14 + rand() * 46;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (!clearOf(x, z, 1.5)) continue;
    if (out.some(t => Math.hypot(t.p[0] - x, t.p[2] - z) < 5.5)) continue;
    out.push({ p: [x, 0, z], s: 0.95 + rand() * 0.45, seed: 20 + out.length, pine: rand() < 0.18 });
  }
  return out;
})();

const FLOWER_COLS = ['#e8453c', '#f2b632', '#f07fb0', '#ffffff', '#9a6be0', '#ff8a3a'];
const FlowerBed: React.FC<{ p: Vec3; rx: number; rz: number; seed: number; r?: number }> = ({ p, rx, rz, seed, r = 0 }) => {
  const rand = rng(seed);
  const flowers: React.ReactNode[] = [];
  for (let i = 0; i < Math.round(rx * rz * 5); i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * 0.88;
    flowers.push(<Ball key={i} p={[Math.cos(a) * rx * d, 0.16 + rand() * 0.08, Math.sin(a) * rz * d]} s={0.09 + rand() * 0.05} c={FLOWER_COLS[Math.floor(rand() * FLOWER_COLS.length)]} ico shadow={false} />);
  }
  return (
    <At p={p} r={r}>
      <mesh geometry={disc48} material={envMaterial('#7a5a42')} position={[0, 0.04, 0]} scale={[rx, 0.08, rz]} receiveShadow />
      <mesh geometry={blob} material={envMaterial('#4f9b45')} position={[0, 0.08, 0]} scale={[rx * 0.92, 0.12, rz * 0.92]} receiveShadow />
      {flowers}
    </At>
  );
};

const Duck: React.FC<{ p: Vec3; r?: number; s?: number; c?: string }> = ({ p, r = 0, s = 1, c = '#f6f1e6' }) => (
  <At p={p} r={r} s={s}>
    <Ball p={[0, 0.1, 0]} s={[0.17, 0.12, 0.25]} c={c} />
    <Ball p={[0, 0.27, 0.15]} s={0.09} c={c === '#f6f1e6' ? '#2f7a5a' : c} />
    <Cone p={[0, 0.26, 0.27]} r={[Math.PI / 2, 0, 0]} s={[0.035, 0.09, 0.035]} c="#f28a2b" />
    <Ball p={[0.05, 0.3, 0.2]} s={0.014} c="#111" />
    <Ball p={[-0.05, 0.3, 0.2]} s={0.014} c="#111" />
  </At>
);

const Fountain: React.FC = () => {
  const stone = '#d6ccb9', stoneD = '#bfb39e';
  const water = '#6cc3ea';
  return (
    <group>
      <mesh geometry={disc48} material={envMaterial(stoneD)} position={[0, 0.25, 0]} scale={[2.75, 0.5, 2.75]} castShadow receiveShadow />
      <mesh geometry={rimTorus} material={envMaterial(stone)} position={[0, 0.56, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[2.62, 2.62, 2.4]} castShadow receiveShadow />
      <mesh geometry={disc48} material={envMaterial(water)} position={[0, 0.505, 0]} scale={[2.6, 0.01, 2.6]} receiveShadow />
      {/* ripples */}
      {[1.3, 1.9].map(r => <mesh key={r} geometry={rimTorus} material={flat('#bfe9fb', 0.6)} position={[0, 0.515, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[r, r, 0.2]} />)}
      {/* column + upper bowl */}
      <mesh geometry={disc48} material={envMaterial(stone)} position={[0, 0.95, 0]} scale={[0.32, 1.0, 0.32]} castShadow receiveShadow />
      <mesh geometry={disc48} material={envMaterial(stoneD)} position={[0, 1.5, 0]} scale={[1.05, 0.22, 1.05]} castShadow receiveShadow />
      <mesh geometry={rimTorus} material={envMaterial(stone)} position={[0, 1.62, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.02, 1.02, 1.4]} castShadow />
      <mesh geometry={disc48} material={envMaterial(water)} position={[0, 1.615, 0]} scale={[1.0, 0.01, 1.0]} />
      {/* water: jet with a tapering tip + droplets, a thin veil spilling from the upper bowl */}
      <mesh geometry={disc48} material={flat('#e2f6ff', 0.85)} position={[0, 2.0, 0]} scale={[0.06, 0.8, 0.06]} />
      <mesh geometry={G.cone} material={flat('#eefaff', 0.85)} position={[0, 2.55, 0]} scale={[0.09, 0.3, 0.09]} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 0.22 + (i % 3) * 0.12;
        return <Ball key={'d' + i} p={[Math.cos(a) * r, 2.5 - (i % 3) * 0.22, Math.sin(a) * r]} s={0.035} c="#eaf9ff" glow />;
      })}
      <mesh geometry={veilGeo} material={veilMaterial()} renderOrder={3} />
    </group>
  );
};

const PicnicBlanket: React.FC<{ p: Vec3; r?: number }> = ({ p, r = 0 }) => (
  <At p={p} r={r}>
    <mesh geometry={G.box} material={mapMaterial(checkerTex())} position={[0, 0.012, 0]} scale={[2.2, 0.02, 1.7]} receiveShadow />
    <At p={[0.6, 0.02, -0.3]}>
      <Box p={[0, 0.16, 0]} s={[0.55, 0.32, 0.36]} c="#b5703f" />
      <Box p={[0, 0.34, 0]} s={[0.58, 0.05, 0.4]} c="#8a5532" />
    </At>
    <Ball p={[-0.6, 0.14, 0.35]} s={0.13} c="#d8433a" />
    <Ball p={[-0.35, 0.12, 0.45]} s={0.11} c="#7fc24a" />
  </At>
);

// winter (variant odd): snow on the lawn, the pond frozen over (pale ice, no ducks or lily pads), frosted hills
const SNOW = '#e9f0f4';
const ICE = '#cfe6f1';
const ParkScene: React.FC<{ time: string; winter?: boolean }> = React.memo(({ time, winter }) => {
  const on = lampsOn(time);
  const rand = rng(9);
  // benches around the plaza, facing the fountain
  const plazaBenches = [20, 135, 215, 250, 340].map(deg => {
    const a = (deg * Math.PI) / 180, r = 6.3;
    return { p: [Math.cos(a) * r, 0.03, Math.sin(a) * r] as Vec3, ry: Math.atan2(-Math.cos(a), -Math.sin(a)) };
  });
  // lamps along paths (alternating sides) and around the plaza
  const lamps: Vec3[] = [];
  [0, 1, 2].forEach(i => [0.12, 0.34, 0.56, 0.78].forEach((t, j) => lamps.push(along(i, t, (j % 2 ? 1 : -1) * (PATH_W / 2 + 0.7)).p)));
  [65, 160, 290].forEach(deg => {
    const a = (deg * Math.PI) / 180;
    lamps.push([Math.cos(a) * 8.6, 0, Math.sin(a) * 8.6]);
  });
  const pathBenches = [along(0, 0.2, 2.2), along(1, 0.24, -2.2), along(2, 0.3, 2.2), along(0, 0.5, -2.2)];
  return (
    <group>
      {/* lawn */}
      <mesh geometry={G.plane} material={envMaterial(winter ? SNOW : GRASS)} rotation={[-Math.PI / 2, 0, 0]} scale={[700, 700, 1]} receiveShadow />
      {/* plaza */}
      <mesh geometry={disc48} material={envMaterial(mix(PLAZA, '#000', 0.12))} position={[0, 0.0, 0]} scale={[8.0, 0.05, 8.0]} receiveShadow />
      <mesh geometry={disc48} material={envMaterial(PLAZA)} position={[0, 0.005, 0]} scale={[7.6, 0.05, 7.6]} receiveShadow />
      <mesh geometry={rimTorus} material={envMaterial(mix(PLAZA, '#000', 0.08))} position={[0, 0.031, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[4.6, 4.6, 0.25]} receiveShadow />
      <Fountain />
      {/* paths */}
      {pathGeos.map((g, i) => (
        <group key={i}>
          <mesh geometry={g.edge.geo} material={envMaterial(PATH_EDGE)} position={[0, 0.012, 0]} receiveShadow />
          <mesh geometry={g.inner.geo} material={envMaterial(PATH)} position={[0, 0.02, 0]} receiveShadow />
        </group>
      ))}
      {plazaBenches.map((b, i) => <Bench key={i} p={b.p} r={b.ry} />)}
      {pathBenches.map((b, i) => <Bench key={'pb' + i} p={[b.p[0], 0, b.p[2]]} r={b.ry} c="#a8653a" />)}
      <TrashCan p={[plazaBenches[1].p[0] * 1.14 + 1.3, 0.03, plazaBenches[1].p[2] * 1.14]} c="#2f6b4f" />
      <TrashCan p={[pathBenches[0].p[0] + 1.4, 0, pathBenches[0].p[2]]} c="#2f6b4f" />
      {lamps.map((p, i) => <ParkLamp key={i} p={p} on={on} />)}
      {/* flower beds between the paths, bushes round the plaza */}
      <FlowerBed p={[-6.4, 0, 6.6]} rx={2.2} rz={1.3} r={0.8} seed={1} />
      <FlowerBed p={[6.9, 0, 4.6]} rx={2.0} rz={1.2} r={-0.6} seed={2} />
      <FlowerBed p={[-3.2, 0, -8.6]} rx={2.4} rz={1.2} r={0.3} seed={3} />
      {[[-8.2, 3.4], [8.6, -1.5], [2.0, -9.4], [-6.9, -5.6], [9.6, 6.8]].map(([x, z], i) => (
        <group key={i}>
          <mesh geometry={blob} material={envMaterial('#4e9a45')} position={[x, 0.42, z]} scale={[0.95, 0.62, 0.8]} castShadow receiveShadow />
          <mesh geometry={blob} material={envMaterial('#58a54d')} position={[x + 0.7, 0.32, z + 0.2]} scale={0.55} castShadow receiveShadow />
        </group>
      ))}
      {/* pond */}
      <At p={[POND.c[0], 0, POND.c[1]]}>
        <mesh geometry={disc48} material={envMaterial('#d9c79c')} position={[0, 0.0, 0]} scale={[POND.rx + 0.7, 0.04, POND.rz + 0.7]} receiveShadow />
        <mesh geometry={disc48} material={envMaterial(winter ? ICE : '#5cb6e0')} position={[0, 0.012, 0]} scale={[POND.rx, 0.04, POND.rz]} receiveShadow />
        <mesh geometry={disc48} material={envMaterial(winter ? '#dcf0f8' : '#4aa3d2')} position={[0.6, 0.02, -0.3]} scale={[POND.rx * 0.62, 0.04, POND.rz * 0.6]} receiveShadow />
        {Array.from({ length: 22 }, (_, i) => {
          const a = (i / 22) * Math.PI * 2 + rand() * 0.15;
          return <Ball key={i} p={[Math.cos(a) * (POND.rx + 0.45), 0.08, Math.sin(a) * (POND.rz + 0.45)]} s={[0.32 + rand() * 0.2, 0.18 + rand() * 0.1, 0.28 + rand() * 0.15]} c={rand() < 0.5 ? '#a9a49a' : '#bdb7ab'} ico />;
        })}
        {!winter && [[-3.5, -1.5], [2.5, 1.8], [-1, 2.4], [4.4, -1.2]].map(([x, z], i) => (
          <mesh key={i} geometry={G.circle} material={envMaterial('#4f9a45')} position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, i]} scale={0.42 + (i % 2) * 0.12} receiveShadow />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <Cyl key={i} p={[-6.3 + (i % 3) * 0.35, 0.5 + (i % 2) * 0.12, -1.6 + Math.floor(i / 3) * 0.4]} r={[0, 0, (i % 3 - 1) * 0.12]} s={[0.03, 1.0 + (i % 2) * 0.25, 0.03]} c="#4f8a3a" seg8 />
        ))}
        {!winter && <>
          <Duck p={[1.2, 0.03, 0.4]} r={2.2} />
          <Duck p={[2.3, 0.03, -0.6]} r={2.6} c="#f2c53c" s={0.6} />
          <Duck p={[2.9, 0.03, -1.1]} r={2.4} c="#f2c53c" s={0.6} />
        </>}
      </At>
      {/* picnic */}
      <PicnicBlanket p={[9, 0, 9]} r={0.4} />
      {/* trees */}
      {TREES.map((t, i) => (t.pine ? <Tree key={i} p={t.p} s={t.s * 1.5} kind="pine" leaf="#3f8a4f" /> : <RoundTree key={i} p={t.p} s={t.s} seed={t.seed} />))}
      {/* distant tree line + hills (fogged) */}
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        const r = 78 + (i % 3) * 7;
        return <mesh key={i} geometry={blob} material={farMat(winter ? (i % 2 ? '#c9d9de' : '#bfd2d8') : i % 2 ? '#4b8f4a' : '#45874a')} position={[Math.cos(a) * r, 3, Math.sin(a) * r]} rotation={[0, -a, 0]} scale={[7, 7 + (i % 4), 15]} />;
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3;
        return <mesh key={'h' + i} geometry={blob} material={farMat(winter ? '#d6e3e8' : '#5c9c55')} position={[Math.cos(a) * 160, -8, Math.sin(a) * 160]} scale={[60, 26 + (i % 3) * 8, 60]} />;
      })}
    </group>
  );
});

export const ParkSet: React.FC<SetProps> = ({ time, variant }) => <ParkScene time={time} winter={variant % 2 === 1} />;

const benchMark = (() => {
  const a = (135 * Math.PI) / 180;
  return [Math.cos(a) * 6.3, 0.03, Math.sin(a) * 6.3] as Vec3;
})();

export const PARK_MARKS: Record<string, Vec3> = {
  center: [0, 0.03, 4.6], // on the plaza in front of the fountain (camera on +z)
  fountain: [0, 0.03, 3.2], // right at the fountain rim
  bench: benchMark, // seat of the plaza bench at 135°: sit here with rot 135 (degrees, faces the fountain)
  path: along(0, 0.3).p.map((v, i) => (i === 1 ? 0.02 : v)) as Vec3, // on the main path towards +z
  pathFar: along(0, 0.6).p.map((v, i) => (i === 1 ? 0.02 : v)) as Vec3,
  pond: [-12.5, 0, -8.6], // lawn at the pond's edge, ducks in front (-z)
  ice: [-15.5, 0.03, -12.6], // out on the (winter) pond ice, ~3 m from the near shore
  shore: [-11.6, 0, -9.0], // near shore of the pond, facing the ice (rot ~ -125)
  lawn: [6, 0, 12], // open grass by the picnic blanket
  picnic: [9, 0.02, 9],
  west: along(1, 0.35).p.map((v, i) => (i === 1 ? 0.02 : v)) as Vec3, // path B (towards -x)
};
