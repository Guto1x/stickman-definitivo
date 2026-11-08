// Teen bedroom: bed against the back wall (left), window with pink curtains, gaming desk with
// glowing monitor (right), bookshelf, wardrobe, posters, round rug. Room x∈[-4.5,4.5],
// back wall z=-4, ceiling 2.8, open toward +z (one-sided fourth wall at z=5).
import React from 'react';
import type { SetProps } from './index';
import type { Vec3 } from '../types';
import { At, Box, Cone, Cyl, DeskLamp, Door, G, Shelf, WallClock, mix } from './kit';
import { envMaterial } from '../engine/materials';
import { Batch, Batched, CeilingPanel, isNight, LeafPlant, Picture, plankFloor, RoomWindow, Shell } from './roomkit';

export const BEDROOM = { x0: -4.5, x1: 4.5, z0: -4, z1: 5, h: 2.8 };

const DUVET = '#e8806a';

function buildFloor(b: Batch) {
  const { x0, x1, z0, z1 } = BEDROOM;
  plankFloor(b, x0, x1, z0, z1, 0.22, ['#d6b48b', '#cdaa7f', '#dcbd97'], 9);
  // round rug: two layers
  b.add('cyl', '#f2c45a', [0.5, 0.005, -0.4], [1.35, 0.01, 1.35], 0, { cast: false });
  b.add('cyl', '#f7dc8f', [0.5, 0.007, -0.4], [1.0, 0.014, 1.0], 0, { cast: false });
  b.add('cyl', '#f2c45a', [0.5, 0.009, -0.4], [0.55, 0.018, 0.55], 0, { cast: false });
}

