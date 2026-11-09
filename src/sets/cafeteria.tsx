// School cafeteria from IFOLOGY "Stop Time": navy/yellow walls, grey checker floor, long white
// tables with attached navy benches and lunch trays, menu board, dot banner, wall clock, bins.
// Shares the classroom shell: x∈[-6,6], back wall z=-5, ceiling 3.2, one-sided fourth wall z=6.
// Tables run along x in three rows (z=-3.2,-0.8,1.6), two per row (x=±3) with a 2 m centre aisle.
// variant even = seated extras with trays; variant odd = empty hall (trays stay).
import React from 'react';
import type { SetProps } from './index';
import type { Vec3 } from '../types';
import { Box, Door, WallClock, rng } from './kit';
import { Batch, Batched, BOLD_FONT, isNight, LeafPlant, Painted, Picture, seatedExtra } from './roomkit';
import { DotBanner, PANTS, SCHOOL, SchoolShell, SHIRTS, TextPoster } from './classroom';

const ROWS_Z = [-3.2, -0.8, 1.6];
const TABLES_X = [-3.0, 3.0];
const SEATS = [-1.5, -0.75, 0, 0.75, 1.5];
const BENCH = 0.62; // bench offset from table centre line
// seats kept free for the cast (key = x|z of the seat)
const FREE = new Set(['2.25|0.98', '-3|0.98', '3|2.22', '-2.25|-1.42']);
const k = (x: number, z: number) => `${+x.toFixed(2)}|${+z.toFixed(2)}`;

function tray(b: Batch, p: Vec3, yaw: number, rand: () => number) {
  const trays = ['#4e9a6b', '#e8742f', '#3d6fb6', '#e46f8e'];
  b.at(p, yaw, () => {
    b.box([0, 0.008, 0], [0.4, 0.016, 0.28], trays[Math.floor(rand() * trays.length)], 0, { cast: false });
    b.add('sphere', '#d9a35f', [-0.1, 0.045, -0.04], [0.07, 0.035, 0.05]);
    if (rand() < 0.7) b.add('sphere', rand() < 0.5 ? '#d9332b' : '#9bc53d', [0.05, 0.05, -0.06], 0.04);
    if (rand() < 0.6) {
      b.box([0.13, 0.065, 0.06], [0.06, 0.1, 0.06], '#f4f1ea');
      b.box([0.13, 0.085, 0.091], [0.05, 0.035, 0.004], '#3d6fb6', 0, { cast: false });
    } else b.add('cyl', '#f6a3a8', [0.13, 0.06, 0.06], [0.035, 0.09, 0.035]);
    b.box([-0.05, 0.02, 0.07], [0.16, 0.012, 0.08], '#f2c94c', 0, { cast: false });
  });
}

function buildTables(b: Batch) {
  const rand = rng(53);
  const top = '#eceae4', navy = '#34508f', metal = '#2c3550';
  for (const zt of ROWS_Z)
    for (const xt of TABLES_X) {
      // table top + pedestal legs
      b.box([xt, 0.74, zt], [4.0, 0.05, 0.9], top);
      b.box([xt, 0.705, zt], [3.9, 0.03, 0.8], '#c9c7c0', 0, { cast: false });
      for (const lx of [-1.4, 1.4]) {
        b.box([xt + lx, 0.36, zt], [0.08, 0.7, 0.08], metal);
        b.box([xt + lx, 0.03, zt], [0.1, 0.06, 1.9], metal);
      }
      // benches on both sides
      for (const sd of [-1, 1]) {
        b.box([xt, 0.44, zt + sd * BENCH], [3.9, 0.06, 0.32], navy);
        b.box([xt, 0.41, zt + sd * BENCH], [3.8, 0.03, 0.26], '#2a3f75', 0, { cast: false });
        for (const lx of [-1.4, 1.4]) b.box([xt + lx, 0.21, zt + sd * BENCH], [0.06, 0.42, 0.06], metal);
      }
      // trays: in front of most seats
      for (const sd of [-1, 1])
        for (const sx of SEATS)
          if (rand() < 0.55) tray(b, [xt + sx, 0.765, zt + sd * 0.24], sd > 0 ? Math.PI : 0, rand);
    }
}

function buildExtras(b: Batch) {
  const rand = rng(91);
  let n = 0;
  for (const zt of ROWS_Z)
    for (const xt of TABLES_X)
      for (const sd of [-1, 1])
        for (const sx of SEATS) {
          const x = xt + sx, z = zt + sd * BENCH;
          const fill = rand() < 0.5;
          if (FREE.has(k(x, z)) || !fill) continue;
          // north bench (sd=-1) faces +z, south bench faces -z
          seatedExtra(b, [x, 0, z], sd < 0 ? 0 : Math.PI, SHIRTS[Math.floor(rand() * SHIRTS.length)], PANTS[Math.floor(rand() * PANTS.length)], 200 + n++, true, 0.32);
        }
}

