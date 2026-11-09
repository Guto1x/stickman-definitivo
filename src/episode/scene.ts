// Single source of truth for "what is where" in an episode shot at time t: actors (marks, word
// cues, swap power, continuity blending), camera (solver, shake, flow across near-identical cuts)
// and props. The renderer (ShotView), the scene audit, the self-tests and the review overlay all
// call evalShot, so what gets checked is exactly what gets drawn.
import * as THREE from 'three';
import { blendStates, evalActor, type ActorState } from '../engine/actor';
import { project, pxPerMetre, shake, type CamState } from '../engine/cam';
import { ease } from '../engine/rig';
import { SETS, type SetDef } from '../sets';
import type { ActorInShot, CameraSpec, CastMember, PropSpec, Shot3D, Vec3 } from '../types';
import { solveCamera } from './camsolve';
import { cue, type Words } from './cue';
import { place, resolveActor } from './resolve';

const W = 1920, H = 1080;

export type ShotCtx = { shot: Shot3D; dur: number; start: number; words?: Words };
export type SwapInfo = { t: number; ids: [string, string]; keepPaths?: boolean; pre: [ActorInShot, ActorInShot] };
export type FlowInfo = { on: boolean; camBlend: number; actorBlend: number; reason: string; screenShift?: number; angle?: number; scale?: number };
export type SceneState = {
  setKey: string;
  def: SetDef;
  palKey: string;
  actors: ActorInShot[];
  states: ActorState[];
  byId: Record<string, ActorState>;
  cam: CamState;
  swap?: SwapInfo;
  frozen: boolean;
  props: PropSpec[];
  flow?: FlowInfo;
  camOut: number; // metres the camera was pulled back inside the room walls (0 = it was inside)
  beat: number; // index of the current sub-cut (0 = the framing as written)
};

/** Stable per-character seed, so breathing/blinks don't jump when the same character is in the next shot. */
export function seedOf(id: string, dup = 0) {
  let h = 7;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 100003;
  return (h % 997) * 0.37 + dup * 5.1;
}

/** Resolve marks + word cues, then apply the swap power. Swapper = swap.ids[0]. */
export function resolveShotActors(shot: Shot3D, t: number, words: Words, setKey: string): { actors: ActorInShot[]; swap?: SwapInfo } {
  let actors = (shot.actors || []).filter(a => !a.hidden).map(a => resolveActor({
    ...a,
    poses: a.poses?.map(k => ({ ...k, t: cue(k.t as number | string, words, 0) })),
    faces: a.faces?.map(k => ({ ...k, t: cue(k.t as number | string, words, 0) })),
    path: a.path?.map(w => ({ ...w, t: cue(w.t as number | string, words, 0) })),
  }, setKey));
  const sw = shot.fx?.swap;
  if (!sw) return { actors };
  const st = cue(sw.t, words, 0.5);
  const i0 = actors.findIndex(a => a.id === sw.ids[0]);
  const i1 = actors.findIndex(a => a.id === sw.ids[1]);
  if (i0 < 0 || i1 < 0) return { actors };
  const pre: [ActorInShot, ActorInShot] = [actors[i0], actors[i1]];
  const blink = (eyes: number) => ({ eyes, brow: -0.35, mouth: 0.35 });
  actors = actors.map((a, i) => {
    if (i === i0) {
      const faces = [...(a.faces || []), { t: st - 0.42, face: blink(0.05), blend: 0.04 }, { t: st - 0.31, face: blink(1), blend: 0.04 },
        { t: st - 0.2, face: blink(0.05), blend: 0.04 }, { t: st - 0.09, face: blink(1), blend: 0.04 }];
      return t >= st && !sw.keepPaths ? { ...a, faces, pos: pre[1].pos, rot: pre[1].rot, path: undefined } : { ...a, faces };
    }
    if (i === i1 && t >= st && !sw.keepPaths) return { ...a, pos: pre[0].pos, rot: pre[0].rot, path: undefined };
    return a;
  });
  return { actors, swap: { t: st, ids: sw.ids, keepPaths: sw.keepPaths, pre } };
}