function buildFurniture(b: Batch) {
  const Z = BEDROOM.z0;
  // ---- bed (headboard against the back wall), faces +z
  b.at([-2.55, 0, Z + 1.12], 0, () => {
    const wood = '#8a5e43';
    b.box([0, 0.2, 0], [1.68, 0.28, 2.14], wood);
    b.box([0, 0.42, 0.02], [1.56, 0.2, 2.0], '#f4f1ea');
    b.box([0, 0.44, 0.32], [1.64, 0.3, 1.5], DUVET);
    b.box([0, 0.53, 0.32], [1.6, 0.12, 1.48], DUVET);
    b.box([0, 0.535, -0.42], [1.645, 0.13, 0.16], mix(DUVET, '#ffffff', 0.55));
    b.box([0, 0.545, 0.86], [1.65, 0.13, 0.3], '#f2b632');
    b.box([-0.38, 0.62, -0.72], [0.6, 0.14, 0.38], '#fbf8f2', [0.25, 0.08, 0]);
    b.box([0.38, 0.62, -0.72], [0.6, 0.14, 0.38], '#fbf8f2', [0.25, -0.06, 0]);
    b.box([0, 0.63, -1.06], [1.74, 1.06, 0.08], wood);
    b.box([0, 1.18, -1.06], [1.82, 0.07, 0.12], mix(wood, '#000000', 0.2));
    b.box([0, 0.3, 1.08], [1.68, 0.5, 0.06], wood);
    // teddy bear
    b.at([0.45, 0.6, -0.25], 0.4, () => {
      b.add('sphere', '#b07a4f', [0, 0.1, 0], [0.12, 0.13, 0.1]);
      b.add('sphere', '#b07a4f', [0, 0.29, 0], 0.085);
      b.add('sphere', '#b07a4f', [-0.07, 0.36, 0], 0.035);
      b.add('sphere', '#b07a4f', [0.07, 0.36, 0], 0.035);
      b.add('sphere', '#e6c9a8', [0, 0.27, 0.07], [0.035, 0.03, 0.025]);
    });
  });
  // nightstand
  b.at([-1.32, 0, Z + 0.28], 0, () => {
    b.box([0, 0.3, 0], [0.5, 0.56, 0.44], '#a87652');
    b.box([0, 0.42, 0.225], [0.44, 0.2, 0.012], '#c08c63', 0, { cast: false });
    b.add('sphere', '#e4c27a', [0, 0.42, 0.24], 0.022);
    b.add('cyl', '#3d6fb6', [0.12, 0.66, 0.05], [0.04, 0.12, 0.04]);
  });

  // ---- desk (right of the window)
  b.at([2.75, 0, Z + 0.37], 0, () => {
    const top = '#f3efe7', side = '#ddd6c9';
    b.box([0, 0.735, 0], [1.6, 0.05, 0.7], top);
    b.box([-0.56, 0.355, 0], [0.44, 0.71, 0.66], side);
    [0.15, 0.35, 0.55].forEach(y => {
      b.box([-0.56, y, 0.335], [0.4, 0.17, 0.012], mix(side, '#ffffff', 0.4), 0, { cast: false });
      b.box([-0.56, y + 0.04, 0.345], [0.12, 0.02, 0.02], '#8a8f9a', 0, { cast: false });
    });
    b.box([0.76, 0.355, 0], [0.05, 0.71, 0.66], side);
    // monitor
    b.box([0, 1.13, -0.17], [0.86, 0.5, 0.04], '#17181e');
    b.box([0, 0.86, -0.2], [0.06, 0.2, 0.06], '#17181e');
    b.box([0, 0.765, -0.2], [0.3, 0.02, 0.2], '#17181e');
    // screen UI (unlit)
    b.add('plane', '#5b8fe0', [0, 1.13, -0.148], [0.8, 0.44, 1], 0, { kind: 'glow' });
    b.add('plane', '#2c4f8f', [0, 1.33, -0.147], [0.8, 0.04, 1], 0, { kind: 'glow' });
    b.add('plane', '#f4f6ff', [-0.17, 1.12, -0.146], [0.36, 0.26, 1], 0, { kind: 'glow' });
    b.add('plane', '#ffd36b', [0.2, 1.17, -0.146], [0.26, 0.14, 1], 0, { kind: 'glow' });
    b.add('plane', '#8ee0b0', [0.2, 1.0, -0.146], [0.26, 0.1, 1], 0, { kind: 'glow' });
    // keyboard, mouse, mug, books
    b.box([-0.02, 0.77, 0.08], [0.48, 0.022, 0.16], '#2a2b33');
    b.box([0.34, 0.77, 0.1], [0.06, 0.025, 0.1], '#2a2b33');
    b.add('cyl', '#e2483d', [-0.5, 0.81, 0.12], [0.045, 0.1, 0.045]);
    b.box([-0.62, 0.79, -0.18], [0.24, 0.05, 0.32], '#3d6fb6', 0.1);
    b.box([-0.6, 0.835, -0.18], [0.22, 0.04, 0.3], '#f2b632', -0.15);
    // PC tower with a glow strip
    b.box([0.45, 0.25, -0.02], [0.22, 0.46, 0.46], '#22232b');
    b.add('plane', '#b07cff', [0.45, 0.3, 0.215], [0.03, 0.3, 1], 0, { kind: 'glow' });
  });
  // gaming chair, seat faces -z (towards the desk)
  b.at([2.75, 0, Z + 1.15], Math.PI, () => {
    const red = '#c8402f', blk = '#24252d';
    b.box([0, 0.48, 0], [0.52, 0.09, 0.5], blk);
    b.box([0, 0.5, 0], [0.4, 0.09, 0.44], red);
    b.box([0, 0.83, -0.25], [0.48, 0.56, 0.09], red);
    b.box([-0.2, 0.83, -0.25], [0.08, 0.58, 0.1], blk);
    b.box([0.2, 0.83, -0.25], [0.08, 0.58, 0.1], blk);
    b.box([0, 1.12, -0.25], [0.48, 0.06, 0.1], blk);
    for (const sd of [-1, 1]) {
      b.box([sd * 0.27, 0.66, 0.0], [0.05, 0.04, 0.36], blk);
      b.box([sd * 0.27, 0.58, 0.0], [0.035, 0.16, 0.035], blk);
    }
    b.add('cyl', '#8a8f9a', [0, 0.27, 0], [0.03, 0.4, 0.03]);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.box([Math.sin(a) * 0.15, 0.07, Math.cos(a) * 0.15], [0.05, 0.04, 0.3], blk, a);
      b.add('sphere', blk, [Math.sin(a) * 0.29, 0.03, Math.cos(a) * 0.29], 0.03);
    }
  });

  // ---- wardrobe on the left wall (doors face +x)
  b.at([BEDROOM.x0, 0, 1.0], Math.PI / 2, () => {
    const wood = '#d9b48a', dr = '#e6c49b';
    b.box([0, 1.08, 0.31], [1.3, 2.12, 0.62], wood);
    b.box([0, 2.16, 0.32], [1.36, 0.06, 0.66], mix(wood, '#000000', 0.15));
    b.box([0, 0.06, 0.31], [1.26, 0.12, 0.58], mix(wood, '#000000', 0.3));
    for (const sd of [-1, 1]) {
      b.box([sd * 0.315, 1.1, 0.625], [0.6, 1.9, 0.012], dr, 0, { cast: false });
      b.box([sd * 0.06, 1.1, 0.645], [0.025, 0.26, 0.03], '#7a5a3a', 0, { cast: false });
    }
  });
  // beanbag
  b.add('sphere', '#3fa7a0', [3.55, 0.27, 0.75], [0.48, 0.3, 0.46]);
  b.add('sphere', mix('#3fa7a0', '#ffffff', 0.1), [3.42, 0.42, 0.88], [0.33, 0.2, 0.3]);
  // laundry basket
  b.add('cyl', '#eef0f2', [-3.9, 0.25, 2.55], [0.24, 0.5, 0.24]);
  b.add('cyl', '#5b8fe0', [-3.9, 0.5, 2.55], [0.2, 0.06, 0.2]);
}

