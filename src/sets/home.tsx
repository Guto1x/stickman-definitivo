// Open-plan home: IFOLOGY "Shapeshift" kitchen (purple cabinets, white tiled backsplash, fridge,
// oven, hood) on the left (x<0.4, checker floor) and a living area on the right (wood floor, rug,
// couch facing a wall TV). Room x∈[-6,6], back wall z=-5, ceiling 3.0, open toward +z
// (a one-sided fourth wall at z=6 shows only in reverse shots from inside).
import React from 'react';
import type { SetProps } from './index';
import type { Vec3 } from '../types';
import { Ball, Box, Chair, Cone, Cyl, Door, Table, WallClock, mix, rng } from './kit';
import { Batch, Batched, CeilingPanel, checkerFloor, FloorLamp, FruitBowl, isNight, LeafPlant, Picture, Pinboard, plankFloor, RoomWindow, Shell, Sofa } from './roomkit';

export const HOME = { x0: -6, x1: 6, z0: -5, z1: 6, h: 3.0 };

const PURPLE = '#3f2f6e';
const PURPLE_DOOR = '#5a4590';
const COUNTER = '#efe7d8';
const STEEL = '#c9ccd3';
const GROUT = '#cfc8bc';
const TILE = '#f7f4ee';

function buildKitchen(b: Batch) {
  const Z = HOME.z0;
  // ---- fridge (back-left corner) + cupboard above
  b.span([-5.96, 0.02, Z], [-5.14, 1.95, Z + 0.7], '#f1efea');
  b.span([-5.95, 1.31, Z + 0.7], [-5.15, 1.335, Z + 0.705], '#b9b7b0');
  b.span([-5.25, 1.42, Z + 0.7], [-5.21, 1.75, Z + 0.74], STEEL);
  b.span([-5.25, 0.85, Z + 0.7], [-5.21, 1.22, Z + 0.74], STEEL);
  ['#e2483d', '#3d8fd6', '#f2b632', '#4e9a6b'].forEach((c, i) => b.box([-5.75 + (i % 2) * 0.22, 1.05 + Math.floor(i / 2) * 0.32 + (i % 2) * 0.06, Z + 0.705], [0.07, 0.07, 0.012], c));
  b.box([-5.62, 1.6, Z + 0.703], [0.22, 0.28, 0.006], '#f8f4ea', [0, 0, 0.08]);
  b.box([-5.62, 1.62, Z + 0.707], [0.12, 0.1, 0.004], '#f2a7b5', [0, 0, 0.08]);
  b.span([-5.96, 2.06, Z], [-5.14, 2.62, Z + 0.4], PURPLE);
  b.span([-5.93, 2.08, Z + 0.4], [-5.17, 2.6, Z + 0.415], PURPLE_DOOR);

  // ---- lower run x∈[-5.1,-0.8]
  const X0 = -5.1, X1 = -0.8, FZ = Z + 0.6; // carcass front
  b.span([X0, 0.1, Z], [X1, 0.88, FZ], PURPLE);
  b.span([X0, 0, Z], [X1, 0.1, FZ - 0.05], '#231b3a');
  b.span([X0 - 0.02, 0.88, Z], [X1 + 0.02, 0.93, FZ + 0.06], COUNTER);
  const door = (xa: number, xb: number, ya = 0.12, yb = 0.86, handleTop = true) => {
    b.span([xa + 0.012, ya, FZ], [xb - 0.012, yb, FZ + 0.02], PURPLE_DOOR);
    b.box([(xa + xb) / 2, handleTop ? yb - 0.07 : (ya + yb) / 2, FZ + 0.035], [Math.min(0.2, (xb - xa) * 0.4), 0.022, 0.025], '#e4e4ea');
  };
  const drawers = (xa: number, xb: number) => {
    door(xa, xb, 0.12, 0.36, false);
    door(xa, xb, 0.38, 0.62, false);
    door(xa, xb, 0.64, 0.86, false);
  };
  drawers(-5.1, -4.45);
  door(-4.45, -3.7);
  door(-3.7, -2.95);
  door(-2.95, -2.4);
  // oven
  b.span([-2.38, 0.12, FZ], [-1.62, 0.72, FZ + 0.02], '#1d1e25');
  b.span([-2.28, 0.2, FZ + 0.02], [-1.72, 0.56, FZ + 0.024], '#3b3f4f');
  b.box([-2.0, 0.64, FZ + 0.05], [0.56, 0.025, 0.03], STEEL);
  b.span([-2.38, 0.74, FZ], [-1.62, 0.86, FZ + 0.02], '#dcdce2');
  [-2.25, -2.12, -1.88, -1.75].forEach(x => b.add('cyl', '#2a2b33', [x, 0.8, FZ + 0.03], [0.022, 0.03, 0.022], [Math.PI / 2, 0, 0]));
  drawers(-1.6, -0.8);
  // hob
  b.span([-2.35, 0.93, Z + 0.06], [-1.65, 0.945, Z + 0.56], '#1f2027', { cast: false });
  [[-2.17, Z + 0.2], [-1.83, Z + 0.2], [-2.17, Z + 0.42], [-1.83, Z + 0.42]].forEach(([x, z]) => b.add('cyl', '#43454f', [x, 0.948, z], [0.075, 0.006, 0.075], 0, { cast: false }));
  // sink + tap
  b.span([-4.15, 0.93, Z + 0.06], [-3.25, 0.948, Z + 0.56], STEEL, { cast: false });
  b.span([-4.05, 0.948, Z + 0.12], [-3.35, 0.952, Z + 0.5], '#8f94a0', { cast: false });
  b.add('cyl', STEEL, [-3.7, 1.07, Z + 0.07], [0.02, 0.26, 0.02]);
  b.stick([-3.7, 1.2, Z + 0.07], [-3.7, 1.17, Z + 0.26], 0.017, STEEL);
  // backsplash: white square tiles over grout
  const BT = 0.93, rows = 4, cols = 28, pitch = (X1 - X0) / cols, ph = 0.15;
  b.span([X0, BT, Z], [X1, BT + rows * ph, Z + 0.006], GROUT, { cast: false });
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) b.box([X0 + (i + 0.5) * pitch, BT + (j + 0.5) * ph, Z + 0.011], [pitch - 0.013, ph - 0.013, 0.01], TILE, 0, { cast: false });
  // upper cabinets
  const upper = (xa: number, xb: number, hinge: 1 | -1) => {
    b.span([xa, 1.68, Z], [xb, 2.48, Z + 0.34], PURPLE);
    b.span([xa + 0.012, 1.69, Z + 0.34], [xb - 0.012, 2.47, Z + 0.355], PURPLE_DOOR);
    b.box([hinge > 0 ? xb - 0.07 : xa + 0.07, 1.8, Z + 0.37], [0.022, 0.15, 0.025], '#e4e4ea');
  };
  upper(-5.1, -4.42, 1);
  upper(-3.0, -2.44, -1);
  upper(-1.56, -1.18, 1);
  upper(-1.18, -0.8, -1);
  // range hood
  b.span([-2.42, 1.86, Z], [-1.58, 1.97, Z + 0.52], STEEL);
  b.span([-2.36, 1.97, Z], [-1.64, 2.12, Z + 0.38], mix(STEEL, '#ffffff', 0.2));
  b.span([-2.16, 2.12, Z], [-1.84, HOME.h, Z + 0.26], STEEL);
  // microwave
  b.span([-1.56, 0.93, Z + 0.04], [-0.98, 1.27, Z + 0.44], '#ebe8e2');
  b.span([-1.52, 0.97, Z + 0.44], [-1.18, 1.23, Z + 0.445], '#2b2d36');
  b.span([-1.14, 0.98, Z + 0.44], [-1.02, 1.22, Z + 0.445], '#c9c6c0');
  // kettle, canisters, cutting board, bottles
  b.add('cyl', '#d9433a', [-2.75, 1.03, Z + 0.32], [0.085, 0.2, 0.085]);
  b.add('cyl', '#2a2b33', [-2.75, 1.14, Z + 0.32], [0.05, 0.03, 0.05]);
  b.stick([-2.66, 1.1, Z + 0.32], [-2.64, 0.98, Z + 0.32], 0.015, '#2a2b33');
  ['#f2b632', '#f4efe2', '#4e9a6b'].forEach((c, i) => {
    b.add('cyl', c, [-4.95 + i * 0.16, 1.02 + i * 0.01, Z + 0.18], [0.06, 0.18 + i * 0.02, 0.06]);
    b.add('cyl', '#8b6146', [-4.95 + i * 0.16, 1.12 + i * 0.02, Z + 0.18], [0.062, 0.025, 0.062]);
  });
  b.span([-3.15, 0.93, Z + 0.1], [-2.98, 1.23, Z + 0.13], '#c9945e', { cast: true });
  b.box([-0.95, 0.95, Z + 0.45], [0.26, 0.02, 0.18], '#c9945e', [0, 0.3, 0]);
}

