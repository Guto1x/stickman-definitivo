// Line-art icon library for the navy explainer cards (IFOLOGY look: thin white strokes with round
// caps, gold accents). Every icon is drawn in a 100×100 box and draws itself on with
// stroke-dashoffset as `p` goes 0→1; `t` drives small idle motions (blinks, ticking hands, beats).
//
//   <svg …><Icon name="eye" x={960} y={540} size={300} p={drawProgress} t={t} /></svg>   // inside an SVG
//   <IconSvg name="brain" size={200} p={1} t={t} />                                        // as an HTML element
//
// Stick-figure poses share one parametric rig (round head with our hero's crescent, stick limbs),
// so they match each other and can be animated: see `figureStrokes(pose)` and `runPose(phase)`.
import React from 'react';
import { C, arcPath, circlePath, clamp01, f, Stroke } from './kit';

export type StrokeDef = {
  d: string;
  accent?: boolean; // gold
  color?: string; // explicit colour override
  fill?: boolean | string; // fill (fades in at the end of the stroke's draw)
  fillOpacity?: number;
  dim?: number; // opacity multiplier (far-side limbs)
  w?: number; // stroke width multiplier
  tf?: string; // SVG transform in icon units
  order?: number; // draw-order slot (strokes with the same slot draw together); default = index
};

// ---------------------------------------------------------------------------------------------
// Stick figure rig (100-unit box, feet on y = 95 when standing, facing +x)
// angles in degrees. arm: [shoulder angle from "hanging down", + swings forward; elbow bend, + folds
// the forearm forward]. leg: [hip angle from down, + forward; knee bend, + folds the shin back].
export type FigPose = {
  lean?: number; // torso tilt, + forward
  head?: number; // head tilt, + forward (nod)
  armA: [number, number]; // near arm (drawn bright)
  armB: [number, number]; // far arm (drawn dim in side views)
  legA: [number, number];
  legB: [number, number];
  hipX?: number;
  hipY?: number; // + down (sitting), - up (airborne)
  side?: boolean; // side view: far limbs are dimmed
  face?: 'side' | 'front' | 'none';
};

const RIG = { headR: 10.5, torso: 25, ua: 14.5, fa: 13.5, th: 19.5, sh: 19.5, hipY: 56 };
const rad = (d: number) => (d * Math.PI) / 180;
const dirDown = (a: number): [number, number] => [Math.sin(rad(a)), Math.cos(rad(a))];

export function figureJoints(p: FigPose) {
  const lean = p.lean ?? 0;
  const hip: [number, number] = [50 + (p.hipX ?? 0), RIG.hipY + (p.hipY ?? 0)];
  const up: [number, number] = [Math.sin(rad(lean)), -Math.cos(rad(lean))];
  const neck: [number, number] = [hip[0] + up[0] * RIG.torso, hip[1] + up[1] * RIG.torso];
  const shoulder: [number, number] = [hip[0] + up[0] * (RIG.torso - 3), hip[1] + up[1] * (RIG.torso - 3)];
  const hl = lean + (p.head ?? 0);
  const hu: [number, number] = [Math.sin(rad(hl)), -Math.cos(rad(hl))];
  const head: [number, number] = [neck[0] + hu[0] * (RIG.headR + 1.6), neck[1] + hu[1] * (RIG.headR + 1.6)];
  const limb = (root: [number, number], a0: number, a1: number, l0: number, l1: number) => {
    const d0 = dirDown(a0);
    const mid: [number, number] = [root[0] + d0[0] * l0, root[1] + d0[1] * l0];
    const d1 = dirDown(a1);
    const end: [number, number] = [mid[0] + d1[0] * l1, mid[1] + d1[1] * l1];
    return [root, mid, end] as [number, number][];
  };
  // arms hang from the torso direction (so leaning carries the arms with it)
  const armA = limb(shoulder, lean + p.armA[0], lean + p.armA[0] + p.armA[1], RIG.ua, RIG.fa);
  const armB = limb(shoulder, lean + p.armB[0], lean + p.armB[0] + p.armB[1], RIG.ua, RIG.fa);
  const legA = limb(hip, p.legA[0], p.legA[0] - p.legA[1], RIG.th, RIG.sh);
  const legB = limb(hip, p.legB[0], p.legB[0] - p.legB[1], RIG.th, RIG.sh);
  return { hip, neck, shoulder, head, hl, armA, armB, legA, legB };
}

