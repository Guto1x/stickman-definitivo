// Keyframed cameras, smooth shake, and 3D→2D projection for overlays.
import * as THREE from 'three';
import type { Vec3 } from '../types';

export type CamKey = { t: number; pos: Vec3; look: Vec3; fov?: number; roll?: number; ease?: keyof typeof EASE };
export type CamState = { pos: THREE.Vector3; look: THREE.Vector3; fov: number; roll: number };

const EASE = {
  linear: (x: number) => x,
  inOut: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  in: (x: number) => x * x * x,
  out: (x: number) => 1 - Math.pow(1 - x, 3),
  snap: (x: number) => 1 - Math.pow(1 - x, 6),
  // trapezoid speed: short ramp up, constant cruise, short ramp down (pans that track a mover)
  cruise: (x: number) => {
    const r = 0.15, v = 1 / (1 - r);
    return x < r ? (v * x * x) / (2 * r) : x < 1 - r ? v * (x - r / 2) : 1 - (v * (1 - x) * (1 - x)) / (2 * r);
  },
};

export function camAt(keys: CamKey[], t: number): CamState {
  let a = keys[0], b = keys[0], k = 0;
  if (t <= keys[0].t) a = b = keys[0];
  else if (t >= keys[keys.length - 1].t) a = b = keys[keys.length - 1];
  else
    for (let i = 0; i < keys.length - 1; i++)
      if (t >= keys[i].t && t < keys[i + 1].t) {
        a = keys[i];
        b = keys[i + 1];
        k = EASE[b.ease || 'inOut']((t - a.t) / (b.t - a.t));
      }
  const lerp = (x: Vec3, y: Vec3) => new THREE.Vector3(x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k, x[2] + (y[2] - x[2]) * k);
  return {
    pos: lerp(a.pos, b.pos),
    look: lerp(a.look, b.look),
    fov: (a.fov ?? 32) + ((b.fov ?? 32) - (a.fov ?? 32)) * k,
    roll: (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * k,
  };
}

// Smooth value noise (deterministic).
function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}
export function noise1(x: number, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return (hash(i + seed * 101.3) * (1 - u) + hash(i + 1 + seed * 101.3) * u) * 2 - 1;
}

/** Add shake: `amp` metres of positional jitter (look point gets half), `freq` Hz. */
export function shake(c: CamState, t: number, amp: number, freq = 18, seed = 1): CamState {
  if (amp <= 0) return c;
  const o = new THREE.Vector3(noise1(t * freq, seed), noise1(t * freq, seed + 1), noise1(t * freq, seed + 2)).multiplyScalar(amp);
  return { ...c, pos: c.pos.clone().add(o), look: c.look.clone().add(o.clone().multiplyScalar(0.5)), roll: c.roll + noise1(t * freq * 0.7, seed + 3) * amp * 8 };
}

/** Exponential decay envelope for impacts: 1 at t0, decaying with `tau` seconds. */
export function impulse(t: number, t0: number, tau = 0.25) {
  return t < t0 ? 0 : Math.exp(-(t - t0) / tau);
}

export function makeCamera(c: CamState, aspect: number) {
  const cam = new THREE.PerspectiveCamera(c.fov, aspect, 0.05, 900);
  cam.position.copy(c.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(c.look);
  if (c.roll) cam.rotateZ((c.roll * Math.PI) / 180);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
}

/** Project a world point to pixel coordinates of a W×H frame. z>1 means behind the camera. */
export function project(p: THREE.Vector3, c: CamState, W: number, H: number) {
  const cam = makeCamera(c, W / H);
  const v = p.clone().project(cam);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, z: v.z, visible: v.z < 1 && v.z > -1 };
}

/** Pixel size of a world-space length at a point (for sizing 2D overlays). */
export function pxPerMetre(p: THREE.Vector3, c: CamState, H: number) {
  const d = p.distanceTo(c.pos);
  return H / (2 * d * Math.tan((c.fov * Math.PI) / 360));
}
