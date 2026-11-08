// American-football stadium: striped turf with yard lines, numbers and coloured end zones, yellow
// goal posts, stepped stands on all four sides filled with an instanced crowd (~13k people in a
// handful of draw calls), floodlight towers in the corners and a scoreboard above the west stand.
//
// Field along x: end lines x = ±54.86, sidelines z = ±24.38, midfield x = 0. Turf top y = 0.02.
// Long stands front wall at z = ±33 (seats from y 2.2 up), end stands at x = ±64.
import React from 'react';
import * as THREE from 'three';
import { envMaterial, flat, inkMaterial } from '../engine/materials';
import type { Vec3 } from '../types';
import type { SetProps } from './index';
import { At, Box, Cyl, G, mix, rng, Sign, textTexture } from './kit';
import { decalMaterial, Halo, Inst, Instances, lampsOn, mapMaterial } from './outdoorKit';

const HL = 54.86, HW = 24.38; // half length (incl. end zones), half width
const YD = 0.9144;
const GOAL_LINE = HL - 10 * YD; // 45.72
const TURF_Y = 0.02;
const STAND_Z = 33, STAND_X = 64; // stand front walls
const H0 = 2.2, RD = 0.85, RISE = 0.42; // front wall height, row depth, row rise
const LONG_ROWS = 30, END_ROWS = 18;
const HOME = '#2f4f9a', AWAY = '#2f7a5a'; // no gray: the hero's jacket is the only gray on screen

// ---------------------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------------------
/** Stepped stand cross-section (x = outward distance, y = height), extruded 1 m along z. */
function standGeo(rows: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0, H0);
  for (let i = 0; i < rows; i++) {
    s.lineTo((i + 1) * RD, H0 + i * RISE);
    s.lineTo((i + 1) * RD, H0 + (i + 1) * RISE);
  }
  const top = H0 + rows * RISE;
  s.lineTo(rows * RD, top + 2.6);
  s.lineTo(rows * RD + 0.6, top + 2.6);
  s.lineTo(rows * RD + 0.6, 0);
  s.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  g.computeVertexNormals();
  return g;
}
const longStand = standGeo(LONG_ROWS);
const endStand = standGeo(END_ROWS);
const headGeo = new THREE.SphereGeometry(1, 10, 8);
const torsoGeo = new THREE.CapsuleGeometry(0.5, 1, 3, 10); // 2 units tall, 1 wide
const armGeo = new THREE.CylinderGeometry(1, 1, 1, 6);
const UP = new THREE.Vector3(0, 1, 0);

const AISLES = [-36, -12, 12, 36];
const SHIRTS = ['#5a8f9e', '#3d6fb6', '#f2b632', '#4e9a6b', '#e7e1d3', '#7a4fa0', '#e46f8e', '#2d2f3a', '#ff8a3a', '#7fc2e8'];

type StandSpec = { rows: number; len: number; ry: number; at: Vec3; team: string; seed: number; gap?: [number, number, number] };
// ry maps the stand's local +x (outward) to the world: +z → -π/2, -z → π/2, +x → 0, -x → π.
const STANDS: StandSpec[] = [
  { rows: LONG_ROWS, len: 112, ry: -Math.PI / 2, at: [0, 0, STAND_Z], team: HOME, seed: 1, gap: [0, 2, 4] }, // near (+z) stand, hero seat gap at x≈0
  { rows: LONG_ROWS, len: 112, ry: Math.PI / 2, at: [0, 0, -STAND_Z], team: AWAY, seed: 2 },
  { rows: END_ROWS, len: 62, ry: 0, at: [STAND_X, 0, 0], team: HOME, seed: 3 },
  { rows: END_ROWS, len: 62, ry: Math.PI, at: [-STAND_X, 0, 0], team: AWAY, seed: 4 },
];

/** World position of a point given in stand-local coords (u = outward, v = height, w = along). */
function standToWorld(st: StandSpec, u: number, v: number, w: number): Vec3 {
  const c = Math.cos(st.ry), sn = Math.sin(st.ry);
  // local (x=u, z=w) rotated about y by ry: x' = x cos + z sin, z' = -x sin + z cos
  return [st.at[0] + u * c + w * sn, st.at[1] + v, st.at[2] - u * sn + w * c];
}

