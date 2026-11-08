// Pose library, gait cycles and facial expressions for the stickman rig.
// Angles in degrees. Arms: [fwd raise, out raise, twist, elbow]; legs: [fwd raise, out raise, knee].
import type { Face, Gait, Pose, Vec3 } from '../types';

type FullPose = Required<Omit<Pose, 'handL' | 'handR' | 'reachL' | 'reachR'>> & Pick<Pose, 'handL' | 'handR' | 'reachL' | 'reachR'>;

export const BASE: FullPose = {
  hipY: 0,
  body: [0, 0, 0],
  spine: [0, 0, 0],
  head: [0, 0, 0],
  armL: [4, 8, 0, 8],
  armR: [4, 8, 0, 8],
  legL: [0, 3, 0],
  legR: [0, 3, 0],
};

const P = (p: Pose): Pose => p;

// Seated poses put the hips at chair height (0.46 m below standing hips ≈ 0.45 m seat).
export const POSES: Record<string, Pose> = {
  stand: P({}),
  relaxed: P({ spine: [2, 0, 0], armL: [0, 6, 0, 12], armR: [0, 6, 0, 12], legL: [2, 5, 2], legR: [-2, 2, 0] }),
  confident: P({ spine: [-4, 0, 0], head: [-6, 0, 0], armL: [-6, 35, -90, 100], armR: [-6, 35, -90, 100], legL: [0, 9, 0], legR: [0, 9, 0] }), // hands on hips
  armsCrossed: P({ spine: [-2, 0, 0], armL: [30, 22, -60, 120], armR: [26, 22, -60, 125], legL: [0, 6, 0], legR: [0, 6, 0] }),
  point: P({ spine: [0, 0, -10], armR: [88, 10, 0, 0], handR: 'point', armL: [2, 8, 0, 12] }),
  pointUp: P({ armR: [160, 12, 0, 0], handR: 'point', head: [-25, 0, 0] }),
  wave: P({ armR: [10, 80, 90, 100], head: [0, 0, 6] }),
  thinking: P({ head: [8, 12, 10], armR: [55, 10, -40, 140], armL: [30, 20, -60, 115], spine: [4, 0, 0] }), // hand on chin
  shrug: P({ head: [0, 0, 10], spine: [0, 0, 0], armL: [20, 35, 60, 95], armR: [20, 35, 60, 95] }),
  facepalm: P({ head: [25, 0, 0], spine: [12, 0, 0], armR: [95, 5, -20, 150] }),
  cheer: P({ head: [-15, 0, 0], armL: [165, 20, 0, 10], armR: [165, 20, 0, 10], handL: 'fist', handR: 'fist' }),
  fistPump: P({ spine: [5, 0, 0], armR: [60, 20, 0, 130], handR: 'fist', head: [-8, 0, 0], legL: [8, 6, 10] }),
  shocked: P({ spine: [-8, 0, 0], head: [-6, 0, 0], armL: [75, 45, 0, 145], armR: [75, 45, 0, 145] }), // hands to head
  scared: P({ spine: [10, 0, 0], hipY: -0.08, armL: [70, 20, -30, 120], armR: [70, 20, -30, 120], legL: [12, 8, 22], legR: [12, 8, 22] }),
  sad: P({ spine: [18, 0, 0], head: [28, 0, 0], armL: [-2, 2, 0, 4], armR: [-2, 2, 0, 4] }),
  defeated: P({ spine: [35, 0, 0], head: [30, 0, 0], hipY: -0.05, armL: [-4, 2, 0, 0], armR: [-4, 2, 0, 0], legL: [10, 4, 18], legR: [10, 4, 18] }),
  determined: P({ spine: [6, 0, 0], head: [4, 0, 0], armL: [20, 14, 0, 100], armR: [20, 14, 0, 100], handL: 'fist', handR: 'fist', legL: [8, 10, 6], legR: [-6, 8, 4] }),
  fight: P({ spine: [10, 0, 20], head: [6, -20, 0], armL: [70, 20, 0, 110], armR: [45, 25, 0, 125], handL: 'fist', handR: 'fist', hipY: -0.06, legL: [18, 12, 22], legR: [-14, 10, 14] }),
  punch: P({ spine: [8, 0, -25], armR: [90, 0, 0, 0], handR: 'fist', armL: [55, 20, 0, 120], handL: 'fist', legL: [20, 10, 15], legR: [-20, 8, 10] }),
  reach: P({ spine: [16, 0, 0], armR: [80, 6, 0, 0], handR: 'open', armL: [10, 10, 0, 20] }),
  catch: P({ spine: [10, 0, 0], armL: [85, 18, 0, 25], armR: [85, 18, 0, 25], handL: 'open', handR: 'open', hipY: -0.04, legL: [10, 8, 15], legR: [10, 8, 15] }),
  holdOut: P({ armR: [70, 10, -30, 40], armL: [6, 8, 0, 10] }), // showing something in the hand
  phone: P({ head: [30, 0, 0], spine: [6, 0, 0], armR: [38, 5, -60, 115], armL: [32, 10, -60, 105] }),
  typing: P({ spine: [10, 0, 0], head: [12, 0, 0], armL: [25, 8, 0, 70], armR: [25, 8, 0, 70] }),
  sit: P({ hipY: -0.46, spine: [-2, 0, 0], legL: [88, 6, 92], legR: [88, 6, 92], armL: [30, 10, 0, 60], armR: [30, 10, 0, 60] }),
  sitSlump: P({ hipY: -0.48, spine: [26, 0, 0], head: [24, 0, 0], legL: [84, 8, 86], legR: [84, 8, 86], armL: [24, 8, 0, 50], armR: [24, 8, 0, 50] }),
  sitThink: P({ hipY: -0.46, spine: [14, 0, 0], head: [6, 0, 8], legL: [88, 6, 92], legR: [88, 6, 92], armR: [60, 6, -40, 145], armL: [34, 12, 0, 70] }),
  sitFloor: P({ hipY: -0.86, spine: [10, 0, 0], legL: [70, 22, 120], legR: [70, 22, 120], armL: [55, 10, 0, 40], armR: [55, 10, 0, 40] }), // hugging knees
  kneel: P({ hipY: -0.42, spine: [6, 0, 0], legL: [85, 4, 88], legR: [0, 4, 92], armL: [4, 8, 0, 20], armR: [4, 8, 0, 20] }),
  crouch: P({ hipY: -0.42, spine: [30, 0, 0], head: [-20, 0, 0], legL: [80, 14, 125], legR: [70, 14, 120], armL: [40, 15, 0, 40], armR: [40, 15, 0, 40] }),
  lie: P({ hipY: -0.82, body: [-90, 0, 0], armL: [0, 12, 0, 6], armR: [0, 12, 0, 6] }), // on back
  sleep: P({ hipY: -0.32, body: [-90, 0, 0], head: [0, 20, 0], armL: [0, 10, 0, 30], armR: [40, 10, 0, 100] }), // on a bed (mattress ~0.5 m)
  fall: P({ body: [-30, 0, 0], spine: [-15, 0, 0], head: [-20, 0, 0], armL: [120, 50, 0, 20], armR: [120, 50, 0, 20], legL: [30, 10, 30], legR: [10, 8, 10] }),
  jump: P({ hipY: 0.35, spine: [-6, 0, 0], armL: [150, 25, 0, 20], armR: [150, 25, 0, 20], legL: [30, 6, 60], legR: [10, 6, 40] }),
  celebrate: P({ hipY: 0.2, head: [-18, 0, 0], armL: [150, 40, 0, 10], armR: [150, 40, 0, 10], handL: 'fist', handR: 'fist', legL: [24, 8, 50], legR: [6, 8, 30] }),
  bow: P({ spine: [55, 0, 0], head: [10, 0, 0], armL: [0, 4, 0, 0], armR: [0, 4, 0, 0] }),
  lean: P({ spine: [-6, 6, 0], armL: [-10, 30, 0, 30], armR: [8, 4, 0, 10], legL: [0, 4, 0], legR: [12, -6, 10] }),
  hug: P({ spine: [8, 0, 0], armL: [80, 30, -40, 75], armR: [80, 30, -40, 75] }),
  carry: P({ armL: [35, 14, 0, 55], armR: [35, 14, 0, 55] }),
  cry: P({ spine: [22, 0, 0], head: [25, 0, 0], armL: [80, 14, -20, 150], armR: [80, 14, -20, 150] }), // face in hands
  stretch: P({ head: [-14, 0, 0], armL: [175, 12, 0, 0], armR: [175, 12, 0, 0], spine: [-6, 0, 0] }),
  power: P({ spine: [-4, 0, 0], head: [-10, 0, 0], armL: [30, 45, 0, 10], armR: [30, 45, 0, 10], handL: 'open', handR: 'open', legL: [0, 14, 0], legR: [0, 14, 0] }), // power surge
  focus: P({ head: [6, 0, 0], armR: [70, 35, -50, 145], armL: [6, 8, 0, 12] }), // fingers to temple
  explain: P({ spine: [0, 0, 6], armL: [40, 20, 40, 70], armR: [44, 22, 40, 60], handL: 'open', handR: 'open' }),
  hide: P({ hipY: -0.5, spine: [40, 0, 0], head: [-30, 0, 0], legL: [80, 10, 130], legR: [80, 10, 130], armL: [50, 10, 0, 80], armR: [50, 10, 0, 80] }),
  zombie: P({ hipY: -0.01, spine: [10, 0, 4], head: [14, 0, 16], armL: [82, 6, 0, 12], armR: [76, 6, 0, 18], handL: 'open', handR: 'open', legL: [4, 5, 10], legR: [-2, 5, 6] }), // sleepwalker, arms out in front
};

