// Pure evaluation of an actor at time t: position, heading, pose, face, and forward kinematics.
// The renderer and the camera solver both use this, so framing always matches what is drawn.
import * as THREE from 'three';
import type { ActorInShot, CastMember, Gait, Vec3 } from '../types';
import {
  blendFace, blendPose, deg, ease, FACE_BASE, full, gaitPose, GAIT_STRIDE, idleOffset,
  resolveFace, resolvePose, talkOffset, track,
} from './rig';

export type FullPose = ReturnType<typeof full>;
export type FullFace = typeof FACE_BASE;

// Skeleton dimensions for an adult (height 1). Kids scale down and get bigger heads.
export const DIM = {
  thigh: 0.43, shin: 0.43, foot: 0.045, torso: 0.46, neck: 0.0, headR: 0.212,
  shoulderW: 0.135, hipW: 0.075, upperArm: 0.31, forearm: 0.29, limbR: 0.03,
};
export const HIP_H = DIM.thigh + DIM.shin + DIM.foot;

export type Bones = {
  root: THREE.Matrix4; hips: THREE.Matrix4; chest: THREE.Matrix4; spine: THREE.Matrix4; head: THREE.Matrix4;
  upperArmL: THREE.Matrix4; forearmL: THREE.Matrix4; handL: THREE.Matrix4;
  upperArmR: THREE.Matrix4; forearmR: THREE.Matrix4; handR: THREE.Matrix4;
  thighL: THREE.Matrix4; shinL: THREE.Matrix4; footL: THREE.Matrix4;
  thighR: THREE.Matrix4; shinR: THREE.Matrix4; footR: THREE.Matrix4;
};

export type ActorState = {
  spec: ActorInShot;
  cast: CastMember;
  pos: Vec3;
  rot: number; // degrees
  scale: number;
  headScale: number;
  pose: FullPose;
  face: FullFace;
  mouthOpen: number;
  moving: boolean;
  speed: number;
  bones: Bones;
  anchors: Record<'head' | 'headTop' | 'chest' | 'hips' | 'handL' | 'handR' | 'feet', THREE.Vector3>;
};

const T = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const R = (x: number, y: number, z: number, order: THREE.EulerOrder = 'XYZ') =>
  new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(deg(x), deg(y), deg(z), order));
const mul = (...ms: THREE.Matrix4[]) => ms.reduce((a, b) => a.clone().multiply(b));

export function skeleton(pos: Vec3, rot: number, scale: number, headScale: number, p: FullPose): Bones {
  const root = mul(T(...pos), R(0, rot, 0), new THREE.Matrix4().makeScale(scale, scale, scale));
  const hips = mul(root, T(0, HIP_H + p.hipY, 0), R(p.body[0], p.body[1], p.body[2]));
  const spine = mul(hips, R(p.spine[0], p.spine[2], -p.spine[1], 'YXZ'));
  const chest = mul(spine, T(0, DIM.torso, 0));
  const head = mul(chest, T(0, DIM.neck, 0), R(p.head[0], p.head[1], -p.head[2], 'YXZ'),
    new THREE.Matrix4().makeScale(headScale, headScale, headScale), T(0, DIM.headR * 0.84, 0));
  const arm = (side: 1 | -1, a: number[]) => {
    const upper = mul(chest, T(side * DIM.shoulderW, -0.035, 0), R(-a[0], side * a[2], side * a[1], 'XZY'));
    const fore = mul(upper, T(0, -DIM.upperArm, 0), R(-a[3], 0, 0));
    const hand = mul(fore, T(0, -DIM.forearm, 0));
    return [upper, fore, hand];
  };
  const leg = (side: 1 | -1, l: number[]) => {
    const thigh = mul(hips, T(side * DIM.hipW, 0, 0), R(-l[0], 0, side * l[1], 'XZY'));
    const shin = mul(thigh, T(0, -DIM.thigh, 0), R(l[2], 0, 0));
    const foot = mul(shin, T(0, -DIM.shin, 0));
    return [thigh, shin, foot];
  };
  const [upperArmL, forearmL, handL] = arm(1, p.armL);
  const [upperArmR, forearmR, handR] = arm(-1, p.armR);
  const [thighL, shinL, footL] = leg(1, p.legL);
  const [thighR, shinR, footR] = leg(-1, p.legR);
  return { root, hips, spine, chest, head, upperArmL, forearmL, handL, upperArmR, forearmR, handR, thighL, shinL, footL, thighR, shinR, footR };
}