function crowdFor(st: StandSpec) {
  const rand = rng(st.seed * 97 + 13);
  const bodies: Inst[] = [], heads: Inst[] = [], arms: Inst[] = [];
  const c = Math.cos(st.ry), sn = Math.sin(st.ry);
  const dirW = (u: number, v: number, w: number) => new THREE.Vector3(u * c + w * sn, v, -u * sn + w * c).normalize();
  const dx = 0.58;
  const n = Math.floor(st.len / dx);
  for (let i = 0; i < st.rows; i++) {
    for (let j = 0; j < n; j++) {
      const w = -st.len / 2 + (j + 0.5) * dx + (rand() - 0.5) * 0.12;
      const r1 = rand();
      if (r1 < 0.07) continue; // empty seat
      if (st.gap && i >= st.gap[1] && i <= st.gap[2] && Math.abs(w - st.gap[0]) < 1.6) continue;
      if (st.rows === LONG_ROWS && AISLES.some(a => Math.abs(w - a) < 0.75)) continue; // stair aisles
      const stand = rand() < 0.12;
      const base = H0 + i * RISE;
      const u = i * RD + RD * 0.55;
      const shirt = rand() < 0.45 ? (rand() < 0.75 ? st.team : '#f4f1ea') : SHIRTS[Math.floor(rand() * SHIRTS.length)];
      const hb = stand ? 0.85 : 0.52; // body centre above the tread
      const bh = stand ? 0.74 : 0.6;
      bodies.push({ p: standToWorld(st, u, base + hb, w), s: [0.3, bh / 2, 0.4], r: st.ry, c: shirt });
      heads.push({ p: standToWorld(st, u, base + hb + bh / 2 + 0.13, w), s: 0.16 });
      if (rand() < 0.2) {
        // cheering: both arms up and out
        const spread = 0.35 + rand() * 0.35;
        [-1, 1].forEach(sd => {
          const d = dirW(0.08, 1, sd * spread);
          const sh = standToWorld(st, u, base + hb + bh / 2 - 0.08, w + sd * 0.17);
          arms.push({ p: [sh[0] + d.x * 0.28, sh[1] + d.y * 0.28, sh[2] + d.z * 0.28], s: [0.035, 0.56, 0.035], q: new THREE.Quaternion().setFromUnitVectors(UP, d) });
        });
      }
    }
  }
  return { bodies, heads, arms };
}

// ---------------------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------------------
const GoalPost: React.FC<{ x: number }> = ({ x }) => {
  const sgn = Math.sign(x);
  const y = '#f2c53c';
  const back = x + sgn * 1.8;
  return (
    <group>
      <Cyl p={[back, 1.6, 0]} s={[0.16, 3.2, 0.16]} c={y} />
      <Box p={[back, 1.0, 0]} s={[0.5, 2.0, 0.5]} c="#2a3550" />
      <Cyl p={[(back + x) / 2, 3.05, 0]} r={[0, 0, Math.PI / 2]} s={[0.12, Math.abs(back - x), 0.12]} c={y} />
      <Cyl p={[x, 3.05, 0]} r={[Math.PI / 2, 0, 0]} s={[0.1, 5.64, 0.1]} c={y} />
      {[-1, 1].map(s => (
        <group key={s}>
          <Cyl p={[x, 3.05 + 4.5, s * 2.82]} s={[0.08, 9, 0.08]} c={y} />
          <Box p={[x, 12.2, s * 2.82 + 0.18]} s={[0.02, 0.6, 0.32]} c="#e8453c" shadow={false} />
        </group>
      ))}
    </group>
  );
};

const Floodlight: React.FC<{ p: Vec3; on: boolean }> = ({ p, on }) => {
  // bank faces the field centre
  const ry = Math.atan2(-p[0], -p[2]);
  const H = 36;
  return (
    <At p={p}>
      <Cyl p={[0, H / 2, 0]} s={[0.55, H, 0.55]} c="#8c93a3" seg8 />
      <Cyl p={[0, 0.6, 0]} s={[1.0, 1.2, 1.0]} c="#6d7383" seg8 />
      <At p={[0, H + 2.2, 0]} r={ry}>
        <group rotation={[0.35, 0, 0]}>
          <Box p={[0, 0, -0.35]} s={[8.6, 5.2, 0.5]} c="#4d5262" />
          {Array.from({ length: 12 }, (_, i) => (
            <mesh key={i} geometry={G.plane} material={on ? flat('#fffbe8') : envMaterial('#dcdcd6')} position={[-3.3 + (i % 4) * 2.2, -1.6 + Math.floor(i / 4) * 1.6, -0.09]} scale={[1.8, 1.25, 1]} />
          ))}
          {on && <Halo p={[0, 0, 0.6]} r={9} c="#fff4d6" o={0.5} />}
        </group>
      </At>
    </At>
  );
};