/** Space poster: navy, ringed planet, stars. Local +z out of the wall. */
const PlanetPoster: React.FC<{ p: Vec3; r?: number }> = ({ p, r = 0 }) => (
  <At p={p} r={r}>
    <Box p={[0, 0, 0.01]} s={[0.56, 0.78, 0.02]} c="#1d2647" />
    <mesh geometry={G.circle} material={envMaterial('#f08a5d')} position={[0, 0.06, 0.022]} scale={0.13} receiveShadow />
    <mesh geometry={G.torus} material={envMaterial('#f6d38a')} position={[0, 0.06, 0.03]} rotation={[1.25, 0, 0.35]} scale={[0.22, 0.22, 0.22]} />
    {[[-0.18, 0.28], [0.16, 0.3], [0.2, -0.2], [-0.15, -0.25], [0.05, -0.32]].map(([x, y], i) => (
      <mesh key={i} geometry={G.circle} material={envMaterial('#fff4c4')} position={[x, y, 0.022]} scale={0.012 + (i % 2) * 0.008} />
    ))}
  </At>
);

export const Bedroom: React.FC<SetProps> = ({ t, time }) => {
  const night = isNight(time);
  const { x0, x1, z0, z1, h } = BEDROOM;
  return (
    <group>
      <Batched id="bedroom-floor" build={buildFloor} />
      <Shell x0={x0} x1={x1} z0={z0} z1={z1} h={h} wall="#cbdcf5" lower="#97b2e2" railY={1.0} rail="#f6f3ec" base="#f6f3ec" ceiling="#f2f3f6" ceilingEmissive={night ? '#2a2c34' : '#9a9ca2'} fourth />
      <Batched id="bedroom-furniture" build={buildFurniture} />

      <RoomWindow p={[0.45, 1.72, z0]} w={1.3} h={1.25} cols={2} night={night} seed={3} curtain="#e891a6" />
      <LeafPlant p={[-0.02, 1.032, z0 + 0.1]} s={0.4} pot="#f2b632" seed={2} />
      {/* nightstand lamp */}
      <Cyl p={[-1.45, 0.66, z0 + 0.24]} s={[0.07, 0.18, 0.07]} c="#e9e2d4" />
      <Cone p={[-1.45, 0.86, z0 + 0.24]} s={[0.15, 0.2, 0.15]} c={night ? '#ffe7b0' : '#f7efe0'} glow={night} />
      <DeskLamp p={[3.3, 0.76, z0 + 0.25]} c="#2b2d36" />

      <Picture p={[-2.55, 1.78, z0]} w={0.95} h={0.58} art="landscape" frame="#f6f3ec" />
      <PlanetPoster p={[2.25, 1.95, z0]} />
      <Picture p={[3.05, 2.0, z0]} w={0.5} h={0.66} art="abstract" seed={3} frame="#f6f3ec" />
      <Shelf p={[x1 - 0.16, 0, -1.4]} r={-Math.PI / 2} c="#a87652" seed={7} />
      <Picture p={[x1 - 0.005, 1.55, 0.65]} r={-Math.PI / 2} w={0.6} h={0.6} art="dots" frame="#2a2b33" />
      <WallClock p={[x0 + 0.05, 2.25, -1.6]} r={Math.PI / 2} s={0.75} t={t} />
      <Picture p={[x0 + 0.005, 1.6, -2.7]} r={Math.PI / 2} w={0.45} h={0.6} art="sun" frame="#f6f3ec" />
      <Door p={[x1, 0, 2.6]} r={-Math.PI / 2} c="#f1ece2" frame="#ffffff" />
      <LeafPlant p={[4.0, 0, z0 + 0.4]} s={1.15} pot="#e9e2d4" seed={4} />
      <CeilingPanel p={[0, h, -0.5]} w={0.7} round />
    </group>
  );
};

export const BEDROOM_MARKS: Record<string, Vec3> = {
  center: [0, 0, 1.2],
  bed: [-1.3, 0, -2.3],
  desk: [2.75, 0, -2.85],
  window: [0.45, 0, -3.3],
  wardrobe: [-3.55, 0, 1.0],
  door: [3.75, 0, 2.6],
  shelf: [3.6, 0, -1.4],
  rug: [0.5, 0, -0.4],
};