const P0 = () => new THREE.Vector3();

// --- two-bone arm IK ------------------------------------------------------------------------
const LANDMARK: Record<string, { bone: 'head' | 'chest' | 'hips'; p: [number, number, number] }> = {
  // head-local points (head centre origin, face toward +z); the wrist sits a fist below/in front
  mouth: { bone: 'head', p: [0, -0.165, DIM.headR + 0.075] },
  chin: { bone: 'head', p: [0, -0.17, DIM.headR - 0.02] },
  face: { bone: 'head', p: [0, -0.06, DIM.headR + 0.07] },
  forehead: { bone: 'head', p: [0, 0.02, DIM.headR + 0.06] },
  temple: { bone: 'head', p: [0.17, -0.02, 0.1] },
  chest: { bone: 'chest', p: [0, -0.2, 0.2] },
  heart: { bone: 'chest', p: [0.06, -0.16, 0.19] },
  hip: { bone: 'hips', p: [0.2, 0.02, 0.02] },
  pocket: { bone: 'hips', p: [0.0, 0.08, 0.2] },
};

/** Replace armL/armR angles with IK solutions for any reachL/reachR in the pose. */
export function withReach(p: FullPose): FullPose {
  if (!p.reachL && !p.reachR) return p;
  const b = skeleton([0, 0, 0], 0, 1, 1, p);
  const out = { ...p };
  for (const side of [1, -1] as const) {
    const r = side === 1 ? p.reachL : p.reachR;
    if (!r) continue;
    let target: THREE.Vector3;
    if (Array.isArray(r.to)) target = new THREE.Vector3(...r.to);
    else {
      const lm = LANDMARK[r.to];
      const m = lm.bone === 'head' ? b.head : lm.bone === 'chest' ? b.chest : b.hips;
      // landmarks on the side (temple, hip, heart) mirror for the right hand
      const x = r.to === 'temple' || r.to === 'hip' || r.to === 'heart' ? lm.p[0] * side : lm.p[0];
      target = new THREE.Vector3(x, lm.p[1], lm.p[2]).applyMatrix4(m);
    }
    if (r.offset) target.add(new THREE.Vector3(...r.offset));
    const arm = solveArm(side, b.chest, target, r.pole);
    if (side === 1) out.armL = arm;
    else out.armR = arm;
  }
  return out;
}

