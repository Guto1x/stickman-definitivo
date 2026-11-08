// School classroom in IFOLOGY "Stop Time" colours: navy lower walls, white rail, yellow upper
// walls, grey checker floor, light panels. The whiteboard is on the LEFT wall (x=-6) and the
// 4×5 grid of desks faces it (students look -x), so a camera on the open +z side sees the class
// in cross-section, a camera by the board sees faces, and a camera behind the desks sees the board.
// Room x∈[-6,6], back wall z=-5 (windows), ceiling 3.2, one-sided fourth wall at z=6.
// variant even = seated extras fill most desks; variant odd = empty classroom.
import React from 'react';
import type { SetProps } from './index';
import type { Vec3 } from '../types';
import { At, Box, Chair, Door, G, WallClock, mix, rng } from './kit';
import { envMaterial } from '../engine/materials';
import {
  Batch, Batched, BOLD_FONT, CeilingPanel, checkerFloor, HAND_FONT, isNight, LeafPlant, Painted, Picture, Pinboard, RoomWindow, seatedExtra, Shell,
} from './roomkit';

export const SCHOOL = { x0: -6, x1: 6, z0: -5, z1: 6, h: 3.2 };
export const NAVY = '#3f5c9c';
export const YELLOW = '#efcd72';
export const SHIRTS = ['#2f9e5b', '#e8742f', '#3d6fb6', '#c43c8f', '#f2b632', '#ece6da', '#7a7fd0', '#3fb3c4', '#7bc043'];
export const PANTS = ['#2b2f3d', '#3a4a7a', '#4a3a2a', '#2f3f5f'];

/** Navy/yellow school room shell + floor + windows + ceiling panels (shared with the cafeteria). */
export const SchoolShell: React.FC<{ night: boolean; windowsX: number[]; panelsX: number[]; panelsZ: number[] }> = ({ night, windowsX, panelsX, panelsZ }) => {
  const { x0, x1, z0, z1, h } = SCHOOL;
  return (
    <>
      <Batched id="school-floor" build={b => checkerFloor(b, x0, x1, z0, z1, 0.6, '#cfd1d6', '#aeb2bb')} />
      <Shell x0={x0} x1={x1} z0={z0} z1={z1} h={h} wall={YELLOW} lower={NAVY} railY={1.15} rail="#eef0f2" base="#2c3f6e" ceiling="#ecebe6" ceilingEmissive={night ? '#2c2c2c' : '#9a9994'} fourth />
      {windowsX.map((x, i) => (
        <RoomWindow key={i} p={[x, 2.0, z0]} w={2.0} h={1.45} cols={3} night={night} seed={i + 1} frame="#eef0f2" />
      ))}
      {panelsX.map(x => panelsZ.map(z => <CeilingPanel key={`${x}|${z}`} p={[x, h, z]} w={1.3} d={0.62} />))}
    </>
  );
};

/** Red banner with coloured dots (from the Stop Time cafeteria). Local +z out of the wall. */
export const DotBanner: React.FC<{ p: Vec3; r?: number; w?: number }> = ({ p, r = 0, w = 3.0 }) => {
  const cols = ['#f4efe2', '#3d8fd6', '#f2b632', '#f4efe2', '#e46f8e', '#7bc043', '#f4efe2'];
  const n = Math.max(3, Math.round(w / 0.45));
  return (
    <At p={p} r={r}>
      <Box p={[0, 0, 0.015]} s={[w, 0.5, 0.03]} c="#c8364a" />
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} geometry={G.circle} material={envMaterial(cols[i % cols.length])} position={[-w / 2 + (i + 0.5) * (w / n), 0, 0.032]} scale={0.14} receiveShadow />
      ))}
    </At>
  );
};

export const TextPoster: React.FC<{ id: string; p: Vec3; r?: number; w: number; h: number; text: string; bg: string; fg: string; sub?: string }> = ({ id, p, r = 0, w, h, text, bg, fg, sub }) => (
  <At p={p} r={r}>
    <Box p={[0, 0, 0.008]} s={[w + 0.04, h + 0.04, 0.016]} c="#f4f1ea" />
    <Painted
      id={`poster-${id}`}
      p={[0, 0, 0.018]}
      w={w}
      h={h}
      draw={(g, W, H) => {
        g.fillStyle = bg;
        g.fillRect(0, 0, W, H);
        g.fillStyle = fg;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.font = `800 ${Math.min(H * 0.3, (W * 1.5) / text.length)}px ${BOLD_FONT}`;
        g.fillText(text, W / 2, sub ? H * 0.32 : H / 2);
        if (sub) {
          g.font = `600 ${H * 0.11}px ${BOLD_FONT}`;
          sub.split('\n').forEach((l, i) => g.fillText(l, W / 2, H * (0.62 + i * 0.14)));
        }
      }}
    />
  </At>
);

