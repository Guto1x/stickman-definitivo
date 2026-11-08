// Look-development compositions: character turnaround / pose and face checks on the street set.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CAST } from './cast';
import { evalActor } from './engine/actor';
import { camAt } from './engine/cam';
import { setRim, Stage } from './engine/Stage';
import { Stickman } from './engine/Stickman';
import { Lighting, PALETTES } from './sets/look';
import { Suburb } from './sets/suburb';
import { Grade } from './overlays/Grade';
import type { ActorInShot } from './types';

export const CharacterLab: React.FC<{ view?: 'close' | 'full' | 'three' | 'lineup'; pose?: string; face?: string; ids?: string[] }> = ({ view = 'full', pose = 'stand', face = 'smile', ids }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const lineup = ids || Object.keys(CAST).filter(k => !k.startsWith('extra'));
  const actors: ActorInShot[] =
    view === 'lineup'
      ? lineup.map((id, i) => ({ id, pos: [(i - (lineup.length - 1) / 2) * 1.05, 0.1, -4.6], rot: 0, pose: 'relaxed', face: 'smile' }))
      : view === 'three'
      ? [
          { id: 'hero', pos: [-1.4, 0.1, -4.6], rot: 30, pose, face },
          { id: 'hero', pos: [0, 0.1, -4.6], rot: 0, pose: 'confident', face: 'grin' },
          { id: 'hero', pos: [1.4, 0.1, -4.6], rot: -60, pose: 'point', face: 'determined' },
        ]
      : [{ id: 'hero', pos: [0, 0.1, -4.6], rot: 15 + t * 40, pose, face }];
  const cam =
    view === 'close'
      ? camAt([{ t: 0, pos: [0.25, 1.62, -3.35], look: [0, 1.6, -4.6], fov: 30 }], t)
      : view === 'three'
        ? camAt([{ t: 0, pos: [0, 1.25, 1.2], look: [0, 1.0, -4.6], fov: 30 }], t)
        : view === 'lineup'
          ? camAt([{ t: 0, pos: [0, 1.3, 3.2], look: [0, 1.0, -4.6], fov: 30 }], t)
        : camAt([{ t: 0, pos: [0.6, 1.2, -0.9], look: [0, 1.0, -4.6], fov: 30 }], t);
  setRim();
  const states = actors.map((a, i) => evalActor(a, CAST[a.id], t, i * 7.3));
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Stage cam={cam}>
        <Lighting p={PALETTES.afternoon} center={[0, 0, -4.6]} shadowBox={14} />
        <Suburb centerX={0} behind={60} ahead={80} />
        {states.map((s, i) => <Stickman key={i} s={s} />)}
      </Stage>
      <Grade />
    </AbsoluteFill>
  );
};