function solveArm(side: 1 | -1, chest: THREE.Matrix4, targetRoot: THREE.Vector3, pole?: Vec3): [number, number, number, number] {
  const inv = chest.clone().invert();
  const T = targetRoot.clone().applyMatrix4(inv); // chest-local
  const S = new THREE.Vector3(side * DIM.shoulderW, -0.035, 0);
  const a = DIM.upperArm, bl = DIM.forearm;
  const dv = T.clone().sub(S);
  const d = Math.min(a + bl - 1e-3, Math.max(Math.abs(a - bl) + 1e-3, dv.length()));
  const tHat = dv.clone().normalize();
  const pv = new THREE.Vector3(...(pole || [side * 0.45, -0.6, -0.35])).normalize();
  const pPerp = pv.clone().sub(tHat.clone().multiplyScalar(pv.dot(tHat)));
  if (pPerp.lengthSq() < 1e-6) pPerp.set(0, -1, 0);
  pPerp.normalize();
  const alpha = Math.acos(THREE.MathUtils.clamp((a * a + d * d - bl * bl) / (2 * a * d), -1, 1));
  const u = tHat.clone().multiplyScalar(Math.cos(alpha)).add(pPerp.clone().multiplyScalar(Math.sin(alpha))).normalize();
  const E = S.clone().add(u.clone().multiplyScalar(a));
  const f = S.clone().add(tHat.clone().multiplyScalar(d)).sub(E).normalize();
  const elbow = (Math.acos(THREE.MathUtils.clamp(u.dot(f), -1, 1)) * 180) / Math.PI;
  let w = f.clone().sub(u.clone().multiplyScalar(f.dot(u)));
  if (w.lengthSq() < 1e-6) w = pPerp.clone().multiplyScalar(-1);
  w.normalize();
  const Y = u.clone().multiplyScalar(-1);
  const X = new THREE.Vector3().crossVectors(Y, w).normalize();
  const Z = new THREE.Vector3().crossVectors(X, Y).normalize();
  const m = new THREE.Matrix4().makeBasis(X, Y, Z);
  const e = new THREE.Euler().setFromRotationMatrix(m, 'XZY');
  const deg = (r: number) => (r * 180) / Math.PI;
  return [-deg(e.x), side * deg(e.z), side * deg(e.y), elbow];
}
export const at = (m: THREE.Matrix4, x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z).applyMatrix4(m);

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function angleLerp(a: number, b: number, k: number) {
  let d = ((b - a + 540) % 360) - 180;
  return a + d * k;
}

/** Position, heading and gait phase along the waypoint path. */
function locomotion(a: ActorInShot, t: number) {
  const base: Vec3 = a.pos || [0, 0, 0];
  const path = a.path;
  if (!path || path.length === 0) return { pos: base, rot: a.rot ?? 0, moving: false, gait: 'walk' as Gait, dist: 0, speed: 0, w: 0 };
  const pts = path[0].t > 0 || !a.pos ? path : [{ t: 0, pos: base }, ...path];
  if (t <= pts[0].t) {
    return { pos: pts[0].pos, rot: a.rot ?? pts[0].rot ?? headingOf(pts[0].pos, pts[1]?.pos) ?? 0, moving: false, gait: 'walk' as Gait, dist: 0, speed: 0, w: 0 };
  }
  let dist = 0;
  let prevHeading = a.rot ?? headingOf(pts[0].pos, pts[1]?.pos) ?? 0;
  let moveStart = -1; // when the actor (re)starts moving: the gait eases in from there
  let prevSeg = 0;
  let wEnd = 0; // gait weight left when the previous segment ended (a stop leaves a short stride to settle)
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1];
    const seg = Math.hypot(p1.pos[0] - p0.pos[0], p1.pos[2] - p0.pos[2]);
    if (seg > 0.01 && (moveStart < 0 || prevSeg <= 0.01)) moveStart = p0.t;
    const p2 = pts[i + 2];
    const stopping = seg > 0.01 && (!p2 || Math.hypot(p2.pos[0] - p1.pos[0], p2.pos[2] - p1.pos[2]) <= 0.01); // decelerating into a stop or a hold
    const heading = seg > 0.01 ? headingOf(p0.pos, p1.pos)! : prevHeading;
    const gait = (p1 as { gait?: Gait }).gait || a.gait || 'walk';
    if (t < p1.t) {
      const k = (t - p0.t) / Math.max(1e-3, p1.t - p0.t);
      // ease in at the first segment's start and out at the last segment's end
      const first = i === 0, last = i === pts.length - 2;
      const kk = first && last ? ease(k) * 0.5 + k * 0.5 : first ? k * k * 0.3 + k * 0.7 : last ? 1 - (1 - k) * (1 - k) * 0.3 - (1 - k) * 0.7 : k;
      const pos: Vec3 = [p0.pos[0] + (p1.pos[0] - p0.pos[0]) * kk, p0.pos[1] + (p1.pos[1] - p0.pos[1]) * kk, p0.pos[2] + (p1.pos[2] - p0.pos[2]) * kk];
      const turnK = Math.min(1, (t - p0.t) / 0.25);
      const rot = angleLerp(prevHeading, heading, ease(turnK));
      const speed = seg / Math.max(1e-3, p1.t - p0.t);
      // gait weight: eases in on a (re)start, shrinks the stride while braking, fades out during a hold
      let w = seg <= 0.01 ? wEnd * Math.max(0, 1 - (t - p0.t) / 0.2) : moveStart >= 0 ? Math.min(1, (t - moveStart) / 0.22) : 1;
      if (stopping) w = Math.min(w, 0.35 + 0.65 * Math.min(1, (p1.t - t) / 0.3));
      return { pos, rot: a.strafe ? a.rot ?? 0 : rot, moving: seg > 0.01, gait, dist: dist + seg * kk, speed, w };
    }
    wEnd = seg > 0.01 ? (stopping ? 0.35 : 1) : wEnd * Math.max(0, 1 - (p1.t - p0.t) / 0.2);
    prevSeg = seg;
    dist += seg;
    prevHeading = heading;
  }
  const lastP = pts[pts.length - 1];
  const endRot = (lastP as { rot?: number }).rot ?? prevHeading;
  const since = t - lastP.t;
  const rot = angleLerp(prevHeading, endRot, ease(Math.min(1, since / 0.35)));
  return { pos: lastP.pos, rot: a.strafe ? a.rot ?? 0 : rot, moving: false, gait: (lastP as { gait?: Gait }).gait || a.gait || 'walk' as Gait, dist, speed: 0, w: wEnd * Math.max(0, 1 - since / 0.2) };
}

