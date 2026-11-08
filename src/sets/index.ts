// Set registry. Every set is a React component drawn around the origin plus named "marks"
// (staging spots) so episode specs can say `"pos": "desk"` instead of raw coordinates.
// To add a set: build it in src/sets/<name>.tsx from kit.tsx pieces, then register it here.
import React from 'react';
import type { Vec3 } from '../types';
import { Suburb } from './suburb';
import { INDOOR_SETS } from './indoor';
import { OUTDOOR_SETS } from './outdoor';

export type SetProps = {
  t: number; // seconds since shot start (for clocks, flickers, ambient motion)
  center: Vec3; // where the camera is looking (tiling sets build around this)
  variant: number; // deterministic dressing variation
  time: string; // palette key in use (sets may switch window glow, lamps, etc.)
};

export type SetDef = {
  component: React.FC<SetProps>;
  palette: string; // default PALETTES key
  marks: Record<string, Vec3>; // named standing spots, y = floor height there
  shadowCenter?: Vec3; // centre of the sun's shadow frustum (defaults to camera look point)
  shadowBox?: number; // half-size of the shadow frustum
  interior?: boolean; // true = no sky dome needed
  room?: { min: Vec3; max: Vec3 }; // walls/floor/ceiling the camera must stay inside (open side = large max); the engine pulls a camera that ends up outside back in along its sight line
  description: string; // one line for Claude when picking sets
};

const SuburbSet: React.FC<SetProps> = ({ center }) => React.createElement(Suburb, { centerX: center[0], behind: 80, ahead: 120 });

export const SETS: Record<string, SetDef> = {
  suburb: {
    component: SuburbSet,
    palette: 'afternoon',
    marks: {
      sidewalk: [0, 0.1, -4.6], // home-side sidewalk, facing the road (+z)
      lawn: [6.5, 0.08, -9.5],
      door: [8.45, 0.36, -12.9], // front step of the house at x≈6.5
      road: [0, 0, 0],
      farSidewalk: [0, 0.1, 4.6],
      mailbox: [10.2, 0.1, -5.2],
    },
    shadowBox: 16,
    description: 'IFOLOGY-style pastel suburban street, tiles forever along x. Sidewalk z=-4.6 (y 0.1), road |z|<3.5, houses at z=-17.',
  },
  ...INDOOR_SETS,
  ...OUTDOOR_SETS,
};
