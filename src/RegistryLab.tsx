// Look-dev compositions driven by the registries, so new sets and cards can be checked with
// `npx remotion still` without touching Root.tsx:
//   npx remotion still SetLab out/lab/x.png --props='{"set":"classroom","cam":{"pos":[0,1.6,6],"look":[0,1,0]}}'
//   npx remotion still CardLab out/lab/y.png --frame=40 --props='{"card":"stat"}'
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { CAST } from './cast';
import { evalActor } from './engine/actor';
import { setRim, Stage } from './engine/Stage';
import { Stickman } from './engine/Stickman';
import { Lighting, PALETTES } from './sets/look';
import { SETS } from './sets';
import { CARDS } from './cards';
import { Grade } from './overlays/Grade';
import type { Vec3 } from './types';

export const SetLab: React.FC<{ set: string; time?: string; cam?: { pos: Vec3; look: Vec3; fov?: number }; hero?: string; heroPos?: Vec3; heroRot?: number }> = ({
  set, time, cam, hero, heroPos, heroRot = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const def = SETS[set];
  if (!def) return <AbsoluteFill style={{ background: '#400', color: '#fff', fontSize: 60 }}>unknown set {set}</AbsoluteFill>;
  const pal = PALETTES[time || def.palette];
  const c = cam || { pos: [0, 1.6, 7] as Vec3, look: [0, 1.1, 0] as Vec3, fov: 34 };
  const camState = { pos: new THREE.Vector3(...c.pos), look: new THREE.Vector3(...c.look), fov: c.fov ?? 34, roll: 0 };
  setRim();
  const S = def.component;
  const pos: Vec3 | undefined = hero ? (def.marks[hero] || heroPos) : undefined;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage cam={camState}>
        <Lighting p={pal} center={def.shadowCenter || c.look} shadowBox={def.shadowBox ?? 14} sky={!def.interior} />
        <S t={t} center={c.look} variant={0} time={time || def.palette} />
        {pos && <Stickman s={evalActor({ id: 'hero', pos, rot: heroRot, pose: 'relaxed', face: 'smile' }, CAST.hero, t, 1)} />}
      </Stage>
      <Grade />
    </AbsoluteFill>
  );
};

export const CardLab: React.FC<{ card: string; spec?: Record<string, unknown>; dur?: number }> = ({ card, spec, dur = 4 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const def = CARDS[card];
  if (!def) return <AbsoluteFill style={{ background: '#400', color: '#fff', fontSize: 60 }}>unknown card {card}</AbsoluteFill>;
  const C = def.component;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <C t={frame / fps} dur={dur} spec={spec || def.example} W={width} H={height} />
      <Grade />
    </AbsoluteFill>
  );
};