/** Interpolate cameras by orbiting around a moving look point (never cuts through the subject). */
export function orbitBlend(a: CamState, b: CamState, k: number): CamState {
  const look = a.look.clone().lerp(b.look, k);
  const oa = a.pos.clone().sub(a.look), ob = b.pos.clone().sub(b.look);
  const ra = Math.max(1e-3, oa.length()), rb = Math.max(1e-3, ob.length());
  const ya = Math.atan2(oa.x, oa.z), yb = Math.atan2(ob.x, ob.z);
  let dy = yb - ya;
  while (dy > Math.PI) dy -= 2 * Math.PI;
  while (dy < -Math.PI) dy += 2 * Math.PI;
  const pa = Math.asin(THREE.MathUtils.clamp(oa.y / ra, -1, 1)), pb = Math.asin(THREE.MathUtils.clamp(ob.y / rb, -1, 1));
  const r = ra * Math.pow(rb / ra, k), yaw = ya + dy * k, pitch = pa + (pb - pa) * k;
  const pos = look.clone().add(new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(r));
  return { pos, look, fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k };
}

/** How different two framings look on screen: mean subject shift (fraction of width), view angle, scale ratio. */
export function framingDelta(a: CamState, b: CamState, points: THREE.Vector3[]) {
  const pts = points.length ? points : [a.look, b.look];
  let shift = 0, n = 0;
  for (const p of pts) {
    const pa = project(p, a, W, H), pb = project(p, b, W, H);
    if (!pa.visible && !pb.visible) continue;
    // a point only visible in one framing counts as fully different
    shift += pa.visible && pb.visible ? Math.min(1, Math.hypot(pa.x - pb.x, pa.y - pb.y) / W) : 1;
    n++;
  }
  const da = a.look.clone().sub(a.pos).normalize(), db = b.look.clone().sub(b.pos).normalize();
  const angle = (Math.acos(THREE.MathUtils.clamp(da.dot(db), -1, 1)) * 180) / Math.PI;
  const ref = pts[0];
  const scale = pxPerMetre(ref, b, H) / Math.max(1e-6, pxPerMetre(ref, a, H));
  return { shift: n ? shift / n : 1, angle, scale };
}

// ---- sub-cuts (coverage) -------------------------------------------------------------------
// One shot spec, several camera setups: each beat re-frames the same subject (punch-in, then a new
// angle, ...) so a 4 s line reads as 2–3 cuts without writing more shots. Only automatic cameras.
export type Beat = { t0: number; t1: number; k: number };
const TIGHTER: Record<string, CameraSpec['shot']> = { establishing: 'wide', wide: 'full', full: 'medium', medium: 'close', close: 'xclose', xclose: 'xclose', insert: 'insert' };
const beatCache = new WeakMap<Shot3D, Beat[]>();

export function beatsOf(ctx: ShotCtx): Beat[] {
  const { shot, dur, words } = ctx;
  const hit = beatCache.get(shot);
  if (hit && hit.length && Math.abs(hit[hit.length - 1].t1 - dur) < 1e-6) return hit;
  const c = shot.camera || {};
  // automatic cameras re-frame per beat; explicit ones (pos/path) punch in / orbit their own view (beatView)
  const expl = isExplicit(c);
  const auto = !(c.pos || c.path || c.over) || expl;
  let cuts: number[] = [];
  if (auto && c.beats?.length) cuts = c.beats.map(b => cue(b, words, -1)).filter(x => x > 0.3 && x < dur - 0.3);
  else if (auto && shot.coverage && shot.coverage !== 'off') {
    // explicit cameras usually frame an action tableau: cut them less often, so the action still reads
    const [target, min] = shot.coverage === 'fast' ? (expl ? [2.2, 1.4] : [1.6, 1.1]) : (expl ? [3.0, 2.0] : [2.6, 1.8]);
    // cut just before a word starts, so the new framing lands on the word
    const starts = (words || []).map(w => w[1] - 0.08).filter(x => x > 0);
    const cands = starts.length ? starts : Array.from({ length: Math.floor(dur / 0.4) }, (_, i) => i * 0.4);
    let last = 0;
    for (const x of cands) if (x - last >= target && dur - x >= min) { cuts.push(x); last = x; }
  }
  cuts.sort((a, b) => a - b);
  const out: Beat[] = [];
  let t0 = 0;
  [...cuts, dur].forEach((t1, k) => { out.push({ t0, t1, k }); t0 = t1; });
  beatCache.set(shot, out);
  return out;
}

