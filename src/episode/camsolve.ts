// Camera solver: turns a high-level CameraSpec ("close on hero, 30° to his left, push in")
// into a CamState for time t, re-framing every frame so moving actors stay framed.
import * as THREE from 'three';
import type { ActorState } from '../engine/actor';
import { camAt, noise1, shake, type CamKey, type CamState } from '../engine/cam';
import type { CameraSpec, Vec3 } from '../types';

// Visible frame height (m) per shot size, and default elevation (deg).
const SIZE: Record<string, { h: number; el: number; focus: 'head' | 'chest' | 'hips' | 'ground' }> = {
  insert: { h: 0.35, el: 12, focus: 'chest' },
  xclose: { h: 0.56, el: 2, focus: 'head' },
  close: { h: 0.8, el: 4, focus: 'head' },
  medium: { h: 1.35, el: 6, focus: 'chest' },
  full: { h: 2.4, el: 8, focus: 'hips' },
  wide: { h: 5.5, el: 12, focus: 'hips' },
  establishing: { h: 16, el: 18, focus: 'ground' },
};

const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const D2R = Math.PI / 180;

function anchorOf(a: ActorState, focus: string): THREE.Vector3 {
  switch (focus) {
    case 'head': return a.anchors.head.clone().add(new THREE.Vector3(0, -0.03, 0));
    case 'chest': return a.anchors.chest.clone().add(new THREE.Vector3(0, 0.12, 0));
    case 'hips': return a.anchors.hips.clone().add(new THREE.Vector3(0, 0.05, 0));
    case 'feet': return a.anchors.feet.clone().add(new THREE.Vector3(0, 0.2, 0));
    case 'handL': return a.anchors.handL.clone();
    case 'handR': return a.anchors.handR.clone();
    default: return a.anchors.feet.clone().add(new THREE.Vector3(0, 1.0, 0));
  }
}