const drawBoard = (g: CanvasRenderingContext2D, W: number, H: number) => {
  g.fillStyle = '#f8f8f4';
  g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(160,175,195,0.12)';
  g.beginPath();
  g.ellipse(W * 0.55, H * 0.6, W * 0.2, H * 0.3, 0.2, 0, Math.PI * 2);
  g.fill();
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#2a55b8';
  g.font = `bold ${H * 0.16}px ${HAND_FONT}`;
  g.fillText('VULCÕES!', W * 0.05, H * 0.24);
  g.strokeStyle = '#2a55b8';
  g.lineWidth = H * 0.012;
  g.beginPath();
  g.moveTo(W * 0.05, H * 0.29);
  g.bezierCurveTo(W * 0.2, H * 0.27, W * 0.35, H * 0.31, W * 0.52, H * 0.28);
  g.stroke();
  g.fillStyle = '#2a2b33';
  g.font = `${H * 0.11}px ${HAND_FONT}`;
  g.fillText('magma → lava → rocha', W * 0.07, H * 0.5);
  g.fillStyle = '#2f8f4e';
  g.fillText('1.200 °C  (muito quente)', W * 0.07, H * 0.7);
  g.fillStyle = '#d23a3a';
  g.fillText('x 10 = ?', W * 0.07, H * 0.88);
  // red clock doodle
  const cx = W * 0.8, cy = H * 0.48, rr = H * 0.26;
  g.strokeStyle = '#d23a3a';
  g.lineWidth = H * 0.018;
  g.beginPath();
  g.arc(cx, cy, rr, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.moveTo(cx, cy);
  g.lineTo(cx, cy - rr * 0.7);
  g.moveTo(cx, cy);
  g.lineTo(cx + rr * 0.5, cy + rr * 0.15);
  g.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    g.beginPath();
    g.moveTo(cx + Math.sin(a) * rr * 0.82, cy - Math.cos(a) * rr * 0.82);
    g.lineTo(cx + Math.sin(a) * rr * 0.92, cy - Math.cos(a) * rr * 0.92);
    g.stroke();
  }
  // stick-figure doodle
  g.strokeStyle = '#2a2b33';
  g.lineWidth = H * 0.012;
  const sx = W * 0.6, sy = H * 0.62;
  g.beginPath();
  g.arc(sx, sy, H * 0.05, 0, Math.PI * 2);
  g.moveTo(sx, sy + H * 0.05);
  g.lineTo(sx, sy + H * 0.2);
  g.moveTo(sx - H * 0.08, sy + H * 0.1);
  g.lineTo(sx + H * 0.08, sy + H * 0.1);
  g.moveTo(sx, sy + H * 0.2);
  g.lineTo(sx - H * 0.06, sy + H * 0.3);
  g.moveTo(sx, sy + H * 0.2);
  g.lineTo(sx + H * 0.06, sy + H * 0.3);
  g.stroke();
};

const drawMap = (g: CanvasRenderingContext2D, W: number, H: number) => {
  g.fillStyle = '#86c5ea';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,0.45)';
  g.lineWidth = 2;
  for (let i = 1; i < 6; i++) {
    g.beginPath();
    g.moveTo((i * W) / 6, 0);
    g.lineTo((i * W) / 6, H);
    g.stroke();
  }
  for (let i = 1; i < 4; i++) {
    g.beginPath();
    g.moveTo(0, (i * H) / 4);
    g.lineTo(W, (i * H) / 4);
    g.stroke();
  }
  const land = (pts: [number, number, number, number][], c: string) => {
    g.fillStyle = c;
    pts.forEach(([x, y, rx, ry]) => {
      g.beginPath();
      g.ellipse(x * W, y * H, rx * W, ry * H, 0, 0, Math.PI * 2);
      g.fill();
    });
  };
  land([[0.2, 0.3, 0.1, 0.12], [0.25, 0.45, 0.05, 0.1], [0.28, 0.68, 0.05, 0.14]], '#7bc043');
  land([[0.5, 0.3, 0.06, 0.1], [0.52, 0.55, 0.07, 0.16]], '#f2b632');
  land([[0.7, 0.3, 0.14, 0.13], [0.82, 0.72, 0.06, 0.07]], '#e46f8e');
};