export const FACES: Record<string, Face> = {
  neutral: {},
  happy: { mouth: 0.8, eyes: 0.9 },
  grin: { mouth: 1, open: 0.45, eyes: 0.75 },
  smile: { mouth: 0.55 },
  smirk: { mouth: 0.45, eyes: 0.55, brow: -0.25, width: 0.75 },
  sad: { mouth: -0.6, brow: 0.8, eyes: 0.8 },
  cry: { mouth: -0.8, open: 0.3, brow: 1, eyes: 0.5, tears: true },
  angry: { mouth: -0.5, brow: -1, eyes: 0.75 },
  furious: { mouth: -0.7, open: 0.5, brow: -1, eyes: 0.6 },
  shocked: { eyes: 1.4, pupils: true, open: 0.85, mouth: 0, brow: 0.2, browY: 0.5 },
  surprised: { eyes: 1.25, open: 0.5, browY: 0.4 },
  scared: { eyes: 1.3, pupils: true, mouth: -0.4, open: 0.35, brow: 0.9, sweat: true },
  worried: { mouth: -0.3, brow: 0.8, eyes: 1 },
  determined: { mouth: -0.1, brow: -0.6, eyes: 0.7 },
  focused: { mouth: 0, brow: -0.4, eyes: 0.55 },
  sleepy: { eyes: 0.12, mouth: 0 },
  closed: { eyes: 0.05, mouth: 0.2 },
  bliss: { eyes: 0.05, mouth: 0.9 },
  confused: { mouth: -0.2, brow: 0.6, browY: 0.2, eyes: 1, look: [0.4, 0.3] },
  suspicious: { eyes: 0.4, brow: -0.5, mouth: -0.15, look: [0.6, 0] },
  embarrassed: { mouth: 0.2, brow: 0.7, eyes: 0.7, blush: true, sweat: true },
  love: { mouth: 0.7, eyes: 0.8, blush: true },
  tired: { eyes: 0.4, mouth: -0.25, brow: 0.5 },
  awe: { eyes: 1.2, open: 0.3, mouth: 0.2, browY: 0.4 },
  smug: { eyes: 1.15, lid: 0.45, brow: -0.35, mouth: 0.7, width: 1.1 },
  sly: { eyes: 1.0, lid: 0.55, brow: -0.6, mouth: 0.45, width: 0.9, look: [0.5, 0] },
  bored: { eyes: 1.0, lid: 0.6, mouth: -0.1 },
  zombie: { eyes: 0.22, lid: 0.3, mouth: -0.25, open: 0.45, brow: 0.3, look: [0, -0.3] }, // half-asleep, jaw hanging
};