export function solveCamera(
  spec: CameraSpec | undefined,
  t: number,
  dur: number,
  actors: Record<string, ActorState>,
  fallback: Vec3,
  rot0?: Record<string, number>, // actors' facing at shot start: the camera orients on these, so it never flips when a target turns
): CamState {
  const s: CameraSpec = spec || {};
  const k = dur > 0 ? Math.max(0, Math.min(1, t / dur)) : 0;
  const ke = easeInOut(k);
  const amt = s.amount ?? 1;

  // explicit keyframes (times already cue-resolved by evalShot)
  if (s.path?.length) {
    const keys: CamKey[] = s.path.map(k => ({ t: k.t as number, pos: k.pos, look: k.look, fov: k.fov ?? s.fov ?? 32, roll: s.dutch ?? 0, ease: k.ease }));
    return finish(camAt(keys, t), s, t, amt);
  }
  // explicit placement (optionally animated to `to`)
  if (s.pos && s.look) {
    const [m0, m1] = (s.moveAt as [number, number] | undefined) ?? [0, dur]; // cues are resolved by evalShot
    const keys: CamKey[] = [{ t: m0, pos: s.pos, look: s.look, fov: s.fov ?? 32, roll: s.dutch ?? 0 }];
    if (s.to) keys.push({ t: Math.max(m0 + 0.1, m1), pos: s.to.pos, look: s.to.look, fov: s.fov ?? 32, roll: s.dutch ?? 0, ease: s.ease });
    return finish(camAt(keys, t), s, t, amt);
  }

  const size = SIZE[s.shot || 'medium'] || SIZE.medium;
  const fov = s.fov ?? (s.shot === 'establishing' ? 40 : s.shot === 'wide' ? 36 : 32);
  const ids = Array.isArray(s.target) ? s.target : typeof s.target === 'string' ? [s.target] : [];
  const list = ids.map(id => actors[id]).filter(Boolean);
  const first = list[0] || Object.values(actors)[0];

  // focus point and frame height
  let focus: THREE.Vector3;
  let h = size.h;
  if (Array.isArray(s.target) && s.target.length === 3 && typeof s.target[0] === 'number') {
    focus = new THREE.Vector3(...(s.target as unknown as Vec3));
  } else if (list.length > 1) {
    const pts = list.map(a => anchorOf(a, s.focus || size.focus));
    focus = pts.reduce((acc, p) => acc.add(p), new THREE.Vector3()).multiplyScalar(1 / pts.length);
    const spread = Math.max(...pts.map(p => p.distanceTo(focus))) * 2;
    h = Math.max(h, spread * 0.75 + 0.6);
  } else if (first) {
    focus = anchorOf(first, s.focus || size.focus);
  } else {
    focus = new THREE.Vector3(...fallback);
  }
  if (s.shot === 'establishing') focus.y = Math.max(focus.y, 1.5);

  // orientation: relative to the (first) target actor's facing, else world (+z side)
  const firstId = list[0] ? ids[0] : Object.keys(actors)[0];
  const baseYaw = first && !(Array.isArray(s.target) && typeof s.target[0] === 'number') ? rot0?.[firstId] ?? first.rot : 0;
  let yaw = baseYaw + (s.angle ?? 20);
  let el = s.height ?? size.el;
  let dist = s.dist ?? h / 2 / Math.tan((fov * D2R) / 2);
  const look = focus.clone();

  switch (s.move || 'drift') {
    case 'drift': yaw += 5 * ke * amt; dist *= 1 - 0.05 * ke * amt; break;
    case 'pushIn': dist *= 1 - 0.22 * ke * amt; break;
    case 'pullOut': dist *= 0.82 + 0.25 * ke * amt; break;
    case 'orbitL': yaw -= 28 * ke * amt; break;
    case 'orbitR': yaw += 28 * ke * amt; break;
    case 'craneUp': el += 14 * ke * amt; break;
    case 'craneDown': el -= 12 * ke * amt; break;
    case 'crashIn': dist *= 1 - 0.3 * amt * (1 - Math.pow(1 - Math.min(1, k * 5), 4)); break;
    default: break;
  }

  // over-the-shoulder: sit behind `over` actor's shoulder, looking at the focus
  if (s.over && actors[s.over]) {
    const o = actors[s.over];
    const fwd = focus.clone().sub(o.anchors.head).setY(0).normalize();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    const back = s.dist ?? 0.85; // further back = smaller shoulder in frame
    const pos = o.anchors.head.clone().addScaledVector(fwd, -back).addScaledVector(right, 0.38 * Math.sqrt(back / 0.85)).add(new THREE.Vector3(0, 0.06 + 0.08 * (back - 0.85), 0));
    return finish({ pos, look: focus.clone().add(new THREE.Vector3(0, -0.04, 0)), fov: s.fov ?? 34, roll: s.dutch ?? 0 }, s, t, amt);
  }

  // never closer than ~2.4 head radii to a face, or the lens ends up inside the head
  if ((s.focus || size.focus) === 'head') dist = Math.max(dist, 0.62);
  const y = yaw * D2R, e = el * D2R;
  const pos = focus.clone().add(new THREE.Vector3(Math.sin(y) * Math.cos(e), Math.sin(e), Math.cos(y) * Math.cos(e)).multiplyScalar(dist));
  if (s.move === 'truckL' || s.move === 'truckR') {
    const right = new THREE.Vector3(Math.cos(y), 0, -Math.sin(y)).multiplyScalar((s.move === 'truckR' ? 1 : -1) * 0.7 * ke * amt * Math.max(1, h / 1.5));
    pos.add(right);
    look.add(right);
  }
  return finish({ pos, look, fov, roll: s.dutch ?? 0 }, s, t, amt);
}

function finish(c: CamState, s: CameraSpec, t: number, amt: number): CamState {
  // keep the camera above the floor
  if (c.pos.y < 0.15) c.pos.y = 0.15;
  if (s.move === 'shake') return shake(c, t, 0.03 * amt, 16, 3);
  if (s.move === 'handheld') return shake(c, t, 0.012 * amt, 3.5, 7);
  // every shot breathes a little, like IFOLOGY's constantly moving camera
  const b = 0.004;
  return { ...c, pos: c.pos.clone().add(new THREE.Vector3(noise1(t * 0.7, 1) * b, noise1(t * 0.6, 2) * b, 0)) };
}