function buildFloor(b: Batch) {
  const { x0, x1, z0, z1 } = HOME;
  checkerFloor(b, x0, 0.4, z0, z1, 0.5, '#e6e3de', '#c6c4c0');
  plankFloor(b, 0.4, x1, z0, z1, 0.24, ['#c99a6d', '#bf8f62', '#d2a477'], 5);
  b.span([0.37, 0, z0], [0.43, 0.008, z1], '#8a6446', { cast: false });
}

function buildLiving(b: Batch) {
  // rug (three thin layers so the stripe reads), under the coffee table
  b.span([1.45, 0, -2.05], [5.15, 0.008, 1.25], '#7d2a30', { cast: false });
  b.span([1.6, 0, -1.9], [5.0, 0.012, 1.1], '#efdcb6', { cast: false });
  b.span([1.7, 0, -1.8], [4.9, 0.016, 1.0], '#b6434a', { cast: false });
  // TV console against the right wall (front faces -x)
  b.at([HOME.x1, 0, -0.4], -Math.PI / 2, () => {
    b.box([0, 0.3, 0.24], [2.2, 0.4, 0.46], '#c89a6a');
    b.box([0, 0.08, 0.24], [2.1, 0.06, 0.4], '#8a6446');
    [-0.72, 0, 0.72].forEach(x => {
      b.box([x, 0.3, 0.475], [0.68, 0.32, 0.012], '#d9ae7f', 0, { cast: false });
      b.box([x, 0.4, 0.49], [0.16, 0.022, 0.02], '#6b4a35', 0, { cast: false });
    });
    // TV on the wall
    b.box([0, 1.2, 0.06], [1.6, 0.92, 0.06], '#16171c');
    b.add('plane', '#262c3e', [0, 1.2, 0.092], [1.52, 0.84, 1], 0, { cast: false });
    b.add('plane', '#323a52', [0.3, 1.32, 0.094], [0.12, 0.62, 1], [0, 0, -0.6], { cast: false });
    b.add('plane', '#323a52', [0.46, 1.3, 0.094], [0.05, 0.62, 1], [0, 0, -0.6], { cast: false });
    // speaker + small plant on the console
    b.box([-0.95, 0.68, 0.24], [0.16, 0.36, 0.16], '#2a2b33');
    b.add('cyl', '#3a3b44', [-0.95, 0.72, 0.325], [0.045, 0.01, 0.045], [Math.PI / 2, 0, 0]);
    b.add('cyl', '#e9e2d4', [0.85, 0.58, 0.25], [0.07, 0.16, 0.07]);
    b.add('ico', '#4e9a45', [0.85, 0.72, 0.25], [0.13, 0.12, 0.13]);
  });
  // coffee table items
  b.box([3.05, 0.47, -0.65], [0.3, 0.025, 0.22], '#3d6fb6', [0, 0.2, 0]);
  b.box([3.05, 0.495, -0.62], [0.28, 0.02, 0.2], '#f2b632', [0, -0.1, 0]);
  b.add('cyl', '#f4efe2', [3.1, 0.5, -0.05], [0.045, 0.1, 0.045]);
  b.box([2.95, 0.465, 0.2], [0.06, 0.02, 0.17], '#2a2b33', [0, 0.4, 0]);
  // wall shelf with books + tiny plant above the pin board
  const rand = rng(21);
  b.box([0.75, 2.12, HOME.z0 + 0.12], [1.0, 0.035, 0.24], '#8b6146');
  let x = 0.3;
  const bc = ['#c8402f', '#3d6fb6', '#f2b632', '#4e9a6b', '#e7e1d3', '#7a4fa0'];
  while (x < 0.85) {
    const w = 0.05 + rand() * 0.04, h = 0.18 + rand() * 0.08;
    b.box([x + w / 2, 2.14 + h / 2, HOME.z0 + 0.12], [w, h, 0.18], bc[Math.floor(rand() * bc.length)]);
    x += w + 0.008;
  }
  b.add('cyl', '#c46b47', [1.08, 2.2, HOME.z0 + 0.12], [0.07, 0.13, 0.07]);
  b.add('ico', '#5aa54a', [1.08, 2.33, HOME.z0 + 0.12], [0.12, 0.11, 0.12]);
}