export const FACE_BASE: Required<Omit<Face, 'pupils' | 'tears' | 'sweat' | 'blush' | 'lidTilt'>> & Face = {
  eyes: 1, look: [0, 0], brow: 0, browY: 0, mouth: 0.15, open: 0, width: 1, lid: 0, size: 1,
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpArr = <T extends number[]>(a: T, b: T, k: number): T => a.map((v, i) => lerp(v, b[i], k)) as T;

export function full(p: Pose | undefined): FullPose {
  return { ...BASE, ...(p || {}) } as FullPose;
}

export function resolvePose(p: string | Pose | undefined): FullPose {
  if (!p) return full(POSES.stand);
  if (typeof p === 'string') {
    if (!POSES[p]) console.warn('unknown pose', p);
    return full(POSES[p] || POSES.stand);
  }
  return full(p);
}

export function resolveFace(f: string | Face | undefined): typeof FACE_BASE {
  if (!f) return { ...FACE_BASE };
  if (typeof f === 'string') {
    if (!FACES[f]) console.warn('unknown face', f);
    return { ...FACE_BASE, ...(FACES[f] || {}) };
  }
  return { ...FACE_BASE, ...f };
}

export function blendPose(a: FullPose, b: FullPose, k: number): FullPose {
  return {
    hipY: lerp(a.hipY, b.hipY, k),
    body: lerpArr(a.body, b.body, k),
    spine: lerpArr(a.spine, b.spine, k),
    head: lerpArr(a.head, b.head, k),
    armL: lerpArr(a.armL, b.armL, k),
    armR: lerpArr(a.armR, b.armR, k),
    legL: lerpArr(a.legL, b.legL, k),
    legR: lerpArr(a.legR, b.legR, k),
    handL: k < 0.5 ? a.handL : b.handL,
    handR: k < 0.5 ? a.handR : b.handR,
  };
}

export function blendFace(a: typeof FACE_BASE, b: typeof FACE_BASE, k: number): typeof FACE_BASE {
  const pick = <K extends keyof Face>(key: K) => (k < 0.5 ? a[key] : b[key]);
  return {
    eyes: lerp(a.eyes, b.eyes, k),
    look: lerpArr(a.look as [number, number], b.look as [number, number], k),
    brow: lerp(a.brow, b.brow, k),
    browY: lerp(a.browY, b.browY, k),
    mouth: lerp(a.mouth, b.mouth, k),
    open: lerp(a.open, b.open, k),
    width: lerp(a.width, b.width, k),
    lid: lerp(a.lid ?? 0, b.lid ?? 0, k),
    lidTilt: k < 0.5 ? a.lidTilt : b.lidTilt,
    size: lerp(a.size ?? 1, b.size ?? 1, k),
    pupils: pick('pupils'),
    tears: pick('tears'),
    sweat: pick('sweat'),
    blush: pick('blush'),
  };
}

export const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/** Evaluate a keyframed track: value at t, eased transitions of `blend` seconds starting at each key. */
export function track<T>(
  keys: { t: number; v: T; blend?: number }[],
  t: number,
  mix: (a: T, b: T, k: number) => T,
  defBlend = 0.35,
): T {
  // keys must be in time order (the loop stops at the first future key); merged tracks may not be
  if (keys.some((k, i) => i > 0 && k.t < keys[i - 1].t)) keys = [keys[0], ...keys.slice(1).sort((a, b) => a.t - b.t)];
  let cur = keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (t < k.t) break;
    const b = k.blend ?? defBlend;
    const w = b <= 0 ? 1 : ease((t - k.t) / b);
    cur = w >= 1 ? k.v : mix(cur, k.v, w);
  }
  return cur;
}

