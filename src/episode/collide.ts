// Clip audit: does any part of a character go INTO a solid object (set furniture or a scene prop)?
// Sets record their solid primitives through Batch (sets/roomkit.ts, SetDef.solids); free-standing props
// use the stand-ins in sets/solids.ts. Bodies are spheres (head, chest, hips, hands, forearms, elbows, thighs,
// knees, shins, ankles) and the audit measures how far each primitive cuts into each sphere, in metres — so a
// 4 cm desk top through a head counts. Light contact (a hand on a desk, thighs on a seat) stays under tolerance.
import * as THREE from 'three';
import { DIM, type ActorState } from '../engine/actor';
import { SETS } from '../sets';
import { Batch, collectSolids, type SolidPrim } from '../sets/roomkit';
import { solidBed, solidCar, solidChair, solidTable } from '../sets/solids';
import type { PropSpec, Vec3 } from '../types';

export type Solid = { shape: SolidPrim['shape']; m: THREE.Matrix4; inv: THREE.Matrix4; s: THREE.Vector3; min: THREE.Vector3; max: THREE.Vector3; what: string; size: string; at: Vec3 };

const UNIT: Record<Solid['shape'], [number, number, number]> = { box: [0.5, 0.5, 0.5], cyl: [1, 0.5, 1], sphere: [1, 1, 1] };

function toSolid(p: SolidPrim, what: string): Solid {
  const pos = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  p.m.decompose(pos, q, s);
  const [ux, uy, uz] = UNIT[p.shape];
  const box = new THREE.Box3();
  for (const x of [-ux, ux]) for (const y of [-uy, uy]) for (const z of [-uz, uz]) box.expandByPoint(new THREE.Vector3(x, y, z).applyMatrix4(p.m));
  const dims = [2 * ux * Math.abs(s.x), 2 * uy * Math.abs(s.y), 2 * uz * Math.abs(s.z)];
  return {
    shape: p.shape, m: p.m, inv: p.m.clone().invert(), s: new THREE.Vector3(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z)), min: box.min, max: box.max,
    what, size: dims.map(v => v.toFixed(2)).join('×'), at: [+pos.x.toFixed(2), +pos.y.toFixed(2), +pos.z.toFixed(2)],
  };
}

/** Depth (m) of a world point inside a solid; ≤ 0 = outside. */
export function depthIn(sol: Solid, p: THREE.Vector3): number {
  if (p.x < sol.min.x || p.y < sol.min.y || p.z < sol.min.z || p.x > sol.max.x || p.y > sol.max.y || p.z > sol.max.z) return -1;
  const q = p.clone().applyMatrix4(sol.inv), s = sol.s;
  if (sol.shape === 'box') return Math.min((0.5 - Math.abs(q.x)) * s.x, (0.5 - Math.abs(q.y)) * s.y, (0.5 - Math.abs(q.z)) * s.z);
  if (sol.shape === 'cyl') return Math.min((1 - Math.hypot(q.x, q.z)) * Math.min(s.x, s.z), (0.5 - Math.abs(q.y)) * s.y);
  return (1 - q.length()) * Math.min(s.x, s.y, s.z);
}

/** How far a solid cuts into a sphere (centre c, radius r), in metres; ≤ 0 = no contact. A thin desk top
 *  through a head counts fully (that's what shows), unlike a point-depth test. */
export function sphereCut(sol: Solid, c: THREE.Vector3, r: number): number {
  if (c.x < sol.min.x - r || c.y < sol.min.y - r || c.z < sol.min.z - r || c.x > sol.max.x + r || c.y > sol.max.y + r || c.z > sol.max.z + r) return -1;
  const inside = depthIn(sol, c);
  if (inside > 0) return r + inside;
  const q = c.clone().applyMatrix4(sol.inv);
  if (sol.shape === 'box') q.set(THREE.MathUtils.clamp(q.x, -0.5, 0.5), THREE.MathUtils.clamp(q.y, -0.5, 0.5), THREE.MathUtils.clamp(q.z, -0.5, 0.5));
  else if (sol.shape === 'cyl') {
    const h = Math.hypot(q.x, q.z);
    if (h > 1) { q.x /= h; q.z /= h; }
    q.y = THREE.MathUtils.clamp(q.y, -0.5, 0.5);
  } else if (q.length() > 1) q.normalize();
  return r - c.distanceTo(q.applyMatrix4(sol.m));
}

const setCache = new Map<string, Solid[]>();
/** The set's furniture solids (cached per set + variant). Outdoor sets have none registered yet. */
export function setSolids(setKey: string, variant = 0): Solid[] {
  const key = `${setKey}|${variant}`;
  let out = setCache.get(key);
  if (!out) {
    const builds = SETS[setKey]?.solids?.(variant) || [];
    // floor coverings (rugs, tiles, mats: thin and at floor level) are walked on, not solid
    out = collectSolids(builds).map(p => toSolid(p, `${setKey} ${p.from}`)).filter(x => x.max.y > 0.05);
    setCache.set(key, out);
  }
  return out;
}

const N = (v: unknown, d: number) => (typeof v === 'number' ? v : d);