/** An explicit camera (pos/look or path, not over-the-shoulder): its sub-cuts transform the solved view (beatView). */
export const isExplicit = (c: CameraSpec | undefined) => !!c && !!(c.pos || c.path) && !c.over;

/**
 * Sub-cut of an explicit camera, applied to the view solved on the shot's own clock (so moveAt / path
 * timing is untouched): odd beats punch in on the look point (a size change, ~1.55x; only from ≥ 3.2 m,
 * closer they orbit too), even beats orbit ~28° around it at the same distance (a real angle change, never
 * a few-pixel snap). u = 0..1 in the beat.
 */
export function beatView(cam: CamState, k: number, u: number): CamState {
  if (!k) return cam;
  // a camera already close to its subject (< 3.2 m) would punch into a giant head: orbit the other way instead
  const near = cam.pos.distanceTo(cam.look) < 3.2;
  if (k % 2 && !near) return { ...cam, fov: cam.fov * (0.64 - 0.035 * u) };
  const side = k % 2 ? -1 : k % 4 === 2 ? 1 : -1;
  const a = side * (28 + 3 * u) * (Math.PI / 180);
  const off = cam.pos.clone().sub(cam.look).applyAxisAngle(new THREE.Vector3(0, 1, 0), a);
  return { ...cam, pos: cam.look.clone().add(off), fov: cam.fov * 0.9 };
}

/** The camera spec for beat k: 0 = as written; odd = one size tighter, nudged; even = a new angle. */
export function beatCam(c: CameraSpec | undefined, k: number): CameraSpec | undefined {
  if (!k || !c || isExplicit(c)) return c;
  const base = c.angle ?? 20, sign = base >= 0 ? -1 : 1;
  if (k % 2) return { ...c, shot: TIGHTER[c.shot || 'medium'], angle: base + sign * 10, move: 'pushIn', amount: 0.6, dist: c.dist && c.dist * 0.72 };
  return { ...c, angle: base + sign * (k % 4 === 2 ? 38 : -30), height: (c.height ?? 6) + 6, move: k % 4 === 2 ? 'orbitR' : 'orbitL', amount: 0.5 };
}

const rot0Cache = new WeakMap<Shot3D, Record<string, number>>();

/** Actors' facing at t=0 (cached per shot). Cameras orient on this so a swap/turn never flips the camera. */
function rotAtStart(ctx: ShotCtx, cast: Record<string, CastMember>, now: Record<string, ActorState>, t: number): Record<string, number> {
  let r = rot0Cache.get(ctx.shot);
  if (r) return r;
  if (t === 0) r = Object.fromEntries(Object.entries(now).map(([k, v]) => [k, v.rot]));
  else {
    const setKey = SETS[ctx.shot.set] ? ctx.shot.set : 'suburb';
    const { actors } = resolveShotActors(ctx.shot, 0, ctx.words, setKey);
    r = {};
    actors.forEach(a => { if (!(a.id in r!)) r![a.id] = evalActor(a, cast[a.id] || cast.hero, 0, seedOf(a.id), undefined, ctx.start).rot; });
  }
  rot0Cache.set(ctx.shot, r);
  return r;
}

const flowCache = new WeakMap<Shot3D, FlowInfo>();