function buildDesks(b: Batch) {
  const rand = rng(77);
  const top = '#efe6d3', metal = '#34405f', seat = '#3b5fa8';
  for (const xs of SEAT_X)
    for (const zs of SEAT_Z)
      b.at([xs, 0, zs], -Math.PI / 2, () => {
        // chair (student faces local +z)
        b.box([0, 0.45, 0], [0.44, 0.04, 0.42], seat);
        b.box([0, 0.8, -0.21], [0.44, 0.3, 0.035], seat, [-0.08, 0, 0]);
        for (const [x, z] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) b.box([x, 0.22, z], [0.03, 0.45, 0.03], metal);
        b.box([-0.19, 0.64, -0.2], [0.03, 0.36, 0.03], metal);
        b.box([0.19, 0.64, -0.2], [0.03, 0.36, 0.03], metal);
        // desk
        b.box([0, 0.74, 0.47], [0.72, 0.04, 0.52], top);
        b.box([0, 0.6, 0.5], [0.64, 0.02, 0.4], metal, 0, { cast: false });
        for (const [x, z] of [[-0.32, 0.25], [0.32, 0.25], [-0.32, 0.69], [0.32, 0.69]]) b.box([x, 0.36, z], [0.035, 0.72, 0.035], metal);
        // a few things on desks
        const k = rand();
        if (k < 0.35) {
          b.box([-0.08, 0.766, 0.5], [0.3, 0.012, 0.22], '#f8f6f0', [0, 0.15, 0], { cast: false });
          b.box([0.15, 0.768, 0.5], [0.012, 0.012, 0.16], '#2a55b8', [0, 0.4, 0], { cast: false });
        } else if (k < 0.65) {
          b.box([0.1, 0.775, 0.48], [0.2, 0.03, 0.26], SHIRTS[Math.floor(rand() * SHIRTS.length)], [0, -0.2, 0]);
        } else if (k < 0.8) {
          b.box([-0.12, 0.765, 0.45], [0.22, 0.01, 0.28], '#f8f6f0', [0, -0.1, 0], { cast: false });
        }
      });
}

export const SEAT_X = [-1.6, 0.2, 2.0, 3.8];
export const SEAT_Z = [-3.4, -1.7, 0, 1.7, 3.4];
const FREE = new Set(['0.2|1.7', '2|1.7', '0.2|0']);

function buildExtras(b: Batch) {
  const rand = rng(31);
  let n = 0;
  for (const xs of SEAT_X)
    for (const zs of SEAT_Z) {
      const fill = rand() < 0.75;
      if (FREE.has(`${xs}|${zs}`) || !fill) continue;
      seatedExtra(b, [xs, 0, zs], -Math.PI / 2, SHIRTS[Math.floor(rand() * SHIRTS.length)], PANTS[Math.floor(rand() * PANTS.length)], n++);
    }
}

function buildTeacherArea(b: Batch) {
  // teacher's desk, front panel faces the class (+x)
  b.at([-4.3, 0, 2.2], Math.PI / 2, () => {
    const wood = '#b98a5e';
    b.box([0, 0.76, 0], [1.5, 0.05, 0.75], wood);
    b.box([0, 0.4, 0.33], [1.46, 0.66, 0.04], mix(wood, '#000000', 0.12));
    b.box([-0.71, 0.37, 0], [0.04, 0.74, 0.7], mix(wood, '#000000', 0.2));
    b.box([0.71, 0.37, 0], [0.04, 0.74, 0.7], mix(wood, '#000000', 0.2));
    // apple, books, papers, globe
    b.add('sphere', '#d9332b', [0.5, 0.84, 0.15], 0.05);
    b.box([0.5, 0.9, 0.15], [0.008, 0.03, 0.008], '#5b3d2e');
    b.box([-0.45, 0.8, -0.05], [0.28, 0.04, 0.36], '#3d6fb6', 0.1);
    b.box([-0.45, 0.84, -0.05], [0.26, 0.04, 0.34], '#e8742f', -0.12);
    b.box([0.05, 0.79, 0.0], [0.3, 0.01, 0.22], '#f8f6f0', 0.3, { cast: false });
    b.add('cyl', '#3a3438', [0.0, 0.8, -0.22], [0.08, 0.02, 0.08]);
    b.add('cyl', '#3a3438', [0.0, 0.88, -0.22], [0.012, 0.16, 0.012]);
    b.add('sphere', '#3d8fd6', [0.0, 1.06, -0.22], 0.13);
    b.add('ico', '#7bc043', [0.07, 1.1, -0.15], [0.07, 0.06, 0.05]);
    b.add('ico', '#7bc043', [-0.06, 1.0, -0.13], [0.05, 0.06, 0.05]);
  });
  // whiteboard frame + tray on the left wall (board face drawn separately)
  b.at([SCHOOL.x0, 0, -0.6], Math.PI / 2, () => {
    b.box([0, 1.6, 0.025], [4.36, 1.42, 0.05], '#b9bcc4');
    b.box([0, 0.86, 0.08], [3.2, 0.035, 0.12], '#b9bcc4');
    ['#d23a3a', '#2a55b8', '#2f8f4e'].forEach((c, i) => b.add('cyl', c, [-0.4 + i * 0.16, 0.893, 0.09], [0.012, 0.12, 0.012], [0, 0, Math.PI / 2]));
    b.box([0.6, 0.895, 0.09], [0.14, 0.035, 0.06], '#2a2b33');
  });
  // cubbies with coloured bins on the right wall (open side faces -x)
  b.at([SCHOOL.x1, 0, -1.6], -Math.PI / 2, () => {
    const wood = '#d8b27c';
    b.box([0, 0.46, 0.2], [2.6, 0.92, 0.4], wood);
    const bins = ['#d94040', '#3d6fb6', '#f2b632', '#2f9e5b', '#e8742f', '#3fb3c4'];
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 2; j++) b.box([-1.08 + i * 0.432, 0.25 + j * 0.42, 0.33], [0.38, 0.33, 0.16], bins[(i + j * 3) % 6]);
    // trash bin by the cubbies
    b.add('cyl', '#3a4a7a', [1.65, 0.33, 0.3], [0.2, 0.66, 0.2]);
  });
}

