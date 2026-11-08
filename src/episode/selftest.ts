// Engine self-tests: tiny canned scenes that check each effect keeps its promise. They run in the
// same code path as rendering (evalShot), so a broken effect fails here before any video uses it.
//   node tools/qa.cjs selftest      (also: npm test)
import * as THREE from 'three';
import { at, evalActor, withReach } from '../engine/actor';
import { CAST } from '../cast';
import { resolvePose } from '../engine/rig';
import { SETS } from '../sets';
import { rng } from '../sets/kit';
import type { Episode, Shot3D, Timing } from '../types';
import { auditEpisode } from './audit';
import { evalShot, flowInfo, type ShotCtx } from './scene';

export type TestResult = { name: string; pass: boolean; detail: string };

const cast = CAST;
const M = SETS.void.marks;
const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[2] - b[2]);
const ctx = (shot: Shot3D, dur = 3, start = 0): ShotCtx => ({ shot, dur, start });

function test(name: string, fn: () => string | true): TestResult {
  try {
    const r = fn();
    return r === true ? { name, pass: true, detail: 'ok' } : { name, pass: false, detail: r };
  } catch (e) {
    return { name, pass: false, detail: 'threw: ' + String((e as Error).message || e) };
  }
}

export function runSelfTests(): TestResult[] {
  const out: TestResult[] = [];

  out.push(test('swap trades both positions', () => {
    const shot: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'hero', pos: 'left' }, { id: 'bestie', pos: 'right' }], fx: { swap: { t: 1, ids: ['hero', 'bestie'] } } };
    const before = evalShot(ctx(shot), 0.9, cast), after = evalShot(ctx(shot), 1.05, cast);
    if (dist(before.byId.hero.pos, M.left) > 0.01) return 'hero moved before the swap';
    if (dist(after.byId.hero.pos, M.right) > 0.01) return `hero is ${dist(after.byId.hero.pos, M.right).toFixed(2)} m from bestie's old spot after the swap`;
    if (dist(after.byId.bestie.pos, M.left) > 0.01) return `bestie is ${dist(after.byId.bestie.pos, M.left).toFixed(2)} m from hero's old spot after the swap`;
    return true;
  }));

  out.push(test('swap: ids[0] is the swapper (blinks) regardless of actor order', () => {
    const shot: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'bestie', pos: 'right' }, { id: 'hero', pos: 'left' }], fx: { swap: { t: 1.5, ids: ['hero', 'bestie'] } } };
    const s = evalShot(ctx(shot), 1.5 - 0.38, cast);
    if (s.byId.hero.face.eyes > 0.3) return `hero's eyes are ${s.byId.hero.face.eyes.toFixed(2)} open during the blink`;
    if (s.byId.bestie.face.eyes < 0.5) return 'bestie blinked instead of hero';
    const after = evalShot(ctx(shot), 1.6, cast);
    if (dist(after.byId.hero.pos, M.right) > 0.01 || dist(after.byId.bestie.pos, M.left) > 0.01) return 'positions not traded with reversed actor order';
    return true;
  }));

  out.push(test('swap with keepPaths follows the paths', () => {
    const shot: Shot3D = {
      set: 'void', vo: 'x',
      actors: [
        { id: 'hero', pos: [-3, 0, 0], path: [{ t: 0, pos: [-3, 0, 0] }, { t: 1, pos: [-1, 0, 0], gait: 'glide' }, { t: 1.02, pos: [2, 0, 0], gait: 'glide' }] },
        { id: 'dad', pos: [2, 0, 0], path: [{ t: 0, pos: [2, 0, 0] }, { t: 1, pos: [2, 0, 0] }, { t: 1.02, pos: [-1, 0, 0], gait: 'glide' }] },
      ],
      fx: { swap: { t: 1.01, ids: ['hero', 'dad'], keepPaths: true } },
    };
    const s = evalShot(ctx(shot), 1.5, cast);
    if (dist(s.byId.hero.pos, [2, 0, 0]) > 0.05) return 'hero not at the path end';
    if (dist(s.byId.dad.pos, [-1, 0, 0]) > 0.05) return 'dad not at the path end';
    return true;
  }));

  out.push(test('prop follow rides under its actor and switches actor', () => {
    const shot: Shot3D = {
      set: 'void', vo: 'x',
      actors: [{ id: 'hero', pos: [-3, 0.1, 0], path: [{ t: 0, pos: [-3, 0.1, 0] }, { t: 2, pos: [1, 0.1, 0], gait: 'glide' }] }, { id: 'dad', pos: [3, 0.1, 0] }],
      props: [{ type: 'skateboard', follow: [{ t: 0, id: 'hero' }, { t: 2.5, id: 'dad' }] }],
    };
    const a = evalShot(ctx(shot), 1, cast), b = evalShot(ctx(shot), 2.6, cast);
    if (dist(a.props[0].pos as number[], a.byId.hero.pos) > 0.01) return 'board not under hero';
    if (dist(b.props[0].pos as number[], b.byId.dad.pos) > 0.01) return 'board did not switch to dad';
    return true;
  }));

  out.push(test('strafe keeps facing while moving', () => {
    const shot: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'dad', pos: [0, 0, 0], rot: -90, strafe: true, path: [{ t: 0, pos: [0, 0, 0] }, { t: 2, pos: [4, 0, 0], gait: 'glide' }] }] };
    const s = evalShot(ctx(shot), 1, cast);
    return Math.abs(s.byId.dad.rot - -90) < 0.5 ? true : `rot ${s.byId.dad.rot.toFixed(1)} instead of -90`;
  }));

  out.push(test('a carried actor keeps its keyed pose while moving', () => {
    const shot: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'hero', pos: [0, 0, 0], pose: 'crouch', path: [{ t: 0, pos: [0, 0, 0] }, { t: 2, pos: [0, 4, 0], gait: 'carried' }] }] };
    const s = evalShot(ctx(shot), 1, cast).byId.hero;
    const want = resolvePose('crouch').hipY;
    return Math.abs(s.pose.hipY - want) < 0.05 && s.pos[1] > 0.5 && s.pos[1] < 3.5 ? true : `hipY ${s.pose.hipY.toFixed(2)} (want ${want}), y ${s.pos[1].toFixed(2)}`;
  }));

  out.push(test('talking fades in and out (no pose pop)', () => {
    const shot: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'hero', pos: 'center', talk: [[1, 2]] }] };
    let worst = 0;
    for (let f = 20; f < 70; f++) {
      const a = evalShot(ctx(shot), f / 30, cast).byId.hero, b = evalShot(ctx(shot), (f + 1) / 30, cast).byId.hero;
      for (const j of ['head', 'armR'] as const) for (let k = 0; k < 3; k++) worst = Math.max(worst, Math.abs(a.pose[j][k] - b.pose[j][k]));
    }
    return worst < 8 ? true : `pose changes ${worst.toFixed(1)}° in one frame around the talk boundaries`;
  }));

  out.push(test('idle motion is continuous across shot boundaries', () => {
    const spec = { id: 'hero', pos: 'center', pose: 'relaxed' } as const;
    const A: Shot3D = { set: 'void', vo: 'x', actors: [spec], camera: { pos: [0, 1.5, 5], look: [0, 1, 0] } };
    const B: Shot3D = { set: 'void', vo: 'y', actors: [spec], camera: { pos: [0.1, 1.5, 5], look: [0, 1, 0] } };
    const a = evalShot(ctx(A, 3, 10), 3 - 1 / 30, cast).byId.hero, b = evalShot(ctx(B, 3, 13), 0, cast, ctx(A, 3, 10)).byId.hero;
    let worst = 0;
    for (const j of ['spine', 'head', 'armL', 'armR'] as const) for (let k = 0; k < 3; k++) worst = Math.max(worst, Math.abs(a.pose[j][k] - b.pose[j][k]));
    return worst < 3 ? true : `pose jumps ${worst.toFixed(1)}° across the boundary`;
  }));

  out.push(test('near-identical framing in the same set flows (no snap)', () => {
    const A: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'hero', pos: 'center' }], camera: { pos: [0, 1.5, 5], look: [0, 1, 0] } };
    const B: Shot3D = { set: 'void', vo: 'y', actors: [{ id: 'hero', pos: 'center' }], camera: { pos: [0.3, 1.55, 4.8], look: [0.05, 1, 0] } };
    const ca = ctx(A, 3, 0), cb = ctx(B, 3, 3);
    const fl = flowInfo(ca, cb, cast);
    if (!fl.on) return `not detected as a jump cut (${fl.reason})`;
    const endA = evalShot(ca, 3, cast).cam, startB = evalShot(cb, 0, cast, ca).cam;
    const gap = endA.pos.distanceTo(startB.pos) + endA.look.distanceTo(startB.look);
    if (gap > 0.01) return `camera still jumps ${gap.toFixed(3)} m at the boundary`;
    let worst = 0;
    for (let f = 0; f < 40; f++) worst = Math.max(worst, evalShot(cb, f / 30, cast, ca).cam.pos.distanceTo(evalShot(cb, (f + 1) / 30, cast, ca).cam.pos));
    return worst < 0.05 ? true : `camera moves ${worst.toFixed(3)} m in one frame during the flow`;
  }));

  out.push(test('a real angle change stays a cut', () => {
    const A: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'hero', pos: 'center' }], camera: { pos: [0, 1.5, 5], look: [0, 1, 0] } };
    const B: Shot3D = { set: 'void', vo: 'y', actors: [{ id: 'hero', pos: 'center' }], camera: { pos: [4, 1.5, 2], look: [0, 1.4, 0] } };
    const fl = flowInfo(ctx(A, 3, 0), ctx(B, 3, 3), cast);
    return fl.on ? `flowed although the angle changed ${fl.angle}°` : true;
  }));

  out.push(test('IK puts the hand at the mouth', () => {
    const pose = withReach(resolvePose({ reachR: { to: 'mouth' } }));
    const s = evalActor({ id: 'hero', pos: [0, 0, 0], pose }, cast.hero, 0, 1);
    const target = at(s.bones.head, 0, -0.165, 0.212 + 0.075);
    const d = at(s.bones.handR).distanceTo(target);
    return d < 0.04 ? true : `wrist is ${d.toFixed(3)} m from the mouth target`;
  }));

  out.push(test('audit flags two characters on the same spot', () => {
    const ep: Episode = { slug: 't', title: 't', voice: { id: 'x' }, shots: [{ set: 'void', vo: 'x', actors: [{ id: 'hero', pos: 'center' }, { id: 'bestie', pos: 'center+0.1,0,0' }], camera: { shot: 'full', target: 'hero' } }] };
    const tm: Timing = { fps: 30, total: 2, shots: [{ start: 0, dur: 2, section: 0 }], sections: [] };
    const r = auditEpisode(ep, tm);
    return r.findings.some(f => f.check === 'overlap') ? true : 'overlap not reported';
  }));

  out.push(test('audit flags a forced jump cut', () => {
    const A: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'hero', pos: 'center' }], camera: { pos: [0, 1.5, 5], look: [0, 1, 0] } };
    const B: Shot3D = { set: 'void', vo: 'y', cut: 'cut', actors: [{ id: 'hero', pos: 'center' }], camera: { pos: [0.2, 1.5, 5], look: [0, 1, 0] } };
    const ep: Episode = { slug: 't', title: 't', voice: { id: 'x' }, shots: [A, B] };
    const tm: Timing = { fps: 30, total: 4, shots: [{ start: 0, dur: 2, section: 0 }, { start: 2, dur: 2, section: 0 }], sections: [] };
    return auditEpisode(ep, tm).findings.some(f => f.check === 'jumpcut') ? true : 'jump cut not reported';
  }));

  out.push(test('camera keeps its angle when its target turns (swap)', () => {
    const shot: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'hero', pos: 'left', rot: 90 }, { id: 'bestie', pos: 'right', rot: -90 }], fx: { swap: { t: 1, ids: ['hero', 'bestie'] } }, camera: { shot: 'wide', target: ['hero', 'bestie'], angle: -60 } };
    const a = evalShot(ctx(shot), 0.97, cast).cam, b = evalShot(ctx(shot), 1.03, cast).cam;
    const d = a.pos.distanceTo(b.pos);
    return d < 0.2 ? true : `camera jumps ${d.toFixed(2)} m at the swap`;
  }));

  out.push(test('characters ease into a run (no leg snap)', () => {
    const shot: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'hero', pos: [0, 0, 0], path: [{ t: 0.5, pos: [0, 0, 0] }, { t: 2.5, pos: [8, 0, 0], gait: 'run' }] }] };
    let worst = 0;
    for (let f = 10; f < 30; f++) {
      const a = evalShot(ctx(shot), f / 30, cast).byId.hero, b = evalShot(ctx(shot), (f + 1) / 30, cast).byId.hero;
      for (const j of ['legL', 'legR', 'armL', 'armR'] as const) for (let k = 0; k < 3; k++) worst = Math.max(worst, Math.abs(a.pose[j][k] - b.pose[j][k]));
    }
    return worst < 30 ? true : `a joint moves ${worst.toFixed(0)}° in one frame when the run starts`;
  }));

  out.push(test('set RNG stays in [0, 1) for negative seeds (no undefined colours)', () => {
    for (let seed = -40; seed < 40; seed++) {
      const r = rng(seed * 13 + 1);
      for (let k = 0; k < 5; k++) { const v = r(); if (!(v >= 0 && v < 1)) return `rng(${seed * 13 + 1}) gave ${v}`; }
    }
    return true;
  }));

  out.push(test('explicit camera move runs only inside moveAt (word cues)', () => {
    const shot: Shot3D = { set: 'void', vo: 'roll then blink', actors: [{ id: 'hero', pos: 'center' }], camera: { pos: [0, 1.5, 5], look: [0, 1, 0], to: { pos: [4, 1.5, 5], look: [4, 1, 0] }, moveAt: [0, '@blink'] } };
    const words = [['roll', 0.1], ['then', 0.5], ['blink', 1.0]] as [string, number][];
    const c = (t: number) => evalShot({ shot, dur: 3, start: 0, words }, t, cast).cam.pos.x;
    if (Math.abs(c(0)) > 0.01) return `starts at x=${c(0).toFixed(2)}`;
    if (Math.abs(c(1.0) - 4) > 0.01 || Math.abs(c(2.5) - 4) > 0.01) return `not settled at the cue: x=${c(1.0).toFixed(2)} / ${c(2.5).toFixed(2)}`;
    return c(0.5) > 0.5 && c(0.5) < 3.5 ? true : `mid-move x=${c(0.5).toFixed(2)}`;
  }));

  out.push(test('audit flags a character whose move happens off-screen', () => {
    const A: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'hero', pos: [-20, 0, 0], path: [{ t: 0, pos: [-20, 0, 0] }, { t: 3, pos: [0, 0, 0], gait: 'run' }] }], camera: { pos: [0, 1.5, 5], look: [0, 1, 0], fov: 30 } };
    const ep: Episode = { slug: 't', title: 't', voice: { id: 'x' }, shots: [A] };
    const tm: Timing = { fps: 30, total: 4, shots: [{ start: 0, dur: 4, section: 0 }], sections: [] };
    return auditEpisode(ep, tm).findings.some(f => f.msg.includes('moves off-screen')) ? true : 'off-screen move not reported';
  }));

  out.push(test('swapper blinks before the swap and keeps later face keys after it', () => {
    const shot: Shot3D = { set: 'void', vo: 'x', actors: [
      { id: 'hero', pos: 'left', face: 'smirk', faces: [{ t: 2, face: 'scared' }] },
      { id: 'bestie', pos: 'right' }], fx: { swap: { t: 1, ids: ['hero', 'bestie'] } } };
    const blink = evalShot(ctx(shot), 1 - 0.2 + 0.03, cast).byId.hero.face.eyes;
    if (blink > 0.3) return `no blink before the swap (eyes ${blink.toFixed(2)})`;
    const late = evalShot(ctx(shot), 2.6, cast).byId.hero.face;
    return late.brow > 0.5 ? true : `after the swap the face is not "scared" (brow ${late.brow.toFixed(2)})`;
  }));

  out.push(test('a camera placed behind a room wall is pulled back inside', () => {
    const shot: Shot3D = { set: 'cafeteria', vo: 'x', actors: [{ id: 'hero', pos: 'aisle+0,0,-3.2', rot: 180 }], camera: { pos: [0, 1.5, -7], look: [0, 1.2, -2.8], fov: 40 } };
    const sc = evalShot(ctx(shot), 0.1, cast);
    const room = SETS.cafeteria.room!;
    if (sc.cam.pos.z < room.min[2]) return `camera still behind the back wall (z=${sc.cam.pos.z.toFixed(2)})`;
    return sc.camOut > 0 ? true : 'pull-in not reported';
  }));

  out.push(test('characters settle out of a run (no frozen mid-air stride)', () => {
    const shot: Shot3D = { set: 'void', vo: 'x', actors: [{ id: 'hero', pos: [8, 0, 0], path: [{ t: 0, pos: [8, 0, 0] }, { t: 2, pos: [0, 0, 0], gait: 'run' }] }] };
    let worst = 0;
    for (const t of [1.97, 2.0, 2.03, 2.1]) {
      const st = evalShot(ctx(shot), t, cast).byId.hero;
      const foot = Math.min(at(st.bones.footL).y, at(st.bones.footR).y) - 0.045 * st.scale;
      worst = Math.max(worst, foot - st.pos[1]);
    }
    return worst < 0.15 ? true : `feet ${worst.toFixed(2)} m off the floor as the run stops`;
  }));

  void THREE;
  return out;
}