const S = (x: number) => Math.sin(x);

/** Gait cycle overlay. phase in cycles; returns the pose plus vertical bob. */
export function gaitPose(g: Gait, phase: number): FullPose {
  const a = phase * Math.PI * 2;
  const s = S(a), c = Math.cos(a);
  switch (g) {
    case 'run':
    case 'jog': {
      const amp = g === 'run' ? 1 : 0.65;
      return full({
        hipY: Math.abs(c) * 0.06 * amp - 0.03,
        spine: [12 * amp + 2, 0, s * 8],
        head: [-6 * amp, 0, 0],
        legL: [s * 45 * amp + 10, 4, 25 + Math.max(0, -s) * 75 * amp + Math.max(0, c) * 10],
        legR: [-s * 45 * amp + 10, 4, 25 + Math.max(0, s) * 75 * amp + Math.max(0, -c) * 10],
        armL: [-s * 50 * amp + 10, 12, 0, 90],
        armR: [s * 50 * amp + 10, 12, 0, 90],
        handL: 'fist',
        handR: 'fist',
      });
    }
    case 'sprint':
      return full({
        hipY: Math.abs(c) * 0.08 - 0.06,
        spine: [32, 0, s * 6],
        head: [-26, 0, 0],
        legL: [s * 60 + 14, 4, 30 + Math.max(0, -s) * 95],
        legR: [-s * 60 + 14, 4, 30 + Math.max(0, s) * 95],
        armL: [-35, 18, 0, 20], // arms swept back
        armR: [-35, 18, 0, 20],
      });
    case 'sneak':
      return full({
        hipY: -0.18 + Math.abs(c) * 0.02,
        spine: [24, 0, 0],
        head: [-14, s * 10, 0],
        legL: [s * 22 + 20, 6, 40 + Math.max(0, -s) * 30],
        legR: [-s * 22 + 20, 6, 40 + Math.max(0, s) * 30],
        armL: [40, 14, 0, 90],
        armR: [40, 14, 0, 90],
      });
    case 'dash':
      // powerful athletic sprint: big strides, heel kicks to the hips, pumping arms
      return full({
        hipY: -0.05 + Math.abs(c) * 0.07,
        spine: [22, 0, s * 7],
        head: [-16, 0, 0],
        legL: [s * 60 + 16, 4, 22 + Math.max(0, -s) * 108 + Math.max(0, c) * 14],
        legR: [-s * 60 + 16, 4, 22 + Math.max(0, s) * 108 + Math.max(0, -c) * 14],
        armL: [-s * 68 + 12, 14, 0, 96],
        armR: [s * 68 + 12, 14, 0, 96],
        handL: 'fist',
        handR: 'fist',
      });
    case 'glide':
      // riding something (skateboard, ice): no stride, knees soft, arms out for balance
      return full({
        hipY: -0.06 + S(a * 0.5) * 0.01,
        spine: [10, 0, 8],
        head: [-4, -10, 0],
        legL: [12, 10, 22],
        legR: [-6, 6, 14],
        armL: [10, 55, 0, 25],
        armR: [6, 40, 0, 30],
      });
    case 'float':
      return full({
        hipY: 0.25 + S(a * 0.5) * 0.05,
        spine: [4, 0, 0],
        legL: [10, 4, 30],
        legR: [4, 4, 20],
        armL: [10, 25, 0, 20],
        armR: [10, 25, 0, 20],
      });
    case 'shamble':
      // zombie drag: short heavy steps, arms held out in front, head lolling, body rocking
      return full({
        hipY: -0.02 - Math.abs(s) * 0.012,
        spine: [10, s * 5, s * 9],
        head: [12, s * 6, 14 + s * 6],
        legL: [s * 16 + 4, 5, 14 + Math.max(0, -s) * 18],
        legR: [-s * 16 + 4, 5, 14 + Math.max(0, s) * 18],
        armL: [82 + s * 6, 6, 0, 12],
        armR: [78 - s * 6, 6, 0, 16],
        handL: 'open',
        handR: 'open',
      });
    case 'walk':
    default:
      return full({
        hipY: -Math.abs(s) * 0.025 + 0.012,
        spine: [3, 0, s * 4],
        head: [0, 0, 0],
        legL: [s * 24, 3, 6 + Math.max(0, -s) * 28 + Math.max(0, c) * 8],
        legR: [-s * 24, 3, 6 + Math.max(0, s) * 28 + Math.max(0, -c) * 8],
        armL: [-s * 22 + 2, 8, 0, 14 + Math.max(0, -s) * 12],
        armR: [s * 22 + 2, 8, 0, 14 + Math.max(0, s) * 12],
      });
  }
}