export const Classroom: React.FC<SetProps> = ({ t, time, variant }) => {
  const night = isNight(time);
  const { x0, x1, z0 } = SCHOOL;
  return (
    <group>
      <SchoolShell night={night} windowsX={[-3.4, 0.4, 4.0]} panelsX={[-3.2, 0.6, 4.0]} panelsZ={[-2.8, 0.2, 3.2]} />
      <Batched id="classroom-desks" build={buildDesks} />
      {variant % 2 === 0 && <Batched id="classroom-extras" build={buildExtras} />}
      <Batched id="classroom-teacher" build={buildTeacherArea} />
      {/* board face, clock, door, posters (left wall faces +x) */}
      <Painted id="classroom-board" p={[x0 + 0.052, 1.6, -0.6]} r={Math.PI / 2} w={4.2} h={1.28} draw={drawBoard} />
      <WallClock p={[x0 + 0.05, 2.72, -0.6]} r={Math.PI / 2} s={0.75} t={t} />
      <Door p={[x0, 0, 4.2]} r={Math.PI / 2} c="#2c3f6e" frame="#eef0f2" />
      <TextPoster id="read" p={[x0 + 0.005, 1.85, -3.75]} r={Math.PI / 2} w={0.7} h={0.95} text="LEIA!" bg="#f2b632" fg="#2c3f6e" sub={'todo dia\ntoda noite'} />
      <Chair p={[-4.95, 0, 2.2]} r={Math.PI / 2} c="#2c3f6e" />
      {/* right wall: banner, pin board, map, posters */}
      <DotBanner p={[x1 - 0.005, 2.62, -1.6]} r={-Math.PI / 2} w={3.0} />
      <Painted id="classroom-map" p={[x1 - 0.03, 1.85, 1.6]} r={-Math.PI / 2} w={1.7} h={1.05} draw={drawMap} />
      <Box p={[x1 - 0.0125, 1.85, 1.6]} s={[0.025, 1.13, 1.78]} c="#2a2b33" />
      <Pinboard p={[x1, 1.75, 3.9]} r={-Math.PI / 2} w={1.3} h={0.9} seed={4} />
      <TextPoster id="science" p={[x1 - 0.005, 1.75, -4.1]} r={-Math.PI / 2} w={0.62} h={0.85} text="CIÊNCIAS" bg="#3fb3c4" fg="#f4efe2" sub={'pergunte por quê'} />
      {/* back wall between windows */}
      <Picture p={[-1.5, 2.05, z0]} w={0.55} h={0.75} art="dots" frame="#2c3f6e" />
      <TextPoster id="math" p={[2.2, 2.05, z0]} r={0} w={0.6} h={0.8} text="MATEMÁTICA" bg="#e46f8e" fg="#f4efe2" sub={'1 + 1 = 2'} />
      <LeafPlant p={[-5.4, 0, z0 + 0.5]} s={1.3} pot="#e8742f" seed={6} />
      <LeafPlant p={[5.45, 0, z0 + 0.5]} s={1.2} pot="#3fb3c4" seed={9} />
    </group>
  );
};

export const CLASSROOM_MARKS: Record<string, Vec3> = {
  center: [0.4, 0, 4.9],
  board: [-5.0, 0, -0.6],
  front: [-3.2, 0, -0.6],
  teacher: [-4.95, 0, 2.2],
  seat1: [0.2, 0, 1.7],
  seat2: [2.0, 0, 1.7],
  seat3: [0.2, 0, 0],
  aisle: [1.1, 0, 0.85],
  window: [0.4, 0, -4.2],
  door: [-5.4, 0, 4.2],
};