/**
 * Decide whether the cut from `prev` into `cur` should play as one continuous camera move.
 * Same set + same lighting + the framings barely differ on screen = a "jump cut" → flow.
 * Real angle changes stay cuts. `cut: "flow"` forces flow; any other explicit cut type forces a cut.
 */
export function flowInfo(prev: ShotCtx, cur: ShotCtx, cast: Record<string, CastMember>): FlowInfo {
  const cached = flowCache.get(cur.shot);
  if (cached) return cached;
  let info: FlowInfo;
  const sameSet = prev.shot.set === cur.shot.set && (prev.shot.time || '') === (cur.shot.time || '');
  if (!sameSet) info = { on: false, camBlend: 0, actorBlend: 0, reason: 'different set/lighting' };
  else if (cur.shot.cut && cur.shot.cut !== 'flow') info = { on: false, camBlend: 0, actorBlend: 0, reason: `explicit ${cur.shot.cut}` };
  else {
    const a = evalShot(prev, prev.dur, cast);
    const b = evalShot(cur, 0, cast);
    // measure on characters present in both shots (the subject the eye tracks across the cut)
    const common = b.states.filter(s => a.byId[s.spec.id]);
    const pts = common.length ? [...common.map(s => a.byId[s.spec.id].anchors.head), ...common.map(s => s.anchors.head)] : [];
    const d = framingDelta(a.cam, b.cam, pts);
    const jump = d.shift < 0.14 && d.angle < 20 && d.scale > 0.78 && d.scale < 1.28;
    const force = cur.shot.cut === 'flow';
    const on = force || jump;
    info = {
      on,
      camBlend: on ? THREE.MathUtils.clamp(0.5 + d.shift * 3 + d.angle / 40 + Math.abs(Math.log(d.scale)) * 1.2, 0.5, force ? 1.6 : 1.1) : 0,
      actorBlend: on ? 0.45 : 0,
      reason: force ? 'cut: flow' : jump ? 'near-identical framing (jump cut) → continuous move' : 'different view → cut',
      screenShift: +d.shift.toFixed(3), angle: +d.angle.toFixed(1), scale: +d.scale.toFixed(2),
    };
  }
  flowCache.set(cur.shot, info);
  return info;
}

/** Pull a camera that ended up behind a wall / under the floor / above the ceiling back inside the
 *  room along its sight line (keeps the direction, tightens the framing). Returns how far it moved. */
function keepInRoom(cam: CamState, room: { min: Vec3; max: Vec3 }, m = 0.15): number {
  const L = cam.look, P = cam.pos;
  let s = 1;
  for (let k = 0; k < 3; k++) {
    const l = L.getComponent(k), p = P.getComponent(k), d = p - l;
    const lo = room.min[k] + m, hi = room.max[k] - m;
    if (p < lo && d < 0) s = Math.min(s, (lo - l) / d);
    if (p > hi && d > 0) s = Math.min(s, (hi - l) / d);
  }
  if (s >= 1) return 0;
  s = Math.max(0.05, s);
  const moved = P.distanceTo(L) * (1 - s);
  cam.pos = L.clone().add(P.clone().sub(L).multiplyScalar(s));
  return moved;
}