export const GAIT_SPEED: Record<Gait, number> = { walk: 1.35, jog: 2.6, run: 4.2, sprint: 9, dash: 9, sneak: 0.7, float: 1.2, glide: 4, carried: 4, shamble: 0.55 };
export const GAIT_STRIDE: Record<Gait, number> = { walk: 1.3, jog: 1.9, run: 2.6, sprint: 3.6, dash: 3.4, sneak: 0.8, float: 4, glide: 6, carried: 1, shamble: 0.9 };

/** Small always-on life: breathing and weight shift. */
export function idleOffset(p: FullPose, t: number, seed: number, amount = 1): FullPose {
  const b = S(t * 1.9 + seed) * amount, w = S(t * 0.55 + seed * 3) * amount;
  return {
    ...p,
    spine: [p.spine[0] + b * 1.2, p.spine[1] + w * 1.2, p.spine[2]],
    head: [p.head[0] - b * 1.4, p.head[1] + S(t * 0.37 + seed) * 2.5 * amount, p.head[2] + w * 1.5],
    armL: [p.armL[0] + b * 1.5, p.armL[1] + b * 1.2, p.armL[2], p.armL[3] + b * 2],
    armR: [p.armR[0] - b * 1.5, p.armR[1] + b * 1.2, p.armR[2], p.armR[3] + b * 2],
  };
}

/** Talking: head nods and small hand gestures. */
export function talkOffset(p: FullPose, t: number, seed: number): FullPose {
  const n = S(t * 7 + seed) * 0.5 + S(t * 3.1 + seed * 2) * 0.5;
  return {
    ...p,
    head: [p.head[0] + n * 4, p.head[1] + S(t * 1.7 + seed) * 5, p.head[2] + S(t * 2.3) * 2],
    armR: [p.armR[0] + Math.max(0, S(t * 2.2 + seed)) * 18, p.armR[1] + 4, p.armR[2], p.armR[3] + Math.max(0, S(t * 2.2 + seed)) * 30],
  };
}

export function deg(v: number) {
  return (v * Math.PI) / 180;
}

export function v3(a: Vec3 | undefined, d: Vec3 = [0, 0, 0]): Vec3 {
  return a ? a : d;
}