const Scoreboard: React.FC<{ on: boolean }> = ({ on }) => (
  <At p={[-84, 0, 0]} r={Math.PI / 2}>
    {[-8, 8].map(x => <Box key={x} p={[x, 7, -0.6]} s={[0.9, 14, 0.9]} c="#4d5262" />)}
    <Box p={[0, 19.5, -0.4]} s={[28, 12, 0.8]} c="#1d2333" />
    <Box p={[0, 25.8, -0.4]} s={[28.6, 0.6, 1.0]} c={HOME} />
    <Sign p={[0, 23.6, 0.02]} w={22} h={2.6} text="ESTÁDIO MUNICIPAL" bg="#1d2333" fg="#f2c53c" />
    <Sign p={[-7, 18.6, 0.02]} w={9} h={6} text={'HOME\n21'} bg="#24305a" fg="#ffffff" />
    <Sign p={[7, 18.6, 0.02]} w={9} h={6} text={'AWAY\n14'} bg="#24503a" fg="#ffffff" />
    <Sign p={[0, 18.6, 0.02]} w={4.2} h={6} text={'Q4\n2:00'} bg="#111522" fg="#ffd27e" />
    <Sign p={[0, 14.4, 0.02]} w={24} h={1.6} text="GOOOL!" bg="#111522" fg="#7fe0ff" />
    {on && <Halo p={[0, 19.5, 2]} r={16} c="#9fb8ff" o={0.18} />}
  </At>
);

const BOARD_TEXT = ['HOME', 'GO TEAM!', 'STICK SODA', 'SPORTS 24', 'FAST FOOD', 'DEFENSE!', 'HOT DOGS', 'PURPLE PRIDE'];
// empty variant = a school field: school banners instead of game-day ads (PT-BR content)
const SCHOOL_TEXT = ['ESCOLA', 'VAI, TIME!', 'EDUCAÇÃO FÍSICA', 'CANTINA', 'JOGOS ESCOLARES', 'FEIRA DE CIÊNCIAS', 'TORNEIO', 'BIBLIOTECA'];
const BOARD_BG = ['#6d3fc4', '#2f4f9a', '#3fb3c4', '#1d2333', '#f2b632', '#2f7a5a'];

