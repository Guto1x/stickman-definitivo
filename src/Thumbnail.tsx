// YouTube thumbnail (1280×720) in IFOLOGY's packaging style: a dramatic close-up of the hero
// with exaggerated smug features, night palette with a strong rim, and a 2-word caption
// (white line + yellow line, heavy sans). Render:
//   npx remotion still Thumbnail final/<slug>_thumb.png --props='{"top":"TOO","bottom":"SLOW."}'
import React from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Montserrat';
import { CAST } from './cast';
import { evalActor } from './engine/actor';
import { Glow } from './engine/fx';
import { setRim, Stage } from './engine/Stage';
import { Stickman } from './engine/Stickman';
import { SpeedLines } from './overlays/Energy';
import { SETS } from './sets';
import { Lighting, PALETTES } from './sets/look';
import type { Face, Pose, Vec3 } from './types';

const font = loadFont('normal', { weights: ['900'], subsets: ['latin'] }).fontFamily;

export type ThumbProps = {
  top?: string;
  bottom?: string;
  corner?: string; // small badge text top-right, e.g. "10×"
  textSide?: 'left' | 'right';
  set?: string;
  time?: string;
  at?: string; // mark name for the hero
  rot?: number;
  pose?: string | Pose;
  face?: string | Face;
  cast?: string;
  cam?: { pos: Vec3; look: Vec3; fov?: number }; // relative to the hero's feet
  rim?: string;
  glow?: string;
  speed?: boolean;
  hold?: string;
  partner?: { cast: string; offset: Vec3; rot?: number; pose?: string | Pose; face?: string | Face; ghost?: boolean; color?: string }; // second figure (a swap afterimage etc.)
};

export const Thumbnail: React.FC<ThumbProps> = ({
  top = 'TOO', bottom = 'SLOW.', corner, textSide = 'left', set = 'suburb', time = 'night', at = 'sidewalk', rot = 22,
  pose = 'confident', face = { eyes: 1.3, lid: 0.48, lidTilt: -0.7, mouth: 0.8, width: 1.2, size: 2.5 }, cast = 'hero',
  cam = { pos: [0.75, 1.48, 1.3], look: [0.22, 1.38, 0], fov: 32 }, rim = '#a9b8ff', glow = '#8b5cff', speed = true, hold, partner,
}) => {
  const def = SETS[set] || SETS.suburb;
  const base = def.marks[at] || [0, 0, 0];
  const add = (v: Vec3): Vec3 => [base[0] + v[0], base[1] + v[1], base[2] + v[2]];
  const camState = { pos: new THREE.Vector3(...add(cam.pos)), look: new THREE.Vector3(...add(cam.look)), fov: cam.fov ?? 32, roll: 0 };
  const hero = evalActor({ id: cast, pos: base, rot, pose, face, hold: hold ? { R: hold } : undefined }, CAST[cast] || CAST.hero, 0.4, 2);
  setRim([-0.6, 0.75, 0.0], rim, undefined, 0.35);
  const S = def.component;
  const pal = PALETTES[time] || PALETTES.night;
  const textStyle = (color: string, size: number): React.CSSProperties => ({
    fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 0.92, color, letterSpacing: -2,
    WebkitTextStroke: '10px #0d0a1a', paintOrder: 'stroke fill', textShadow: '0 8px 0 #0d0a1a, 0 14px 30px rgba(0,0,0,0.6)',
  });
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage cam={camState} width={1280} height={720}>
        <Lighting p={pal} center={base} shadowBox={8} sky={!def.interior} rim={false} />
        <S t={0} center={camState.look.toArray() as Vec3} variant={0} time={time} />
        {/* key + fill so the outfit colour pops at night like the reference thumbnails */}
        <pointLight position={camState.pos.clone().add(new THREE.Vector3(0.6, 0.6, 0.2)).toArray()} color="#fff1e0" intensity={9} distance={8} decay={2} />
        <Stickman s={hero} faceGlow={glow} />
        {partner && (() => {
          const ps = evalActor({ id: partner.cast, pos: add(partner.offset), rot: partner.rot ?? rot, pose: partner.pose ?? 'relaxed', face: partner.face ?? 'neutral' }, CAST[partner.cast] || CAST.hero, 0.4, 5);
          return partner.ghost ? <Stickman s={ps} ghostOpacity={0.5} ghostColor={partner.color || '#b07cff'} ghostOrder={30} shadowBlob={false} /> : <Stickman s={ps} />;
        })()}
        {glow && <Glow p={hero.anchors.chest.clone().add(new THREE.Vector3(0, 0.3, -0.3))} size={[3.2, 3.6]} color={glow} opacity={0.45} />}
      </Stage>
      {speed && <SpeedLines t={0.37} n={26} dir={textSide === 'left' ? -1 : 1} opacity={0.55} W={1280} H={720} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 75% at 55% 45%, rgba(0,0,0,0) 55%, rgba(5,3,15,0.7) 100%)' }} />
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: textSide === 'left' ? 'flex-start' : 'flex-end', padding: '0 56px 48px', textAlign: textSide }}>
        {top && <div style={textStyle('#ffffff', 150)}>{top}</div>}
        {bottom && <div style={textStyle('#ffd23f', 172)}>{bottom}</div>}
      </AbsoluteFill>
      {corner && (
        <div style={{ position: 'absolute', top: 30, right: textSide === 'left' ? 40 : undefined, left: textSide === 'right' ? 40 : undefined, ...textStyle('#ffffff', 120) }}>{corner}</div>
      )}
    </AbsoluteFill>
  );
};