const poly = (pts: [number, number][]) => 'M' + pts.map(q => `${f(q[0])},${f(q[1])}`).join(' L');

export function figureStrokes(p: FigPose, opts: { face?: boolean } = {}): StrokeDef[] {
  const j = figureJoints(p);
  const [hx, hy] = j.head;
  const r = RIG.headR;
  const dimB = p.side ? 0.5 : 1;
  const out: StrokeDef[] = [
    { d: circlePath(hx, hy, r, 200), order: 0 },
    // our hero's cream crescent on the upper-back of the head
    { d: arcPath(hx, hy, r - 2.6, 196 - (p.side ? 0 : 20), 262 - (p.side ? 0 : 20)), w: 0.75, color: C.creamSoft, dim: 0.9, order: 0 },
    { d: poly([j.neck, j.hip]), order: 1 },
    { d: poly(j.legB), dim: dimB, order: 2 },
    { d: poly(j.legA), order: 2 },
    { d: poly(j.armB), dim: dimB, order: 3 },
    { d: poly(j.armA), order: 3 },
  ];
  const face = p.face ?? (p.side ? 'side' : 'front');
  if (opts.face !== false && face !== 'none') {
    const tilt = rad(j.hl);
    const rot = (dx: number, dy: number): [number, number] => [hx + dx * Math.cos(tilt) - dy * Math.sin(tilt), hy + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
    const eyes = face === 'side' ? [3.4, 7] : [-2.6, 2.6];
    for (const ex of eyes) {
      const a = rot(ex, -0.6), b = rot(ex, 1.6);
      out.push({ d: `M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}`, w: 0.75, order: 4 });
    }
    const mx = face === 'side' ? 5.6 : 0;
    const m0 = rot(mx - 2.2, 4.4), m1 = rot(mx, 5.6), m2 = rot(mx + 2.2, 4.4);
    out.push({ d: `M${f(m0[0])},${f(m0[1])} Q${f(m1[0])},${f(m1[1] + 0.9)} ${f(m2[0])},${f(m2[1])}`, w: 0.6, order: 4 });
  }
  return out;
}

/** Stylised sprint cycle, phase 0..1 (one full stride pair). */
export function runPose(phase: number, lean = 17): FigPose {
  const th = phase * Math.PI * 2;
  const leg = (o: number): [number, number] => {
    const s = Math.sin(th + o), c = Math.cos(th + o);
    return [8 + 48 * s, 14 + 92 * Math.pow(Math.max(0, c), 0.9)];
  };
  // arms swing opposite to the same-side leg; elbows stay near 90°
  const arm = (o: number): [number, number] => [-6 - 58 * Math.sin(th + o), 88 + 12 * Math.sin(th + o)];
  return { lean, head: -8, legA: leg(0), legB: leg(Math.PI), armA: arm(0), armB: arm(Math.PI), hipY: -1.5 * Math.abs(Math.cos(th)) + 1.5, side: true };
}
export function walkPose(phase: number): FigPose {
  const th = phase * Math.PI * 2;
  const leg = (o: number): [number, number] => [26 * Math.sin(th + o), 8 + 30 * Math.max(0, Math.cos(th + o))];
  const arm = (o: number): [number, number] => [-24 * Math.sin(th + o), 18];
  return { lean: 4, legA: leg(0), legB: leg(Math.PI), armA: arm(0), armB: arm(Math.PI), hipY: -0.8 * Math.abs(Math.cos(th)), side: true };
}

export const POSES: Record<string, FigPose> = {
  stand: { armA: [16, -6], armB: [-16, 6], legA: [8, 0], legB: [-8, 0] },
  run: runPose(0.25),
  walk: walkPose(0.25),
  think: { head: -10, armA: [28, 150], armB: [20, 96], legA: [5, 0], legB: [-5, 0], side: true },
  jump: { armA: [128, 18], armB: [-128, -18], legA: [24, 4], legB: [-24, -4], hipY: -7 },
  sit: { lean: -4, armA: [30, 48], armB: [26, 52], legA: [90, 88], legB: [84, 82], hipY: 17, hipX: -10, side: true },
  cheer: { armA: [140, -24], armB: [-140, 24], legA: [12, 0], legB: [-12, 0] },
  point: { armA: [96, 0], armB: [-8, 14], legA: [6, 0], legB: [-6, 0], side: true },
  fall: { lean: -28, head: -14, armA: [160, 20], armB: [125, 35], legA: [62, 30], legB: [30, 50], hipY: -6, side: true },
};

// ---------------------------------------------------------------------------------------------
// Icon definitions: (t = idle seconds, k = optional value 0..1) → strokes

type IconFn = (t: number, k: number) => StrokeDef[];

const line = (x0: number, y0: number, x1: number, y1: number) => `M${f(x0)},${f(y0)} L${f(x1)},${f(y1)}`;
const dot = (cx: number, cy: number, r: number) => circlePath(cx, cy, r);
const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${f(x + r)},${f(y)} L${f(x + w - r)},${f(y)} A${r},${r} 0 0 1 ${f(x + w)},${f(y + r)} L${f(x + w)},${f(y + h - r)} A${r},${r} 0 0 1 ${f(x + w - r)},${f(y + h)} L${f(x + r)},${f(y + h)} A${r},${r} 0 0 1 ${f(x)},${f(y + h - r)} L${f(x)},${f(y + r)} A${r},${r} 0 0 1 ${f(x + r)},${f(y)} Z`;
const handAt = (cx: number, cy: number, len: number, deg: number) => {
  const a = rad(deg - 90);
  return line(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len);
};
const pieSlice = (cx: number, cy: number, r: number, k: number) => {
  if (k <= 0.001) return '';
  if (k >= 0.999) return circlePath(cx, cy, r);
  const a = rad(k * 360 - 90);
  return `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 ${k > 0.5 ? 1 : 0} 1 ${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))} Z`;
};
/** smooth "tick" second hand: jumps one step per second with a quick ease */
const tick = (t: number, step: number) => step * (Math.floor(t) + Math.min(1, (t % 1) / 0.14));

const figure = (pose: FigPose, extra: StrokeDef[] = []): StrokeDef[] => [...figureStrokes(pose), ...extra];

export const ICONS: Record<string, IconFn> = {
  // ----- stick figures -----
  stand: (t) => figure({ ...POSES.stand, armA: [16 + 2 * Math.sin(t * 1.6), -6], armB: [-16 - 2 * Math.sin(t * 1.6), 6] }),
  run: (t) => figure(runPose(0.25 + 0.04 * Math.sin(t * 2)), [
    { d: line(4, 44, 20, 44), w: 0.8, dim: 0.7, order: 5 },
    { d: line(0, 55, 22, 55), w: 0.8, dim: 0.7, order: 5 },
    { d: line(6, 66, 18, 66), w: 0.8, dim: 0.7, order: 5 },
  ]),
  walk: (t) => figure(walkPose(0.25 + 0.03 * Math.sin(t * 2))),
  think: (t) => figure(POSES.think, [
    { d: 'M70,10 C70,4 80,3 80,10 C80,14 75,14.5 75,19', accent: true, w: 0.9, order: 5, tf: `translate(0 ${f(Math.sin(t * 2.2) * 1.2)})` },
    { d: dot(75, 24, 0.9), accent: true, fill: true, order: 5, tf: `translate(0 ${f(Math.sin(t * 2.2) * 1.2)})` },
  ]),
  jump: (t) => {
    const b = Math.sin(t * 3) * 1.5;
    return [
      ...figureStrokes({ ...POSES.jump, hipY: -7 + b }),
      { d: line(38, 97, 46, 97), w: 0.8, dim: 0.6, order: 5 },
      { d: line(54, 97, 62, 97), w: 0.8, dim: 0.6, order: 5 },
      { d: line(44, 101, 56, 101), w: 0.8, dim: 0.4, order: 5 },
    ];
  },
  sit: () => figure(POSES.sit, [
    { d: 'M24,75 L50,75 M27,75 L27,96 M47,75 L47,96 M25,75 L22,44', dim: 0.75, order: 5 },
  ]),
  cheer: (t) => figure({ ...POSES.cheer, armA: [140 + 6 * Math.sin(t * 5), -24], armB: [-140 - 6 * Math.sin(t * 5), 24] }),
  point: () => figure(POSES.point),
  fall: () => figure(POSES.fall),

  // ----- objects -----
  eye: (t) => {
    const ph = t % 3.4;
    const blink = ph > 2.9 && ph < 3.1 ? Math.sin(((ph - 2.9) / 0.2) * Math.PI) : 0;
    const sy = 1 - 0.92 * blink;
    const lx = 4 * Math.sin(t * 0.9);
    const tf = `translate(0 50) scale(1 ${f(sy)}) translate(0 -50)`;
    return [
      { d: 'M6,50 C24,22 76,22 94,50 C76,78 24,78 6,50 Z', tf },
      { d: circlePath(50 + lx, 50, 16), tf, dim: blink > 0.5 ? 0 : 1 },
      { d: dot(50 + lx, 50, 6.5), fill: true, tf, dim: blink > 0.5 ? 0 : 1 },
      { d: dot(55 + lx, 45, 2.2), fill: C.navyE, color: C.navyE, w: 0.01, tf, dim: blink > 0.5 ? 0 : 1, order: 2 },
    ];
  },
  brain: (t) => {
    const s = 1 + 0.015 * Math.sin(t * 2.4);
    const tf = `translate(50 50) scale(${f(s)}) translate(-50 -50)`;
    return [
      { d: 'M28,70 C14,70 7,58 11,47 C6,36 14,23 27,23 C30,13 44,9 54,14 C63,7 79,11 82,22 C93,25 97,39 90,48 C96,58 88,70 76,69 C70,74 61,73 57,68 L36,68 C34,70 31,70 28,70 Z', tf },
      { d: 'M27,23 C29,30 26,36 19,38', w: 0.85, tf },
      { d: 'M54,14 C50,21 53,28 61,29', w: 0.85, tf },
      { d: 'M82,22 C76,26 76,33 81,37', w: 0.85, tf },
      { d: 'M38,36 C44,32 50,36 49,44 C48,51 55,55 62,52', w: 0.85, tf },
      { d: 'M24,52 C30,48 36,52 36,58', w: 0.85, tf },
      { d: 'M72,44 C66,48 68,56 76,57', w: 0.85, tf },
      { d: 'M57,68 C60,76 62,82 58,90', tf },
      { d: 'M64,70 C68,78 78,78 82,70', w: 0.85, dim: 0.85, tf },
    ];
  },
  clock: (t, k) => {
    const out: StrokeDef[] = [{ d: circlePath(50, 50, 40) }];
    for (let i = 0; i < 12; i++) {
      const a = rad(i * 30 - 90), r0 = i % 3 === 0 ? 30 : 33.5;
      out.push({ d: line(50 + Math.cos(a) * r0, 50 + Math.sin(a) * r0, 50 + Math.cos(a) * 36, 50 + Math.sin(a) * 36), w: i % 3 === 0 ? 0.9 : 0.6, order: 1 });
    }
    const sec = k > 0 ? k * 360 : tick(t, 6) + 40;
    out.push({ d: handAt(50, 50, 18, 300 + sec / 720), order: 2 });
    out.push({ d: handAt(50, 50, 27, 60 + sec / 60), order: 2 });
    out.push({ d: handAt(50, 50, 31, sec), accent: true, w: 0.8, order: 3 });
    out.push({ d: dot(50, 50, 2.2), fill: true, accent: true, order: 3 });
    return out;
  },
  stopwatch: (t, k) => {
    const out: StrokeDef[] = [
      { d: circlePath(50, 57, 35) },
      { d: line(50, 22, 50, 14), order: 1 },
      { d: line(42, 11.5, 58, 11.5), w: 1.3, order: 1 },
      { d: line(75, 32, 80, 27), w: 1.1, order: 1 },
    ];
    if (k > 0) out.push({ d: pieSlice(50, 57, 25, k), fill: C.goldHi, fillOpacity: 0.92, accent: true, w: 0.01, order: 2 });
    for (let i = 0; i < 4; i++) {
      const a = rad(i * 90 - 90);
      out.push({ d: line(50 + Math.cos(a) * 29, 57 + Math.sin(a) * 29, 50 + Math.cos(a) * 32, 57 + Math.sin(a) * 32), w: 0.7, order: 2 });
    }
    out.push({ d: handAt(50, 57, 26, k > 0 ? k * 360 : t * 180), accent: true, w: 0.9, order: 3 });
    out.push({ d: dot(50, 57, 2.4), fill: true, accent: true, order: 3 });
    return out;
  },
  heart: (t) => {
    const ph = (t * 1.15) % 1;
    const beat = Math.exp(-Math.pow((ph - 0.08) / 0.05, 2)) + 0.6 * Math.exp(-Math.pow((ph - 0.26) / 0.05, 2));
    const s = 1 + 0.06 * beat;
    const tf = `translate(50 50) scale(${f(s)}) translate(-50 -50)`;
    return [
      { d: 'M50,86 C30,72 10,57 10,37 C10,22 21,13 33,13 C41,13 47,18 50,25 C53,18 59,13 67,13 C79,13 90,22 90,37 C90,57 70,72 50,86 Z', tf },
      { d: 'M20,47 L36,47 L42,35 L50,62 L57,40 L61,47 L80,47', accent: true, w: 0.85, tf, order: 1 },
    ];
  },
  lightning: (t) => {
    const fl = 0.85 + 0.15 * (Math.sin(t * 13) * Math.sin(t * 7.3) > 0.4 ? 1 : 0.4);
    return [{ d: 'M60,5 L24,56 L48,56 L39,95 L78,40 L54,40 L65,5 Z', accent: true, fill: true, fillOpacity: 0.1 * fl }];
  },
  house: (t) => [
    { d: 'M8,50 L50,14 L92,50' },
    { d: 'M70,31 L70,17 L80,17 L80,40', order: 0, w: 0.9 },
    { d: 'M19,41 L19,88 L81,88 L81,41', order: 1 },
    { d: 'M42,88 L42,64 L58,64 L58,88', order: 2 },
    { d: rrect(25, 52, 12, 12, 1), accent: true, fill: true, fillOpacity: 0.35 + 0.1 * Math.sin(t * 2), order: 2, w: 0.85 },
    { d: rrect(63, 52, 12, 12, 1), accent: true, fill: true, fillOpacity: 0.35 + 0.1 * Math.sin(t * 2 + 1), order: 2, w: 0.85 },
    { d: dot(54.5, 77, 0.9), fill: true, order: 3 },
  ],
  phone: (t) => {
    const ping = (t * 0.8) % 1;
    return [
      { d: rrect(29, 7, 42, 86, 8) },
      { d: rrect(34, 17, 32, 60, 2), w: 0.7, order: 1 },
      { d: line(45, 12, 55, 12), w: 0.8, order: 1 },
      { d: dot(50, 85, 2.6), w: 0.8, order: 1 },
      { d: 'M78,22 Q83,30 78,38', accent: true, w: 0.85, dim: 1 - ping, order: 2 },
      { d: 'M84,17 Q91,30 84,43', accent: true, w: 0.85, dim: clamp01(1.4 - ping * 1.2), order: 2 },
      { d: line(39, 30, 61, 30), w: 0.6, dim: 0.6, order: 2 },
      { d: line(39, 38, 55, 38), w: 0.6, dim: 0.6, order: 2 },
    ];
  },
  pill: (t) => {
    const tf = `rotate(${f(-38 + 3 * Math.sin(t * 1.4))} 50 50)`;
    return [
      { d: 'M50,35 L73,35 A15,15 0 0 1 73,65 L50,65 Z', accent: true, fill: true, fillOpacity: 0.9, w: 0.01, tf, order: 1 },
      { d: 'M27,35 L73,35 A15,15 0 0 1 73,65 L27,65 A15,15 0 0 1 27,35 Z', tf },
      { d: line(50, 35, 50, 65), tf, order: 1 },
      { d: 'M24,44 Q26,39 32,39', w: 0.7, tf, order: 2 },
    ];
  },
  warning: (t) => [
    { d: 'M50,10 L92,84 L8,84 Z' },
    { d: line(50, 36, 50, 60), accent: true, w: 1.3, order: 1, dim: 0.75 + 0.25 * Math.sin(t * 6) },
    { d: dot(50, 71, 1.6), accent: true, fill: true, order: 1, dim: 0.75 + 0.25 * Math.sin(t * 6) },
  ],
  check: () => [
    { d: circlePath(50, 50, 40) },
    { d: 'M30,52 L44,66 L71,36', accent: true, w: 1.5, order: 1 },
  ],
  cross: () => [
    { d: circlePath(50, 50, 40) },
    { d: 'M35,35 L65,65 M65,35 L35,65', color: C.red, w: 1.5, order: 1 },
  ],
  arrow: (t) => {
    const n = 2 * Math.sin(t * 3);
    return [
      { d: line(10, 50, 84 + n, 50), accent: true, w: 1.2 },
      { d: `M${f(64 + n)},30 L${f(87 + n)},50 L${f(64 + n)},70`, accent: true, w: 1.2, order: 1 },
    ];
  },
  calendar: (t) => {
    const out: StrokeDef[] = [
      { d: rrect(14, 20, 72, 70, 5) },
      { d: line(14, 37, 86, 37), order: 1 },
      { d: line(31, 12, 31, 27), w: 1.1, order: 1 },
      { d: line(69, 12, 69, 27), w: 1.1, order: 1 },
    ];
    const xs = [27, 41, 55, 69], ys = [50, 63, 76];
    for (const y of ys) for (const x of xs) out.push({ d: dot(x, y, 1.5), fill: true, w: 0.5, order: 2, dim: 0.85 });
    out.push({ d: circlePath(55, 63, 7.5, -60), accent: true, w: 1, order: 3, dim: 0.8 + 0.2 * Math.sin(t * 3) });
    return out;
  },
  globe: (t) => {
    const out: StrokeDef[] = [{ d: circlePath(50, 50, 40) }];
    out.push({ d: line(10, 50, 90, 50), w: 0.75, order: 1 });
    out.push({ d: 'M16,30 Q50,36 84,30', w: 0.65, order: 1, dim: 0.85 });
    out.push({ d: 'M16,70 Q50,64 84,70', w: 0.65, order: 1, dim: 0.85 });
    const spin = (t * 22) % 45;
    for (let i = -2; i <= 2; i++) {
      const lon = i * 45 + spin;
      if (Math.abs(lon) >= 88) continue;
      const rx = Math.abs(40 * Math.sin(rad(lon)));
      const sweep = lon > 0 ? 1 : 0;
      out.push({ d: rx < 0.6 ? line(50, 10, 50, 90) : `M50,10 A${f(rx)},40 0 0 ${sweep} 50,90`, w: 0.65, order: 2, dim: 0.85 });
    }
    return out;
  },
  muscle: (t) => {
    const flex = Math.max(0, Math.sin(t * 2.4));
    const s = 1 + 0.035 * flex;
    const tf = `translate(36 50) scale(${f(s)}) translate(-36 -50)`;
    return [
      { d: 'M8,60 C14,44 28,32 40,33 C52,34 58,44 60,52 C61,44 60,36 62,30 C60,20 66,12 75,12 C84,12 91,20 87,31 C92,46 94,62 86,74 C78,86 40,88 8,84 C6,76 6,68 8,60', tf },
      { d: 'M30,58 C37,51 47,51 53,58', accent: true, w: 0.85, tf, order: 1 },
      { d: 'M66,24 C70,21 75,22 78,26', w: 0.75, tf, order: 1 },
      { d: 'M34,20 L32,13 M44,20 L46,13 M24,25 L19,20', accent: true, w: 0.8, order: 2, dim: 0.4 + 0.6 * flex },
    ];
  },
  money: (t) => {
    const b = 1.5 * Math.sin(t * 1.8);
    return [
      { d: rrect(18, 18 + b * 0.5, 74, 44, 4), dim: 0.45, w: 0.8 },
      { d: rrect(8, 32 + b, 74, 44, 4), order: 1 },
      { d: circlePath(45, 54 + b, 13), order: 2, w: 0.85 },
      { d: `M50.5,${f(47.5 + b)} C49,${f(44.5 + b)} 41,${f(44.5 + b)} 40.5,${f(49 + b)} C40,${f(54 + b)} 50,${f(53 + b)} 50,${f(58.5 + b)} C50,${f(63 + b)} 41.5,${f(63.5 + b)} 39.5,${f(60 + b)}`, accent: true, w: 0.9, order: 3 },
      { d: line(45, 42 + b, 45, 66 + b), accent: true, w: 0.9, order: 3 },
      { d: dot(16, 40 + b, 1.2), fill: true, w: 0.5, order: 3 },
      { d: dot(74, 68 + b, 1.2), fill: true, w: 0.5, order: 3 },
    ];
  },
  flag: (t) => {
    const w = 3 * Math.sin(t * 4);
    return [
      { d: line(26, 94, 26, 8) },
      { d: `M26,10 C40,${f(4 + w)} 52,${f(18 - w)} 78,${f(12 + w * 0.5)} L78,${f(44 + w * 0.5)} C52,${f(50 - w)} 40,${f(36 + w)} 26,42`, accent: true, fill: true, fillOpacity: 0.14, order: 1 },
      { d: line(14, 94, 38, 94), order: 1 },
    ];
  },
  sun: (t) => [
    { d: circlePath(50, 50, 18), accent: true, fill: true, fillOpacity: 0.18 },
    ...Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + t * 0.4, r0 = 27, r1 = 38 + 3 * Math.sin(t * 3 + i);
      return { d: line(50 + r0 * Math.cos(a), 50 + r0 * Math.sin(a), 50 + r1 * Math.cos(a), 50 + r1 * Math.sin(a)), accent: true, w: 1.2, order: 1 };
    }),
  ],
  question: (t) => [
    { d: circlePath(50, 50, 40) },
    { d: 'M38,40 C38,27 62,26 62,39 C62,49 50,49 50,60', accent: true, w: 1.3, order: 1, tf: `rotate(${f(4 * Math.sin(t * 2))} 50 50)` },
    { d: dot(50, 71, 1.5), accent: true, fill: true, order: 1 },
  ],
};

export const ICON_NAMES = Object.keys(ICONS);

// ---------------------------------------------------------------------------------------------

export type IconProps = {
  name: string;
  x: number; // centre (px, parent SVG space)
  y: number;
  size: number; // px for the 100-unit box
  p?: number; // draw-on progress 0..1
  t?: number; // idle time (s)
  k?: number; // value for icons that show one (stopwatch pie / clock time), 0 = idle animation
  sw?: number; // stroke width in px
  color?: string;
  accent?: string;
  opacity?: number;
  flip?: boolean; // mirror horizontally
  filter?: string; // e.g. "url(#card-soft)"
  pose?: FigPose; // custom stick-figure pose (overrides `name`)
};

/** Draw strokes sequentially: slot i occupies a window that overlaps its neighbours by half. */
export const strokeProgress = (p: number, slot: number, slots: number) => {
  const L = 1 / (1 + (slots - 1) * 0.5);
  return clamp01((p - slot * 0.5 * L) / L);
};

export const Icon: React.FC<IconProps> = ({ name, x, y, size, p = 1, t = 0, k = 0, sw = 3.5, color = C.line, accent = C.goldHi, opacity = 1, flip, filter, pose }) => {
  if (p <= 0.001 || opacity <= 0.001) return null;
  const fn = ICONS[name] || ICONS.question;
  const strokes = pose ? figureStrokes(pose) : fn(t, k);
  const sc = size / 100;
  const w = sw / sc;
  const slots = Math.max(...strokes.map((s, i) => s.order ?? i)) + 1;
  return (
    <g transform={`translate(${f(x - size / 2)} ${f(y - size / 2)}) scale(${f(sc)})${flip ? ' translate(100 0) scale(-1 1)' : ''}`} opacity={opacity} filter={filter}>
      {strokes.map((s, i) => {
        const col = s.color ?? (s.accent ? accent : color);
        const fill = s.fill === true ? col : typeof s.fill === 'string' ? s.fill : undefined;
        const sp = strokeProgress(p, s.order ?? i, slots);
        return (
          <Stroke key={i} d={s.d} p={sp} color={col} w={w * (s.w ?? 1)} opacity={s.dim ?? 1} fill={fill} fillOpacity={s.fillOpacity ?? 1} transform={s.tf} />
        );
      })}
    </g>
  );
};

/** Icon as a standalone HTML-positioned SVG element (box = size px, with margin for overshoot). */
export const IconSvg: React.FC<Omit<IconProps, 'x' | 'y'> & { style?: React.CSSProperties }> = ({ style, size, ...rest }) => {
  const pad = size * 0.15;
  const S = size + pad * 2;
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ overflow: 'visible', margin: -pad, ...style }}>
      <Icon {...rest} size={size} x={S / 2} y={S / 2} />
    </svg>
  );
};