function headingOf(a: Vec3, b?: Vec3): number | undefined {
  if (!b) return undefined;
  const dx = b[0] - a[0], dz = b[2] - a[2];
  if (Math.hypot(dx, dz) < 0.01) return undefined;
  return (Math.atan2(dx, dz) * 180) / Math.PI;
}

/** Fade weight for talking: ramps in/out over 0.15 s so gestures never pop on or off. */
function talkWeight(talk: [number, number][] | undefined, t: number) {
  let w = 0;
  for (const [s, e] of talk || []) {
    if (t < s - 0.15 || t > e + 0.15) continue;
    w = Math.max(w, Math.min(1, (t - s + 0.15) / 0.3, (e + 0.15 - t) / 0.3));
  }
  return Math.max(0, w);
}

/**
 * Evaluate an actor at shot time `t`. `clock` (default t) drives the always-on motion — breathing,
 * blinks, talk gestures — so pass absolute episode time to keep it continuous across shot boundaries.
 */
export function evalActor(
  a: ActorInShot, cast: CastMember, t: number, seed: number,
  lookAt?: (target: string | Vec3) => THREE.Vector3 | undefined,
  clock: number = t,
): ActorState {
  const height = cast.height ?? 1;
  const scale = (a.scale ?? 1) * height;
  const headScale = height < 1 ? 1 + (1 - height) * 0.75 : 1;
  const loco = locomotion(a, t);

  // keyframed pose track
  // pose transitions never shorter than 0.1 s (3 frames), so nothing pops in a single frame
  const poseKeys = [{ t: -1, v: withReach(resolvePose(a.pose)), blend: 0 }, ...(a.poses || []).map(k => ({ t: k.t, v: withReach(resolvePose(k.pose)), blend: Math.max(0.1, k.blend ?? 0.35) }))];
  let pose = track(poseKeys, t, blendPose);
  const sitting = pose.hipY < -0.3 || Math.abs(pose.body[0]) > 45;

  // locomotion cycle overrides the body while moving, blending out at the end ('carried' keeps the keyed pose)
  if (loco.w > 0 && loco.gait !== 'carried') {
    const g = loco.gait;
    const phase = loco.dist / GAIT_STRIDE[g];
    const gp = gaitPose(g, phase);
    pose = blendPose(pose, gp, ease(Math.min(1, loco.w)));
  }

  pose = idleOffset(pose, clock, seed, loco.moving ? 0 : sitting ? 0.5 : 1);
  const talkW = loco.moving ? 0 : talkWeight(a.talk, t);
  if (talkW > 0) pose = blendPose(pose, talkOffset(pose, clock, seed), talkW);

  // face track + blink
  const faceKeys = [{ t: -1, v: resolveFace(a.face), blend: 0 }, ...(a.faces || []).map(k => ({ t: k.t, v: resolveFace(k.face), blend: k.blend ?? 0.15 }))];
  const face = { ...track(faceKeys, t, blendFace, 0.15) };
  const blinkPeriod = 3.2 + hash(seed) * 2.2;
  const bp = (clock + hash(seed + 1) * blinkPeriod) % blinkPeriod;
  if (bp < 0.13 && face.eyes > 0.2) face.eyes *= 0.08;
  let mouthOpen = face.open;
  if (talkW > 0) mouthOpen = Math.max(mouthOpen, talkW * (0.15 + 0.35 * Math.abs(Math.sin(clock * 11 + seed) * Math.sin(clock * 4.3))));

  // head look-at (turn + nod), spills into the spine past 60°
  if (a.look && lookAt) {
    const target = lookAt(a.look);
    if (target) {
      const pre = skeleton(loco.pos, loco.rot, scale, headScale, pose);
      const headPos = at(pre.head);
      const d = target.clone().sub(headPos);
      const yawWorld = (Math.atan2(d.x, d.z) * 180) / Math.PI;
      let rel = ((yawWorld - loco.rot - pose.spine[2] + 540) % 360) - 180;
      rel = Math.max(-110, Math.min(110, rel));
      const headTurn = Math.max(-65, Math.min(65, rel));
      const spill = rel - headTurn;
      const pitch = (-Math.atan2(d.y, Math.hypot(d.x, d.z)) * 180) / Math.PI;
      pose = {
        ...pose,
        head: [Math.max(-35, Math.min(40, pitch - pose.spine[0] * 0.5)) + pose.head[0] * 0.3, headTurn, pose.head[2]],
        spine: [pose.spine[0], pose.spine[1], pose.spine[2] + spill * 0.8],
      };
    }
  }

  return composeState(a, cast, loco.pos, loco.rot, scale, headScale, pose, face, mouthOpen, loco.moving, loco.speed);
}