export const Home: React.FC<SetProps> = ({ t, time }) => {
  const night = isNight(time);
  const { x0, x1, z0, z1, h } = HOME;
  return (
    <group>
      <Batched id="home-floor" build={buildFloor} />
      <Shell x0={x0} x1={x1} z0={z0} z1={z1} h={h} wall="#ebc9aa" base="#f6f1e8" ceiling="#f3ece2" ceilingEmissive={night ? '#2a2622' : '#8a8278'} fourth />
      <Batched id="home-kitchen" build={buildKitchen} />
      <Batched id="home-living" build={buildLiving} />

      {/* kitchen window over the sink + sill plant */}
      <RoomWindow p={[-3.7, 2.07, z0]} w={1.2} h={0.92} cols={2} cross={false} night={night} seed={1} />
      <LeafPlant p={[-3.35, 1.53, z0 + 0.1]} s={0.42} pot="#e2483d" seed={3} />

      {/* dining */}
      <Table p={[-3.0, 0, -1.3]} w={1.7} d={0.95} h={0.76} c="#d8b27c" />
      <Chair p={[-3.45, 0, -2.02]} c="#c0563f" />
      <Chair p={[-2.55, 0, -2.02]} c="#c0563f" />
      <Chair p={[-4.2, 0, -1.3]} r={Math.PI / 2} c="#c0563f" />
      <Chair p={[-1.8, 0, -1.3]} r={-Math.PI / 2} c="#c0563f" />
      <FruitBowl p={[-3.0, 0.79, -1.3]} />
      <Box p={[-3.45, 0.795, -1.55]} s={[0.36, 0.01, 0.26]} c="#f4efe2" shadow={false} />
      <Box p={[-2.55, 0.795, -1.55]} s={[0.36, 0.01, 0.26]} c="#f4efe2" shadow={false} />
      <Cyl p={[-2.45, 0.85, -1.5]} s={[0.04, 0.1, 0.04]} c="#f6a04d" />
      {/* pendant lamp */}
      <Cyl p={[-3.0, 2.62, -1.3]} s={[0.008, 0.76, 0.008]} c="#2a2b33" shadow={false} />
      <Cone p={[-3.0, 2.12, -1.3]} s={[0.27, 0.24, 0.27]} c="#2f6f73" shadow={false} />
      <Ball p={[-3.0, 2.0, -1.3]} s={0.06} c="#fff2c4" glow />

      {/* living */}
      <Sofa p={[1.62, 0, -0.4]} r={Math.PI / 2} w={2.3} c="#3e5c8a" />
      <Table p={[3.1, 0, -0.4]} w={0.75} d={1.25} h={0.43} c="#efe6d6" />
      <FloorLamp p={[1.3, 0, -2.05]} on={night} />
      <RoomWindow p={[3.3, 1.68, z0]} w={2.2} h={1.4} cols={3} night={night} seed={2} curtain="#e2b04a" />
      <LeafPlant p={[5.35, 0, z0 + 0.55]} s={1.5} pot="#e9e2d4" seed={5} />
      <LeafPlant p={[-5.45, 0, 1.1]} s={1.3} pot="#c46b47" seed={8} leaf="#5aa54a" />
      <Door p={[x1, 0, -3.6]} r={-Math.PI / 2} c="#3f7a52" frame="#f6f1e8" />
      <Picture p={[x1 - 0.005, 1.72, -2.3]} r={-Math.PI / 2} w={0.55} h={0.72} art="abstract" seed={1} />
      <Picture p={[x1 - 0.005, 1.65, 1.45]} r={-Math.PI / 2} w={0.82} h={0.6} art="landscape" frame="#f4efe2" />
      <Picture p={[x0 + 0.005, 1.72, -1.85]} r={Math.PI / 2} w={0.55} h={0.72} art="abstract" seed={4} />
      <Picture p={[x0 + 0.005, 1.78, -0.85]} r={Math.PI / 2} w={0.5} h={0.5} art="sun" frame="#f4efe2" />
      <Pinboard p={[0.75, 1.55, z0]} />
      <WallClock p={[-0.2, 2.3, z0 + 0.06]} s={0.85} t={t} />

      {/* ceiling lights */}
      <CeilingPanel p={[3.2, h, -0.4]} w={0.7} round />
      <CeilingPanel p={[-3.4, h, -3.9]} w={0.55} round />
    </group>
  );
};

export const HOME_MARKS: Record<string, Vec3> = {
  center: [0, 0, 1.0],
  kitchen: [-3.0, 0, -3.5],
  fridge: [-5.45, 0, -3.65],
  stove: [-2.0, 0, -3.75],
  sink: [-3.7, 0, -3.75],
  table: [-3.0, 0, -0.45],
  seat: [-2.55, 0, -2.0],
  couch: [1.75, 0, -0.4],
  tv: [4.4, 0, 1.4],
  window: [3.3, 0, -4.2],
  door: [5.35, 0, -3.6],
};