function buildProps(b: Batch) {
  // trash bins + tray return on the right wall
  const { x1 } = SCHOOL;
  for (const [z, c] of [[-1.6, '#3a4a7a'], [-0.9, '#2f9e5b']] as [number, string][]) {
    b.add('cyl', c, [x1 - 0.4, 0.42, z], [0.26, 0.84, 0.26]);
    b.add('cyl', '#2a2b33', [x1 - 0.4, 0.85, z], [0.27, 0.04, 0.27]);
  }
  b.box([x1 - 0.35, 0.45, 1.0], [0.7, 0.9, 1.8], '#b9bcc4');
  b.box([x1 - 0.35, 0.92, 1.0], [0.74, 0.05, 1.84], '#d9dbe0');
  [0.4, 0.75, 1.1, 1.45].forEach((z, i) => b.box([x1 - 0.35, 0.96 + i * 0.018, z], [0.4, 0.016, 0.28], ['#4e9a6b', '#e8742f', '#3d6fb6', '#e46f8e'][i]));
}

const drawMenu = (g: CanvasRenderingContext2D, W: number, H: number) => {
  g.fillStyle = '#1f2d55';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#f2b632';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${H * 0.16}px ${BOLD_FONT}`;
  g.fillText('CARDÁPIO DE HOJE', W / 2, H * 0.14);
  const items: [string, string][] = [['PIZZA', '5,00'], ['MACARRÃO', '4,00'], ['SALADA', '3,50'], ['MAÇÃ', '1,00'], ['SUCO', '2,00']];
  g.font = `700 ${H * 0.1}px ${BOLD_FONT}`;
  items.forEach(([a, p], i) => {
    const y = H * (0.32 + i * 0.14);
    g.textAlign = 'left';
    g.fillStyle = '#f4f1ea';
    g.fillText(a, W * 0.08, y);
    g.textAlign = 'right';
    g.fillStyle = '#f2b632';
    g.fillText(p, W * 0.92, y);
  });
};

/** Solid furniture for the clip audit (same builders the set draws). */
export const CAFETERIA_SOLIDS = (variant: number) => [
  { name: 'tables', build: buildTables }, { name: 'counter props', build: buildProps },
  ...(variant % 2 === 0 ? [{ name: 'seated extras', build: buildExtras }] : []),
];

export const Cafeteria: React.FC<SetProps> = ({ t, time, variant }) => {
  const night = isNight(time);
  const { x0, x1, z0 } = SCHOOL;
  return (
    <group>
      <SchoolShell night={night} windowsX={[-3.9, 3.9]} panelsX={[-3.0, 0, 3.0]} panelsZ={[-2.8, 0.2, 3.2]} />
      <Batched id="cafeteria-tables" build={buildTables} />
      {variant % 2 === 0 && <Batched id="cafeteria-extras" build={buildExtras} />}
      <Batched id="cafeteria-props" build={buildProps} />
      {/* back wall: menu board between the windows, clock */}
      <Box p={[0, 2.05, z0 + 0.03]} s={[2.5, 1.32, 0.06]} c="#2a2b33" />
      <Painted id="cafeteria-menu" p={[0, 2.05, z0 + 0.062]} w={2.36} h={1.2} draw={drawMenu} />
      <WallClock p={[-1.95, 2.55, z0 + 0.05]} s={0.7} t={t} />
      <TextPoster id="eat" p={[1.75, 2.0, z0]} w={0.55} h={0.75} text="COMA" bg="#7bc043" fg="#f4efe2" sub={'verduras\ntodo dia'} />
      {/* left wall: banner + posters + door */}
      <DotBanner p={[x0 + 0.005, 2.55, -1.0]} r={Math.PI / 2} w={3.6} />
      <Picture p={[x0 + 0.005, 1.8, 1.9]} r={Math.PI / 2} w={0.6} h={0.8} art="abstract" seed={7} frame="#2c3f6e" />
      <Door p={[x0, 0, 4.3]} r={Math.PI / 2} c="#2c3f6e" frame="#eef0f2" />
      <Door p={[x0, 0, -3.4]} r={Math.PI / 2} c="#2c3f6e" frame="#eef0f2" />
      {/* right wall */}
      <TextPoster id="wash" p={[x1 - 0.005, 1.85, -3.4]} r={-Math.PI / 2} w={0.6} h={0.8} text="LAVE" bg="#3fb3c4" fg="#f4efe2" sub={'as\nmãos'} />
      <Picture p={[x1 - 0.005, 1.95, 3.2]} r={-Math.PI / 2} w={0.8} h={0.6} art="dots" frame="#2c3f6e" />
      <LeafPlant p={[x1 - 0.5, 0, z0 + 0.5]} s={1.2} pot="#e8742f" seed={11} />
    </group>
  );
};

export const CAFETERIA_MARKS: Record<string, Vec3> = {
  center: [0, 0, 3.8],
  aisle: [0, 0, 0.4],
  seat1: [2.25, 0, 0.98],
  seat2: [-3.0, 0, 0.98],
  seat3: [3.0, 0, 2.22],
  seat4: [-2.25, 0, -1.42],
  menu: [0, 0, -4.0],
  bins: [4.9, 0, -1.25],
  window: [-3.9, 0, -4.2],
  door: [-5.4, 0, 4.3],
};