/** Solids of the shot's free-standing props at time t (furniture-like types only; hand props don't count). */
export function propSolids(props: PropSpec[], t: number): Solid[] {
  const b = new Batch(false);
  props.forEach((p, i) => {
    let pos: Vec3 = p.pos || [0, 0, 0];
    let r = p.rot;
    const pts = p.path;
    if (pts?.length) {
      if (t <= pts[0].t) pos = pts[0].pos;
      else if (t >= pts[pts.length - 1].t) pos = pts[pts.length - 1].pos;
      else for (let k = 0; k < pts.length - 1; k++) if (t >= pts[k].t && t < pts[k + 1].t) {
        const u = (t - pts[k].t) / (pts[k + 1].t - pts[k].t);
        pos = pts[k].pos.map((v, j) => v + (pts[k + 1].pos[j] - v) * u) as Vec3;
      }
    }
    const rr: Vec3 = typeof r === 'number' ? [0, (r * Math.PI) / 180, 0] : r ? (r.map(v => (v * Math.PI) / 180) as Vec3) : [0, 0, 0];
    b.from = `prop #${i} ${p.type}`;
    b.at(pos, rr, () => {
      switch (p.type) {
        case 'table': solidTable(b, [0, 0, 0], 0, N(p.w, 1.4), N(p.d, 0.8)); break;
        case 'roundTable': solidTable(b, [0, 0, 0], 0, N(p.w, 0.9), 0.9, 0.75, true); break;
        case 'desk': solidTable(b, [0, 0, 0], 0, 1.4, 0.7, 0.75); break;
        case 'chair': solidChair(b, [0, 0, 0]); break;
        case 'bed': solidBed(b, [0, 0, 0]); break;
        case 'car': solidCar(b, [0, 0, 0]); break;
        case 'box': case 'crate': b.box([0, N(p.h, 0.5) / 2, 0], [N(p.w, 0.5), N(p.h, 0.5), N(p.d, 0.5)], '#000'); break;
        case 'pillar': b.add('cyl', '#000', [0, N(p.h, 3) / 2, 0], [N(p.w, 0.3), N(p.h, 3), N(p.w, 0.3)]); break;
        case 'wall': b.box([0, N(p.h, 3) / 2, 0], [N(p.w, 4), N(p.h, 3), 0.15], '#000'); break;
        default: break;
      }
    }, p.scale ?? 1);
  });
  return b.solids.map(x => toSolid(x, x.from));
}

const pos = (m: THREE.Matrix4) => new THREE.Vector3().setFromMatrixPosition(m);

/** The body as spheres (centre, radius, and how much contact is fine: a hand resting on a desk, thighs on a seat). */
export function bodySpheres(a: ActorState): { part: string; p: THREE.Vector3; r: number; tol: number }[] {
  const B = a.bones, head = a.anchors.head, k = a.scale;
  const r = head.distanceTo(a.anchors.headTop) / 1.15;
  // radii from the rig (DIM.limbR = 3 cm sticks); tolerances let resting contact pass (hands on a desk, a seat)
  const L = DIM.limbR * k;
  const out = [
    { part: 'head', p: head.clone(), r, tol: 0.005 }, // the head fills the frame: 2 cm into a desk already shows
    { part: 'chest', p: a.anchors.chest.clone(), r: 0.1 * k, tol: 0.02 },
    { part: 'hips', p: a.anchors.hips.clone(), r: 0.05 * k, tol: 0.03 },
  ];
  for (const sd of ['L', 'R'] as const) {
    const hand = a.anchors[`hand${sd}`], elbow = pos(B[`forearm${sd}`]), hip = pos(B[`thigh${sd}`]), knee = pos(B[`shin${sd}`]), ankle = pos(B[`foot${sd}`]);
    out.push(
      { part: `hand ${sd}`, p: hand.clone(), r: 0.045 * k, tol: 0.025 },
      { part: `forearm ${sd}`, p: elbow.clone().lerp(hand, 0.5), r: L, tol: 0.02 },
      { part: `elbow ${sd}`, p: elbow, r: L, tol: 0.02 },
      { part: `thigh ${sd}`, p: hip.clone().lerp(knee, 0.5), r: L, tol: 0.02 },
      { part: `knee ${sd}`, p: knee, r: L, tol: 0.02 },
      { part: `shin ${sd}`, p: knee.clone().lerp(ankle, 0.5), r: L, tol: 0.02 },
      { part: `ankle ${sd}`, p: ankle, r: L, tol: 0.02 },
    );
  }
  return out;
}

export type Clip = { part: string; depth: number; solid: Solid };

/** The deepest clip of each body part into any of `solids` (only cuts beyond the part's tolerance). */
export function clipsOf(a: ActorState, solids: Solid[]): Clip[] {
  if (!solids.length) return [];
  const parts = bodySpheres(a);
  // broad phase: solids whose box meets the body's box
  const bb = new THREE.Box3();
  parts.forEach(x => bb.expandByPoint(x.p));
  bb.expandByScalar(0.2);
  const near = solids.filter(s => !(s.max.x < bb.min.x || s.min.x > bb.max.x || s.max.y < bb.min.y || s.min.y > bb.max.y || s.max.z < bb.min.z || s.min.z > bb.max.z));
  if (!near.length) return [];
  const best = new Map<string, Clip>();
  for (const x of parts) {
    // hips/legs whose centre is above a surface are resting on it (sitting, standing on a crate): not a clip.
    // Head, chest and hands get no such pass — a head sunk into a desk still has its centre above the top.
    const rests = /^(hips|thigh|knee|ankle)/.test(x.part);
    for (const s of near) {
      if (rests && x.p.y >= s.max.y - (x.part === 'hips' ? 0.04 : 0.01)) continue; // a seated pelvis sits ~3 cm into the seat line
      const d = sphereCut(s, x.p, x.r) - x.tol;
      if (d > 0 && (!best.has(x.part) || best.get(x.part)!.depth < d)) best.set(x.part, { part: x.part, depth: d, solid: s });
    }
  }
  return [...best.values()];
}