const Field: React.FC = React.memo(() => {
  const stripes: Inst[] = [];
  const lines: Inst[] = [];
  // 5-yard mowing stripes between the goal lines
  for (let i = 0; i < 20; i++) {
    const x = -GOAL_LINE + (i + 0.5) * 5 * YD;
    stripes.push({ p: [x, TURF_Y / 2, 0], s: [5 * YD, TURF_Y, HW * 2], c: i % 2 ? '#5fb54c' : '#55a845' });
  }
  // yard lines (every 5 yd), goal lines thicker
  for (let i = 0; i <= 20; i++) {
    const x = -GOAL_LINE + i * 5 * YD;
    lines.push({ p: [x, TURF_Y + 0.006, 0], s: [i % 20 === 0 ? 0.2 : 0.11, 0.012, HW * 2] });
  }
  // hash marks every yard: near both sidelines and the two inbound rows
  for (let i = 1; i < 100; i++) {
    if (i % 5 === 0) continue;
    const x = -GOAL_LINE + i * YD;
    [HW - 0.5, 2.82, -2.82, -HW + 0.5].forEach(z => lines.push({ p: [x, TURF_Y + 0.006, z], s: [0.1, 0.012, 0.6] }));
  }
  // border
  [-1, 1].forEach(s => {
    lines.push({ p: [0, TURF_Y + 0.006, s * (HW + 0.1)], s: [HL * 2 + 0.4, 0.012, 0.2] });
    lines.push({ p: [s * (HL + 0.1), TURF_Y + 0.006, 0], s: [0.2, 0.012, HW * 2 + 0.4] });
  });
  const nums = ['10', '20', '30', '40', '50', '40', '30', '20', '10'];
  return (
    <group>
      <Instances geo={G.box} mat={envMaterial('#ffffff')} items={() => stripes} k="stripes" />
      {[-1, 1].map(s => (
        <group key={s}>
          <Box p={[s * (GOAL_LINE + 5 * YD), TURF_Y / 2, 0]} s={[10 * YD, TURF_Y, HW * 2]} c={s > 0 ? HOME : AWAY} shadow={false} />
          <group position={[s * (GOAL_LINE + 5 * YD), TURF_Y + 0.004, 0]} rotation={[0, -s * Math.PI / 2, 0]}>
            <mesh geometry={G.plane} material={mapMaterial(textTexture('CASA', { w: 1024, h: 256, fg: '#ffffff' }), false, true)} rotation={[-Math.PI / 2, 0, 0]} scale={[34, 8.5, 1]} receiveShadow />
          </group>
        </group>
      ))}
      <Instances geo={G.box} mat={decalMaterial('#f6f4ee')} items={() => lines} k="lines" />
      {/* yard numbers, bottoms towards their sideline */}
      {nums.map((n, i) => {
        const x = -GOAL_LINE + (i + 1) * 10 * YD;
        return [-1, 1].map(s => (
          <group key={`${i}${s}`} position={[x, TURF_Y + 0.004, s * (HW - 11.9)]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
            <mesh geometry={G.plane} material={mapMaterial(textTexture(n, { w: 256, h: 192, fg: '#f6f4ee' }), false, true)} rotation={[-Math.PI / 2, 0, 0]} scale={[3.2, 2.4, 1]} receiveShadow />
          </group>
        ));
      })}
      {/* midfield logo */}
      <mesh geometry={G.circle} material={decalMaterial('#6d3fc4')} position={[0, TURF_Y + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={4.2} receiveShadow />
      <mesh geometry={G.circle} material={decalMaterial('#9f7bea')} position={[0, TURF_Y + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={3.7} receiveShadow />
      <mesh geometry={G.plane} material={mapMaterial(textTexture('E.E.\nSOL',{ w: 256, h: 256, fg: '#ffffff' }), false, true)} position={[0, TURF_Y + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={5.4} receiveShadow />
      {/* pylons */}
      {[-1, 1].map(sx => [-1, 1].map(sz => [GOAL_LINE, HL].map(x => <Box key={`${sx}${sz}${x}`} p={[sx * x, 0.25, sz * HW]} s={[0.12, 0.46, 0.12]} c="#ff7a1f" />)))}
      <GoalPost x={HL} />
      <GoalPost x={-HL} />
    </group>
  );
});

const Stand: React.FC<{ st: StandSpec; i: number; empty?: boolean }> = React.memo(({ st, i, empty }) => {
  const crowd = React.useMemo(() => crowdFor(st), [st]);
  const geo = st.rows === LONG_ROWS ? longStand : endStand;
  const top = H0 + st.rows * RISE;
  const boards: React.ReactNode[] = [];
  const nb = Math.floor(st.len / 9);
  for (let b = 0; b < nb; b++) {
    const w = -st.len / 2 + (b + 0.5) * (st.len / nb);
    const k = (b + i * 3) % BOARD_TEXT.length;
    const text = (empty ? SCHOOL_TEXT : BOARD_TEXT)[k];
    const p = standToWorld(st, -0.02, 1.15, w);
    boards.push(<Sign key={b} p={p} r={st.ry + Math.PI / 2 + Math.PI} w={st.len / nb - 0.4} h={1.5} text={text} bg={BOARD_BG[(b + i) % BOARD_BG.length]} fg="#ffffff" />);
  }
  return (
    <group>
      <mesh geometry={geo} material={envMaterial(i < 2 ? '#8e9ab3' : '#9aa3b8')} position={st.at} rotation={[0, st.ry, 0]} scale={[1, 1, st.len]} castShadow receiveShadow />
      {/* aisle stripes (stairs) on the long stands */}
      {st.rows === LONG_ROWS && AISLES.map(w => {
        const p = standToWorld(st, (st.rows * RD) / 2, H0 + (st.rows * RISE) / 2 + 0.02, w);
        return <mesh key={w} geometry={G.box} material={envMaterial('#c9ced9')} position={p} rotation={[0, st.ry, Math.atan2(RISE, RD)]} scale={[Math.hypot(st.rows * RD, st.rows * RISE), 0.06, 1.2]} receiveShadow />;
      })}
      {/* roof canopy over the long stands */}
      {st.rows === LONG_ROWS && (
        <>
          <mesh geometry={G.box} material={envMaterial('#e9ebef')} position={standToWorld(st, st.rows * RD - 8, top + 7.6, 0)} rotation={[0, st.ry, 0]} scale={[17, 0.6, st.len + 2]} castShadow receiveShadow />
          {[-48, -24, 0, 24, 48].map(w => (
            <mesh key={w} geometry={G.box} material={envMaterial('#c9ced9')} position={standToWorld(st, st.rows * RD + 0.3, top + 3.65, w)} rotation={[0, st.ry, 0]} scale={[0.5, 7.5, 0.5]} castShadow />
          ))}
        </>
      )}
      {boards}
      {!empty && (
        <>
          <Instances geo={torsoGeo} mat={envMaterial('#ffffff')} items={() => crowd.bodies} k={`b${i}`} />
          <Instances geo={armGeo} mat={inkMaterial()} items={() => crowd.arms} k={`a${i}`} receive={false} />
          <Instances geo={headGeo} mat={inkMaterial()} items={() => crowd.heads} k={`h${i}`} receive={false} />
        </>
      )}
    </group>
  );
});

const StadiumScene: React.FC<{ time: string; empty?: boolean }> = React.memo(({ time, empty }) => {
  const on = lampsOn(time);
  return (
    <group>
      {/* apron turf and outer concourse */}
      <mesh geometry={G.plane} material={envMaterial('#4c9a45')} rotation={[-Math.PI / 2, 0, 0]} scale={[2 * STAND_X + 2, 2 * STAND_Z + 2, 1]} receiveShadow />
      <mesh geometry={G.plane} material={envMaterial('#9aa0ac')} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} scale={[900, 900, 1]} receiveShadow />
      <Field />
      {STANDS.map((st, i) => <Stand key={i} st={st} i={i} empty={empty} />)}
      {/* corner walls close the gaps between stands */}
      {[-1, 1].map(sx => [-1, 1].map(sz => (
        <Box key={`${sx}${sz}`} p={[sx * (STAND_X - 4), 2.2, sz * (STAND_Z + 6)]} s={[8, 4.4, 12]} c="#7f8aa3" />
      )))}
      {/* team benches + coolers */}
      {[-1, 1].map(s => (
        <group key={s}>
          <Box p={[-15, 0.45, s * 29.2]} s={[14, 0.12, 0.6]} c={s > 0 ? HOME : AWAY} />
          <Box p={[-15, 0.8, s * 29.55]} s={[14, 0.6, 0.1]} c={s > 0 ? HOME : AWAY} />
          {[-21, -17, -13, -9].map(x => <Box key={x} p={[x, 0.22, s * 29.2]} s={[0.1, 0.44, 0.5]} c="#2a2d36" />)}
          {[-23, -7].map(x => (
            <group key={x}>
              <Cyl p={[x, 0.35, s * 28.6]} s={[0.32, 0.7, 0.32]} c="#ff8a1f" />
              <Cyl p={[x, 0.74, s * 28.6]} s={[0.34, 0.08, 0.34]} c="#f4f1ea" />
            </group>
          ))}
        </group>
      ))}
      {[[-62, -42], [62, -42], [-62, 42], [62, 42]].map(([x, z], i) => <Floodlight key={i} p={[x, 0, z]} on={on} />)}
      <Scoreboard on={on} />
      {/* distant city silhouette so the horizon isn't empty above the stands */}
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + 0.2;
        const h = 28 + ((i * 37) % 5) * 7;
        return <Box key={i} p={[Math.cos(a) * 190, h / 2, Math.sin(a) * 190]} s={[22, h, 22]} c={mix('#8e98b0', '#c4cbe0', (i % 3) / 3)} shadow={false} />;
      })}
    </group>
  );
});

// variant odd = empty stands (a school field on a day with no game)
export const StadiumSet: React.FC<SetProps> = ({ time, variant }) => <StadiumScene time={time} empty={variant % 2 === 1} />;

export const STADIUM_MARKS: Record<string, Vec3> = {
  midfield: [0, TURF_Y, 0], // on the 50 (midfield logo)
  center: [0, TURF_Y, 3.5],
  goal: [GOAL_LINE + 4, TURF_Y, 0], // in the east end zone, goal posts behind (+x)
  goalLine: [GOAL_LINE, TURF_Y, -1.5],
  sideline: [-6, TURF_Y, HW + 1.6], // near (+z) sideline, team bench behind
  bench: [-14, 0, 29.2], // seat of the home bench (sit with rot 180 = facing the field)
  stands: [0, H0 + 3 * RISE, STAND_Z + 3 * RD + RD * 0.55], // gap in the crowd, near stand row 4 (rot 180 faces the field)
  tunnel: [-STAND_X + 2, 0, STAND_Z + 2], // corner by the west end
};