/** Build a full ActorState (bones + anchors) from a pose; used directly to blend across shots. */
export function composeState(
  a: ActorInShot, cast: CastMember, pos: Vec3, rot: number, scale: number, headScale: number,
  pose: FullPose, face: FullFace, mouthOpen: number, moving = false, speed = 0,
): ActorState {
  const bones = skeleton(pos, rot, scale, headScale, pose);
  const r = DIM.headR;
  return {
    spec: a, cast, pos, rot, scale, headScale, pose, face, mouthOpen, moving, speed, bones,
    anchors: {
      head: at(bones.head),
      headTop: at(bones.head, 0, r * 1.15, 0),
      chest: at(bones.chest, 0, -0.12, 0),
      hips: at(bones.hips),
      handL: at(bones.handL),
      handR: at(bones.handR),
      feet: new THREE.Vector3(pos[0], pos[1], pos[2]),
    },
  };
}

/** Blend two states of the same actor (shot-to-shot continuity). */
export function blendStates(a: ActorState, b: ActorState, k: number): ActorState {
  const pos: Vec3 = [a.pos[0] + (b.pos[0] - a.pos[0]) * k, a.pos[1] + (b.pos[1] - a.pos[1]) * k, a.pos[2] + (b.pos[2] - a.pos[2]) * k];
  const d = ((b.rot - a.rot + 540) % 360) - 180;
  return composeState(b.spec, b.cast, pos, a.rot + d * k, b.scale, b.headScale, blendPose(a.pose, b.pose, k), blendFace(a.face, b.face, k), a.mouthOpen + (b.mouthOpen - a.mouthOpen) * k, b.moving, b.speed);
}

export { P0 };