export function evalShot(ctx: ShotCtx, t: number, cast: Record<string, CastMember>, prev?: ShotCtx): SceneState {
  const { shot, dur, words } = ctx;
  const def = SETS[shot.set] || SETS.suburb;
  const setKey = SETS[shot.set] ? shot.set : 'suburb';
  const palKey = shot.time || def.palette;
  const clock = ctx.start + t;
  const { actors, swap } = resolveShotActors(shot, t, words, setKey);
  const dup: Record<string, number> = {};
  const seeds = actors.map(a => { const n = dup[a.id] = (dup[a.id] ?? -1) + 1; return seedOf(a.id, n); });
  // pass 1: bodies without head look-at, so the camera can frame them
  const first: Record<string, ActorState> = {};
  actors.forEach((a, i) => { const k = first[a.id] ? `${a.id}#${i}` : a.id; first[k] = evalActor(a, cast[a.id] || cast.hero, t, seeds[i], undefined, clock); });
  const fallback: Vec3 = def.marks.center || Object.values(def.marks)[0] || [0, 0, 0];
  const camSpec = shot.camera && (shot.camera.moveAt || shot.camera.path) ? {
    ...shot.camera,
    moveAt: shot.camera.moveAt?.map(x => cue(x, words, 0)) as [number, number] | undefined,
    path: shot.camera.path?.map(k => ({ ...k, t: cue(k.t, words, 0) })),
  } : shot.camera;
  // sub-cuts: solve the camera for the current beat, on the beat's own clock
  const beats = beatsOf(ctx);
  const beat = beats.find(b => t < b.t1) || beats[beats.length - 1];
  let cam = isExplicit(camSpec)
    ? beatView(solveCamera(camSpec, t, ctx.dur, first, fallback), beat.k, (t - beat.t0) / Math.max(1e-6, beat.t1 - beat.t0))
    : solveCamera(beatCam(camSpec, beat.k), t - beat.t0, beat.t1 - beat.t0, first, fallback, rotAtStart(ctx, cast, first, t));
  const camOut = def.room ? keepInRoom(cam, def.room) : 0;
  if (shot.fx?.shake) cam = shake(cam, t, 0.03 * shot.fx.shake, 18, 4);
  // continuity with the previous shot (same set, near-identical framing): one flowing move
  const flow = prev ? flowInfo(prev, ctx, cast) : undefined;
  let prevEnd: SceneState | undefined;
  if (flow?.on && (t < flow.camBlend || t < flow.actorBlend)) prevEnd = evalShot(prev!, prev!.dur, cast);
  if (flow?.on && prevEnd && t < flow.camBlend) cam = orbitBlend(prevEnd.cam, cam, ease(t / flow.camBlend));
  // pass 2: with look-at targets (other actors' heads, points, or the camera)
  let states = actors.map((a, i) =>
    evalActor(a, cast[a.id] || cast.hero, t, seeds[i], target =>
      target === 'camera' ? cam.pos : typeof target === 'string' ? first[target]?.anchors.head : new THREE.Vector3(...target), clock),
  );
  if (flow?.on && prevEnd && t < flow.actorBlend) {
    const k = ease(t / flow.actorBlend);
    states = states.map(s => (prevEnd!.byId[s.spec.id] ? blendStates(prevEnd!.byId[s.spec.id], s, k) : s));
  }
  const byId: Record<string, ActorState> = {};
  states.forEach(s => { if (!byId[s.spec.id]) byId[s.spec.id] = s; });
  const frozen = shot.fx?.freeze !== undefined && shot.fx.freeze !== false && t >= (typeof shot.fx.freeze === 'number' ? shot.fx.freeze : 0);
  const props = (shot.props || []).map(p => {
    let pos = place(p.pos, setKey);
    if (p.follow) {
      // ride along under an actor (e.g. a skateboard), optionally switching actor at given times
      const keys = typeof p.follow === 'string' ? [{ t: 0, id: p.follow }] : p.follow.map(k => ({ ...k, t: cue(k.t as number | string, words, 0) }));
      const cur = [...keys].reverse().find(k => t >= k.t) || keys[0];
      const st = byId[cur.id];
      if (st) pos = [st.pos[0], st.pos[1] - 0.1, st.pos[2]];
    }
    const ignite = (p as { ignite?: number | string }).ignite;
    // prop paths take word cues too ("@stops-0.2"), so moving props stay on the narration after re-voicing
    const path = p.follow || !p.path ? undefined : p.path.map(k => ({ ...k, t: cue(k.t as number | string, words, 0) }));
    return { ...p, pos, path, ...(ignite !== undefined ? { ignite: cue(ignite, words, 0) } : {}) } as PropSpec;
  });
  return { setKey, def, palKey, actors, states, byId, cam, swap, frozen, props, flow, camOut, beat: beat.k };
}
