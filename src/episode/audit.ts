// Pre-render scene audit: walks every frame of every 3D shot through evalShot (the same code the
// renderer uses) and checks numbers, not pictures. Run: node tools/qa.cjs audit <slug>
import * as THREE from 'three';
import { at, type ActorState } from '../engine/actor';
import { project, type CamState } from '../engine/cam';
import { POSES } from '../engine/rig';
import type { CastMember, Episode, Pose, Shot3D, Timing } from '../types';
import { castOf } from './resolve';
import { cue } from './cue';
import { beatsOf, evalShot, flowInfo, framingDelta, type ShotCtx } from './scene';
import type { CameraSpec, Vec3 } from '../types';
import { clipsOf, propSolids, setSolids } from './collide';
import { SFX_VISUAL } from './sfxVisual';
import { SETS } from '../sets';

export type Finding = { sev: 'error' | 'warn'; shot: number; id?: string; t?: number; check: string; msg: string };
export type AuditEvent = { shot: number; id?: string; t: number; kind: 'swap' | 'jump' | 'flow' | 'cut' | 'clip'; what: string };
export type AuditReport = { findings: Finding[]; events: AuditEvent[]; flows: { shot: number; on: boolean; reason: string; shift?: number; angle?: number; scale?: number }[]; frames: number };

const W = 1920, H = 1080;
// running/sprinting has a flight phase where both feet are off the ground
const AIRBORNE = (s: ActorState) => s.pose.hipY > 0.08 || Math.abs(s.pose.body[0]) > 20 || (s.moving && s.speed > 2.5) || s.spec.gait === 'float' || (s.spec.path || []).some(p => p.gait === 'float');
const JOINTS = ['spine', 'head', 'armL', 'armR', 'legL', 'legR'] as const;

function poseDelta(a: ActorState, b: ActorState) {
  let m = 0;
  for (const j of JOINTS) {
    const pa = a.pose[j] as number[], pb = b.pose[j] as number[];
    for (let k = 0; k < Math.min(pa.length, pb.length); k++) m = Math.max(m, Math.abs(pa[k] - pb[k]));
  }
  return m;
}

const inFrame = (p: { x: number; y: number; visible: boolean }, m = 0.02) => p.visible && p.x > W * m && p.x < W * (1 - m) && p.y > H * m && p.y < H * (1 - m);

function cueStrings(shot: Shot3D) {
  const out: string[] = [];
  const add = (v: unknown) => { if (typeof v === 'string' && v.startsWith('@')) out.push(v); };
  add(shot.fx?.swap?.t);
  (shot.actors || []).forEach(a => (a.path || []).forEach(w => add(w.t)));
  (shot.overlays || []).forEach(o => { const x = o as { at?: unknown; until?: unknown; switchAt?: unknown }; add(x.at); add(x.until); add(x.switchAt); });
  (shot.sfx || []).forEach(c => add(c.t));
  (shot.actors || []).forEach(a => { (a.poses || []).forEach(k => add(k.t)); (a.faces || []).forEach(k => add(k.t)); });
  (shot.camera?.moveAt || []).forEach(add);
  (shot.camera?.path || []).forEach(k => add(k.t));
  (shot.props || []).forEach(p => { add((p as { ignite?: unknown }).ignite); (p.path || []).forEach(k => add(k.t)); });
  (shot.props || []).forEach(p => { const f = (p as { follow?: unknown }).follow; if (Array.isArray(f)) f.forEach(k => add((k as { t?: unknown }).t)); });
  return out;
}

export function auditEpisode(ep: Episode, timing: Timing): AuditReport {
  const fps = timing.fps || 30;
  const cast: Record<string, CastMember> = castOf(ep);
  const findings: Finding[] = [];
  const events: AuditEvent[] = [];
  const flows: AuditReport['flows'] = [];
  const seen = new Set<string>();
  const add = (f: Finding, key?: string) => {
    const k = key ?? `${f.shot}|${f.check}|${f.msg}`;
    if (seen.has(k)) return;
    seen.add(k);
    findings.push(f);
  };
  let frames = 0;
  const ctxOf = (i: number): ShotCtx => {
    const tm = timing.shots[i];
    const dur = Math.max(1, Math.round((tm.start + tm.dur) * fps) - Math.round(tm.start * fps)) / fps;
    return { shot: ep.shots[i] as Shot3D, dur, start: tm.start, words: tm.words };
  };

  const checkCues = (cues: string[], words: [string, number][], i: number, sid?: string) => {
    for (const c of cues) {
      const m = /^@([\p{L}\p{N}']+)(?:#(\d+))?/iu.exec(c);
      const hits = m ? words.filter(([w]) => w === m[1].toLowerCase()).length : 0;
      if (!m || hits < (m[2] ? parseInt(m[2], 10) : 1)) add({ sev: 'error', shot: i, id: sid, check: 'cue', msg: `word cue "${c}" not found in this shot's narration` });
    }
  };
  const deepCues = (v: unknown, out: string[] = []): string[] => {
    if (typeof v === 'string' && /^@[\w']/.test(v)) out.push(v);
    else if (Array.isArray(v)) v.forEach(x => deepCues(x, out));
    else if (v && typeof v === 'object') Object.values(v).forEach(x => deepCues(x, out));
    return out;
  };

  // every frame must belong to a shot (the first shot covers any lead-in before it)
  timing.shots.forEach((tm, i) => {
    const prevEnd = i > 0 ? Math.round((timing.shots[i - 1].start + timing.shots[i - 1].dur) * fps) : 0;
    const gap = Math.round(tm.start * fps) - prevEnd;
    if (i > 0 && gap > 0) add({ sev: 'error', shot: i, id: ep.shots[i]?.id, check: 'timing', msg: `${gap} empty frame(s) before this shot (shot ${i - 1} ends at frame ${prevEnd}) — the video shows black there` });
  });

  ep.shots.forEach((shot, i) => {
    if (shot.kind === 'card') {
      checkCues(deepCues(shot), timing.shots[i]?.words || [], i, shot.id);
      return;
    }
    const s3 = shot as Shot3D;
    const ctx = ctxOf(i);
    const sid = s3.id;
    const prevShot = ep.shots[i - 1];
    const prev = prevShot && prevShot.kind !== 'card' ? ctxOf(i - 1) : undefined;
    const words = ctx.words || [];

    // --- word cues must resolve -----------------------------------------------------------
    checkCues(cueStrings(s3), words, i, sid);

    // --- flow / cut decision at the shot boundary ------------------------------------------
    if (prev) {
      const fl = flowInfo(prev, ctx, cast);
      flows.push({ shot: i, on: fl.on, reason: fl.reason, shift: fl.screenShift, angle: fl.angle, scale: fl.scale });
      events.push({ shot: i, id: sid, t: 0, kind: fl.on ? 'flow' : 'cut', what: fl.reason });
      if (!fl.on && prev.shot.set === s3.set && (prev.shot.time || '') === (s3.time || '') && s3.cut === 'cut') {
        const a = evalShot(prev, prev.dur, cast), b = evalShot(ctx, 0, cast);
        const d = framingDelta(a.cam, b.cam, [...a.states, ...b.states].map(s => s.anchors.head));
        if (d.shift < 0.14 && d.angle < 20) add({ sev: 'error', shot: i, id: sid, check: 'jumpcut', msg: `forced cut but the framing barely changes (subject moves ${(d.shift * 100).toFixed(1)}% of the width, ${d.angle.toFixed(0)}°) — remove cut:"cut" so it flows, or change the angle ≥30°` });
      }
      if (fl.on) {
        // continuity: a character that continues through a flowing move must not change place
        const a = evalShot(prev, prev.dur, cast), b = evalShot(ctx, 0, cast);
        for (const s of b.states) {
          const p = a.byId[s.spec.id];
          if (!p || s.spec.ghost) continue;
          const d = Math.hypot(p.pos[0] - s.pos[0], p.pos[2] - s.pos[2]);
          if (d > 0.3) add({ sev: 'error', shot: i, id: sid, t: 0, check: 'continuity', msg: `${s.spec.id} jumps ${d.toFixed(2)} m between shot ${i - 1} and ${i} during a continuous camera move — start them where the previous shot left them, or change the camera angle so it cuts` });
          const dr = Math.abs(((s.rot - p.rot + 540) % 360) - 180);
          if (dr > 35) add({ sev: 'warn', shot: i, id: sid, t: 0, check: 'continuity', msg: `${s.spec.id} turns ${dr.toFixed(0)}° across the continuous move (it will blend, but check it reads naturally)` });
        }
        // a flow blends one camera move across both shots: anything present in only one of them pops in or out mid-move
        const ids = (st: ActorState[]) => new Set(st.filter(s => !s.spec.ghost).map(s => s.spec.id));
        const ia = ids(a.states), ib = ids(b.states);
        const gone = [...ia].filter(x => !ib.has(x)), added = [...ib].filter(x => !ia.has(x));
        if (gone.length || added.length) add({ sev: 'warn', shot: i, id: sid, t: 0, check: 'continuity', msg: `flow from shot ${i - 1}, but the cast changes (${[...gone.map(x => `-${x}`), ...added.map(x => `+${x}`)].join(', ')}): they pop in/out during the continuous move — keep the same actors in both shots, or make it a real cut (new angle)` });
        const propKeys = (sh: Shot3D) => (sh.props || []).map(p => `${p.type}@${JSON.stringify(p.pos)}`);
        const pa = propKeys(prev.shot), pb = propKeys(s3);
        const pGone = pa.filter(x => !pb.includes(x)), pAdded = pb.filter(x => !pa.includes(x));
        if (pGone.length || pAdded.length) add({ sev: 'warn', shot: i, id: sid, t: 0, check: 'continuity', msg: `flow from shot ${i - 1}, but the props differ (${[...pGone.map(x => `-${x.split('@')[0]}`), ...pAdded.map(x => `+${x.split('@')[0]}`)].join(', ')}): they pop in/out during the continuous move — copy the same props into both shots` });
      }
    }

    // --- a partial inline pose after a seated/kneeling one: its missing fields fall back to standing -----
    for (const a of s3.actors || []) {
      const seq = [a.pose, ...(a.poses || []).map(k => k.pose)];
      const low = (p: unknown) => ((typeof p === 'string' ? POSES[p] : (p as Pose | undefined))?.hipY ?? 0) < -0.3;
      const partial = (p: unknown) => !!p && typeof p === 'object' && (p as Pose).hipY === undefined && !(p as Pose).legL && !(p as Pose).legR;
      const firstLow = seq.findIndex(low);
      if (firstLow >= 0 && seq.slice(firstLow + 1).some(partial))
        add({ sev: 'warn', shot: i, id: sid, check: 'pose', msg: `${a.id} sits/kneels, then gets a partial inline pose (no hipY/legs): the missing fields reset to standing, so they stand up — give the full seated pose plus the change` });
    }

    // --- effects should be tied to the narration, or a re-voice silently de-syncs them ---------
    if (s3.fx?.swap && typeof s3.fx.swap.t === 'number' && s3.vo)
      add({ sev: 'warn', shot: i, id: sid, check: 'cue', msg: `swap time is a fixed ${s3.fx.swap.t}s — use a word cue ("@blink+0.75") so it stays on the spoken word after re-voicing${s3.fx.swap.keepPaths ? '; cue the path waypoints too' : ''}` });

    // --- timing sanity -----------------------------------------------------------------------
    const sw0 = evalShot(ctx, 0, cast).swap;
    if (s3.fx?.swap) {
      if (!sw0) add({ sev: 'error', shot: i, id: sid, check: 'swap', msg: `swap ids ${s3.fx.swap.ids.join('/')} are not both in this shot` });
      else if (sw0.t < 0.45 || sw0.t > ctx.dur - 0.25) add({ sev: 'error', shot: i, id: sid, check: 'swap', msg: `swap at ${sw0.t.toFixed(2)} s is too close to the shot edge (shot is ${ctx.dur.toFixed(2)} s; the blink needs 0.45 s before and the result ≥0.25 s after)` });
    }

    // --- frame-by-frame -----------------------------------------------------------------------
    const n = Math.max(1, Math.round(ctx.dur * fps));
    let prevStates: Record<string, ActorState> | null = null;
    let prevCam: CamState | null = null;
    let prevBeat = 0;
    // the beat's own targets: a CLOSE sub-cut of a group shot frames only its first actor, on purpose
    const targetsOf = (spec: CameraSpec | undefined) => {
      const tg = spec?.target;
      return typeof tg === 'string' ? [tg] : Array.isArray(tg) && typeof tg[0] === 'string' ? (tg as string[]) : [];
    };
    // per actor: seconds spent moving while off-screen, before their last on-screen frame (exits are fine)
    const hidden: Record<string, { moving: number; lastSeen: number; from: number; to: number }[]> = {};
    // clip: body parts inside furniture / props (worst depth per actor+part over the shot, every 2nd frame)
    const furniture = setSolids(SETS[s3.set] ? s3.set : 'suburb', s3.variant ?? 0);
    const clipWorst = new Map<string, { id: string; part: string; depth: number; t: number; what: string; size: string; at: Vec3 }>();
    for (let f = 0; f < n; f++) {
      const t = f / fps;
      const sc = evalShot(ctx, t, cast, prev);
      frames++;
      const live = sc.states.filter(s => !s.spec.ghost);
      // swapper visible while blinking
      if (sc.swap && f === Math.round(Math.max(0, sc.swap.t - 0.3) * fps)) {
        const sw = sc.byId[sc.swap.ids[0]];
        if (sw && !inFrame(project(sw.anchors.head, sc.cam, W, H), 0.0))
          add({ sev: 'warn', shot: i, id: sid, t, check: 'framing', msg: `the swapper ${sc.swap.ids[0]} is off-screen during the blink (t=${t.toFixed(2)} s) — the viewer can't see who swaps; frame them, or accept if the shot is meant to reveal them` }, `${i}|swapperoff`);
      }
      // overlap: two bodies in the same space
      for (let a = 0; a < live.length; a++)
        for (let b = a + 1; b < live.length; b++) {
          const A = live[a], B = live[b];
          const d = Math.hypot(A.pos[0] - B.pos[0], A.pos[2] - B.pos[2]);
          const near = d < 0.42 * Math.min(A.scale, B.scale) + 0.05 && Math.abs(A.pos[1] - B.pos[1]) < 0.6;
          if (near && !(A.spec as { contact?: boolean }).contact && !(B.spec as { contact?: boolean }).contact)
            add({ sev: 'error', shot: i, id: sid, t, check: 'overlap', msg: `${A.spec.id} and ${B.spec.id} occupy the same spot (${d.toFixed(2)} m apart) from t=${t.toFixed(2)} s` }, `${i}|overlap|${A.spec.id}|${B.spec.id}`);
        }
      // swap contract
      if (sc.swap && t >= sc.swap.t + 0.02 && t < sc.swap.t + 0.1 && !sc.swap.keepPaths) {
        const [p0, p1] = sc.swap.pre;
        const s0 = sc.byId[sc.swap.ids[0]], s1 = sc.byId[sc.swap.ids[1]];
        const d0 = s0 ? Math.hypot(s0.pos[0] - (p1.pos as number[])[0], s0.pos[2] - (p1.pos as number[])[2]) : 99;
        const d1 = s1 ? Math.hypot(s1.pos[0] - (p0.pos as number[])[0], s1.pos[2] - (p0.pos as number[])[2]) : 99;
        if (d0 > 0.05 || d1 > 0.05) add({ sev: 'error', shot: i, id: sid, t, check: 'swap', msg: `swap did not trade places: ${sc.swap.ids[0]} is ${d0.toFixed(2)} m from ${sc.swap.ids[1]}'s old spot, ${sc.swap.ids[1]} is ${d1.toFixed(2)} m from ${sc.swap.ids[0]}'s` }, `${i}|swapcontract`);
      }
      if (sc.swap && f === Math.round(sc.swap.t * fps)) events.push({ shot: i, id: sid, t: sc.swap.t, kind: 'swap', what: `${sc.swap.ids[0]} ⇄ ${sc.swap.ids[1]}` });
      // camera behind a wall / outside the room (the engine pulls it in, but the framing is then tighter than written)
      if (sc.camOut > 0.05) add({ sev: 'warn', shot: i, id: sid, t, check: 'camera', msg: `camera was ${sc.camOut.toFixed(2)} m outside the room walls at t=${t.toFixed(2)} s; it is pulled inside along its sight line, so the framing is tighter than specified — check it, or move the camera` }, `${i}|camout`);
      // camera inside a character
      for (const s of live) {
        if (sc.cam.pos.distanceTo(s.anchors.head) < 0.42 * s.scale) add({ sev: 'error', shot: i, id: sid, t, check: 'camera', msg: `camera is inside ${s.spec.id}'s head at t=${t.toFixed(2)} s` }, `${i}|camin|${s.spec.id}`);
      }
      // framing of camera targets
      for (const id of targetsOf(sc.beatSpec)) {
        const s = sc.byId[id];
        if (!s) continue;
        const head = project(s.anchors.head, sc.cam, W, H), feet = project(s.anchors.feet, sc.cam, W, H);
        if (!head.visible) add({ sev: 'error', shot: i, id: sid, t, check: 'framing', msg: `camera target ${id} is behind the camera at t=${t.toFixed(2)} s` }, `${i}|behind|${id}`);
        else if (!inFrame(head, 0.0)) add({ sev: 'error', shot: i, id: sid, t, check: 'framing', msg: `camera target ${id}'s head leaves the frame at t=${t.toFixed(2)} s` }, `${i}|headout|${id}`);
        const shotSize = sc.beatSpec?.shot || 'medium';
        // a close that doesn't show the face (bowed head, back or profile to the lens) reads as a black disc
        if (['close', 'xclose'].includes(shotSize) && head.visible && id === targetsOf(sc.beatSpec)[0]) {
          const face = new THREE.Vector3(0, 0, 1).transformDirection(s.bones.head);
          if (face.dot(sc.cam.pos.clone().sub(s.anchors.head).normalize()) < 0.5) add({ sev: 'warn', shot: i, id: sid, t, check: 'framing', msg: `${shotSize} on ${id} but the face is turned away from the lens at t=${t.toFixed(2)} s (sub-cut ${sc.beat}) (bowed head / back / profile): it reads as a black disc — change the angle, lift the head or widen the shot` }, `${i}|faceaway|${id}`);
        }
        // 9:16 safety: the subject's head must sit inside the centre column a vertical cut keeps (608 of 1920 px)
        const band = (H * 9) / 16 / 2;
        if (head.visible && inFrame(head, 0.0) && Math.abs(head.x - W / 2) > band) add({ sev: 'warn', shot: i, id: sid, t, check: 'vertical', msg: `${id}'s head is outside the 9:16 centre column at t=${t.toFixed(2)} s (x=${head.x.toFixed(0)} px) — a vertical cut loses them` }, `${i}|vert|${id}`);
        if (['full', 'wide'].includes(shotSize) && head.visible && !inFrame(feet, 0.0)) add({ sev: 'warn', shot: i, id: sid, t, check: 'framing', msg: `${shotSize} shot but ${id}'s feet are out of frame at t=${t.toFixed(2)} s` }, `${i}|feetout|${id}`);
        const px = Math.abs(feet.y - head.y) + 0.24 * (H / 2);
        if (shotSize === 'wide' && head.visible && feet.visible && Math.abs(feet.y - head.y) < 60) add({ sev: 'warn', shot: i, id: sid, t, check: 'framing', msg: `${id} is tiny in frame (${Math.abs(feet.y - head.y).toFixed(0)} px tall)` }, `${i}|tiny|${id}`);
        void px;
      }
      // speakers should be on screen while they talk
      for (const s of live) {
        const talking = (s.spec.talk || []).some(([a, b]) => t >= a && t <= b);
        if (talking && !inFrame(project(s.anchors.head, sc.cam, W, H), 0.0)) add({ sev: 'warn', shot: i, id: sid, t, check: 'framing', msg: `${s.spec.id} talks off-screen at t=${t.toFixed(2)} s` }, `${i}|talkoff|${s.spec.id}`);
      }
      // grounding
      for (const s of live) {
        const foot = Math.min(at(s.bones.footL).y, at(s.bones.footR).y) - 0.045 * s.scale;
        const ground = s.pos[1];
        if (foot < ground - 0.07) add({ sev: 'warn', shot: i, id: sid, t, check: 'grounding', msg: `${s.spec.id}'s feet sink ${(ground - foot).toFixed(2)} m into the floor at t=${t.toFixed(2)} s` }, `${i}|sink|${s.spec.id}`);
        if (foot > ground + 0.22 && !AIRBORNE(s)) add({ sev: 'warn', shot: i, id: sid, t, check: 'grounding', msg: `${s.spec.id} floats ${(foot - ground).toFixed(2)} m above the floor at t=${t.toFixed(2)} s` }, `${i}|float|${s.spec.id}`);
      }
      // frame-to-frame snaps (inside the shot)
      if (prevStates && prevCam && f > 1) {
        // position step relative to the framing distance, and turn rate of the view direction
        const dist = Math.max(0.5, prevCam.pos.distanceTo(prevCam.look));
        const jump = sc.cam.pos.distanceTo(prevCam.pos) / dist;
        const turn = (sc.cam.look.clone().sub(sc.cam.pos).normalize().angleTo(prevCam.look.clone().sub(prevCam.pos).normalize()) * 180) / Math.PI;
        const allowed = sc.beat !== prevBeat || s3.camera?.move === 'shake' || s3.camera?.move === 'crashIn' || (s3.fx?.shake ?? 0) > 0;
        if ((jump > 0.12 || turn > 4.5) && !allowed) add({ sev: 'warn', shot: i, id: sid, t, check: 'snap', msg: `camera ${jump > 0.12 ? `jumps ${(jump * 100).toFixed(0)}% of its distance` : `turns ${turn.toFixed(1)}°`} in one frame at t=${t.toFixed(2)} s` }, `${i}|camsnap`);
        for (const s of live) {
          const p = prevStates[s.spec.id];
          if (!p) continue;
          const moved = Math.hypot(s.pos[0] - p.pos[0], s.pos[2] - p.pos[2]);
          const nearSwap = sc.swap && Math.abs(t - sc.swap.t) < 0.06;
          if (moved > 0.5 && !nearSwap) {
            add({ sev: 'warn', shot: i, id: sid, t, check: 'teleport', msg: `${s.spec.id} moves ${moved.toFixed(2)} m in one frame at t=${t.toFixed(2)} s (fine for a path jump, check it in the review frames)` }, `${i}|tele|${s.spec.id}|${f}`);
            events.push({ shot: i, id: sid, t, kind: 'jump', what: `${s.spec.id} moves ${moved.toFixed(1)} m` });
          }
          const pd = poseDelta(p, s);
          if (pd > 38 && !nearSwap) add({ sev: 'warn', shot: i, id: sid, t, check: 'snap', msg: `${s.spec.id}'s pose snaps ${pd.toFixed(0)}° in one frame at t=${t.toFixed(2)} s` }, `${i}|posesnap|${s.spec.id}`);
        }
      }
      for (const s of live) {
        const seen = inFrame(project(s.anchors.head, sc.cam, W, H), 0.0) || inFrame(project(s.anchors.hips, sc.cam, W, H), 0.0);
        const p = prevStates?.[s.spec.id];
        const moving = !!p && Math.hypot(s.pos[0] - p.pos[0], s.pos[2] - p.pos[2]) > 0.6 / fps;
        const h = (hidden[s.spec.id] ||= [{ moving: 0, lastSeen: -1, from: -1, to: -1 }])[0];
        if (seen) h.lastSeen = t;
        else if (moving) { h.moving += 1 / fps; if (h.from < 0) h.from = t; h.to = t; }
        if (seen && h.from >= 0 && h.moving > 1.0)
          add({ sev: 'warn', shot: i, id: sid, t: h.from, check: 'framing', msg: `${s.spec.id} moves off-screen for ${h.moving.toFixed(1)} s (t=${h.from.toFixed(2)}–${h.to.toFixed(2)}) before appearing — the viewer misses the action; pan/track the camera (camera.to + moveAt) or start them in frame` }, `${i}|hiddenmove|${s.spec.id}`);
      }
      prevStates = {};
      for (const s of live) prevStates[s.spec.id] = s;
      prevCam = sc.cam;
      prevBeat = sc.beat;
      if (f % 2 === 0) {
        const solids = [...furniture, ...propSolids(sc.props, t)];
        for (const st of live)
          for (const c of clipsOf(st, solids)) {
            const k = `${st.spec.id}|${c.part}`, w = clipWorst.get(k);
            if (!w || c.depth > w.depth) clipWorst.set(k, { id: st.spec.id, part: c.part, depth: c.depth, t, what: c.solid.what, size: c.solid.size, at: c.solid.at });
          }
      }
    }
    // one finding per actor+part. Head/chest fill the frame, so 2 cm past contact is already visible (error);
    // a limb is an error from 6 cm; shallower ones are warnings to check in the review frames
    // (under 3 cm a limb clip doesn't show on screen, under 2 cm a head/chest one: not reported)
    const shown = [...clipWorst.values()].filter(w => w.depth >= (/^(head|chest)/.test(w.part) ? 0.02 : 0.03));
    shown.forEach(w => add({
      sev: w.depth > (/^(head|chest)/.test(w.part) ? 0.02 : 0.06) ? 'error' : 'warn', shot: i, id: sid, t: w.t, check: 'clip',
      msg: `${w.id}'s ${w.part} goes ${(w.depth * 100).toFixed(0)} cm into ${w.what} (${w.size} m at [${w.at.join(', ')}]) at t=${w.t.toFixed(2)} s — move the actor/prop, change the pose, or seat them properly`,
    }, `${i}|clip|${w.id}|${w.part}`));
    // one review event per actor (their deepest clip), so review.mjs renders the moment for the reviewer
    const perActor = new Map<string, (typeof shown)[number]>();
    shown.forEach(w => { const b2 = perActor.get(w.id); if (!b2 || w.depth > b2.depth) perActor.set(w.id, w); });
    perActor.forEach(w => events.push({ shot: i, id: sid, t: w.t, kind: 'clip', what: `${w.id}'s ${w.part} ${(w.depth * 100).toFixed(0)} cm into ${w.what}` }));
    // something should be visible in a shot that has characters
    const mid = evalShot(ctx, ctx.dur * 0.6, cast, prev);
    if (mid.states.length && !mid.states.some(s => inFrame(project(s.anchors.head, mid.cam, W, H), 0.0)))
      add({ sev: 'warn', shot: i, id: sid, check: 'framing', msg: 'no character is visible at mid-shot' });
  });
  // shorts the user cuts by hand from the 16:9: at least 4 per long episode, each 60–95 s of whole shots
  const ids = ep.shots.map(s => s.id);
  const long = timing.total > 240;
  // house rule (user, 2026-11-09): every long episode runs at least 10:00
  if (long && !timing.draft && timing.total < 600) add({ sev: 'warn', shot: 0, check: 'length', msg: `episode runs ${Math.floor(timing.total / 60)}:${String(Math.round(timing.total % 60)).padStart(2, '0')} — the house minimum is 10:00 (add narration: an extra problem, rule test or world-bigger scene)` });
  if (long && timing.draft && timing.total < 600) add({ sev: 'warn', shot: 0, check: 'length', msg: `draft estimate ${Math.floor(timing.total / 60)}:${String(Math.round(timing.total % 60)).padStart(2, '0')} — the house minimum is 10:00; write more before buying voice` });
  // visual beats (house rule 2026-11-09, Vitinho reference): something changes on screen at least every ~2 s —
  // a cut or sub-cut, an overlay, a sound, a face or pose change, a beat effect. New episodes only (no `clips`);
  // deliberate holds (coverage 'calm' / 'off': the dilemma, a frozen tableau) are exempt.
  if (long && !ep.clips?.length) {
    const ev: number[] = [];
    const at = (x: unknown, w: typeof timing.shots[number]['words'], base: number) => base + cue(x as number | string | undefined, w, 0);
    ep.shots.forEach((sh, i) => {
      const tm = timing.shots[i], w = tm.words;
      ev.push(tm.start);
      if (sh.kind !== 'card') beatsOf(ctxOf(i)).forEach(b => { if (b.t0 > 0) ev.push(tm.start + b.t0); });
      (sh.overlays || []).forEach(o => ev.push(at((o as { at?: unknown }).at, w, tm.start)));
      (sh.sfx || []).forEach(c => ev.push(at(c.t, w, tm.start)));
      if (sh.kind === 'card') return;
      const s3 = sh as Shot3D;
      (s3.actors || []).forEach(a => {
        (a.faces || []).forEach(k => ev.push(at(k.t, w, tm.start)));
        (a.poses || []).forEach(k => ev.push(at(k.t, w, tm.start)));
        (a.path || []).forEach(k => ev.push(at(k.t, w, tm.start)));
      });
      if (s3.fx?.swap) ev.push(at(s3.fx.swap.t, w, tm.start));
      if (s3.fx?.burst) ev.push(at(s3.fx.burst.at, w, tm.start));
      if (s3.fx?.focus) ev.push(at(s3.fx.focus.at, w, tm.start));
    });
    ev.sort((a, b) => a - b);
    const shotAt = (t: number) => { let k = 0; timing.shots.forEach((x, i) => { if (x.start <= t + 1e-6) k = i; }); return k; };
    const flagged = new Set<number>();
    for (let k = 1; k < ev.length; k++) {
      const gap = ev[k] - ev[k - 1];
      if (gap <= 2.5) continue;
      const i = shotAt(ev[k - 1] + 0.01), sh = ep.shots[i] as Shot3D;
      if (flagged.has(i) || (ep.shots[i].kind !== 'card' && (sh.coverage === 'calm' || sh.coverage === 'off'))) continue;
      flagged.add(i);
      add({ sev: 'warn', shot: i, id: sh.id, t: ev[k - 1] - timing.shots[i].start, check: 'beat', msg: `${gap.toFixed(1)} s with nothing new on screen (from ${(ev[k - 1] - timing.shots[i].start).toFixed(1)} s into the shot) — add a beat: an emote, a highlight circle, a flying object, a word pop, a face/pose change, a burst or a sub-cut (COLA "Batida visual")` });
    }
  }

  // sound → picture (house rule 2026-11-09): every scripted sound has a visual event within 0.25 s — an automatic
  // one (sfxVisual.ts), a cut/sub-cut, an overlay, a face/pose/path key or an effect. New episodes only.
  if (!ep.clips?.length) ep.shots.forEach((sh, i) => {
    const tm = timing.shots[i], w = tm.words;
    const vis: number[] = [0];
    if (sh.kind !== 'card') beatsOf(ctxOf(i)).forEach(b => vis.push(b.t0));
    (sh.overlays || []).forEach(o => vis.push(cue((o as { at?: number | string }).at, w, 0)));
    if (sh.kind !== 'card') {
      const s3 = sh as Shot3D;
      (s3.actors || []).forEach(a => [...(a.faces || []), ...(a.poses || []), ...(a.path || [])].forEach(k => vis.push(cue(k.t as number | string, w, 0))));
      [s3.fx?.swap?.t, s3.fx?.burst?.at, s3.fx?.focus?.at].forEach(x => { if (x !== undefined) vis.push(cue(x as number | string, w, 0)); });
    }
    (sh.sfx || []).forEach(c => {
      if (SFX_VISUAL[c.name]) return;
      const tc = cue(c.t as number | string, w, 0);
      if (!vis.some(v => Math.abs(v - tc) <= 0.25))
        add({ sev: 'warn', shot: i, id: sh.id, t: tc, check: 'sync', msg: `sound "${c.name}" at ${tc.toFixed(2)} s has nothing visible on its frame — show it (a pose/face key, a prop moving, an emote, a cut) or pick a sound with an automatic visual (sfxVisual.ts)` }, `${i}|sync|${c.name}|${tc.toFixed(2)}`);
    });
  });

  // retention hook (user rule, 2026-11-09, new episodes only): the first 10 s need fast cutting, an early sound and a punchy move.
  // That the power shows by 0:08 needs a reader: COLA "Primeiros 10 s".
  if (long && ep.hookCheck !== false) {
    let cuts = 0, sfxEarly = false, punch = false;
    ep.shots.forEach((sh, i) => {
      const tm = timing.shots[i];
      if (!tm || tm.start >= 10) return;
      if (i > 0) cuts++;
      if (sh.kind !== 'card') {
        const s3 = sh as Shot3D;
        beatsOf(ctxOf(i)).forEach(b => { if (b.t0 > 0 && tm.start + b.t0 < 10) cuts++; });
        const mv = s3.camera?.move;
        if (mv === 'crashIn' || mv === 'shake' || ['smash', 'whip', 'zoom'].includes(s3.cut || '') || s3.fx?.freeze !== undefined || s3.fx?.speedLines || (s3.fx?.shake ?? 0) > 0) punch = true;
      }
      for (const c of sh.sfx || []) if (tm.start + cue(c.t as number | string, tm.words, 0) <= 2) sfxEarly = true;
    });
    if (cuts < 6) add({ sev: 'warn', shot: 0, check: 'hook', msg: `only ${cuts} cut(s) in the first 10 s — the house hook wants ≥ 6 (1–1.5 s shots: coverage 'fast', camera.beats, or shorter shots)` });
    if (!sfxEarly) add({ sev: 'warn', shot: 0, check: 'hook', msg: 'no scripted sound effect in the first 2 s — open on a strong SFX (ring, whoosh, impact) under the first line' });
    if (!punch) add({ sev: 'warn', shot: 0, check: 'hook', msg: "no punchy move in the first 10 s — use a crashIn, a smash/whip cut, a freeze or speed lines on the power's first use" });
  }
  // 9:16 safety for important 2D overlays on 3D shots: corner HUDs fall outside the centre column a vertical cut keeps
  ep.shots.forEach((sh, i) => {
    if (sh.kind === 'card') return;
    for (const o of sh.overlays || []) {
      const x = o as { type: string; corner?: string; pos?: string; safe?: boolean };
      const out = (x.type === 'stopwatch' && x.corner !== 'tc' && x.corner !== 'bc') || x.type === 'label' || (x.type === 'stat' && x.pos !== 'center') || (x.type === 'news' && !x.safe);
      if (out) add({ sev: 'warn', shot: i, id: sh.id, check: 'vertical', msg: `${x.type} overlay sits outside the 9:16 centre column — a vertical cut loses it (stopwatch corner "tc"/"bc", news safe:true, stat pos "center", or a "word" overlay)` }, `${i}|vov|${x.type}`);
    }
  });
  // the 4 vertical shorts (user rule, 2026-11-09; tools/shorts.mjs renders them). A shorts.json next to the
  // episode overrides `episode.shorts`; this audits the generator's list (tools/shorts.mjs plan checks either).
  // Episodes from before the rule (they carry `clips`) are not asked for shorts.
  if (long && !ep.clips?.length && (ep.shorts?.length ?? 0) !== 4) add({ sev: 'warn', shot: 0, check: 'shorts', msg: `${ep.shorts?.length ?? 0} short(s) planned — every episode gets 4 vertical ~60 s shorts (episode(shorts=[...]): the user's picks if they named moments, else the 4 strongest hooks)` });
  (ep.shorts || []).forEach((sh, k) => {
    const list = sh.shots || (() => { const a = ids.indexOf(sh.from || ''), b = ids.indexOf(sh.to || ''); return a < 0 || b < a ? [] : ids.slice(a, b + 1).filter(x => !(sh.drop || []).includes(x as string)); })();
    const at = list.map(x => ids.indexOf(x as string));
    if (!list.length || at.some(x => x < 0)) { add({ sev: 'error', shot: 0, check: 'shorts', msg: `short ${k + 1} "${sh.title}": shot ids not found or out of order` }); return; }
    const body = at.reduce((s, i) => s + timing.shots[i].dur, 0) - (sh.cutAt !== undefined ? timing.shots[at[at.length - 1]].dur - sh.cutAt : 0);
    const total = body + 1.95 + sh.cta.length / 14.5;
    if (total < 55 || total > 62) add({ sev: 'warn', shot: at[0], id: list[0], check: 'shorts', msg: `short ${k + 1} "${sh.title}" runs ~${total.toFixed(0)} s with its CTA — aim for 55–62 s (60 s rule)` });
    const heroIn = (i: number) => !!(ep.shots[i] as Shot3D).actors?.some(a => a.id === 'hero');
    const stage = sh.stage ? ids.indexOf(sh.stage) : [...at].reverse().find(heroIn);
    if (stage === undefined || stage < 0 || !heroIn(stage)) add({ sev: 'error', shot: at[0], id: list[0], check: 'shorts', msg: `short ${k + 1}: no shot with the hero to stage the 4th-wall break (set stage)` });
    const opener = (ep.shots[at[0]].vo || '').replace(/\[[^\]]*\]/g, '').trim();
    if (/^(e|mas|então|aí|depois|até|por isso|isso|esses?|essas?|aquilo|também)(?!\p{L})/iu.test(opener)) add({ sev: 'warn', shot: at[0], id: list[0], check: 'shorts', msg: `short ${k + 1} opens with "${opener.split(' ').slice(0, 3).join(' ')}…" — a short opens cold, with no connective that needs context` });
    if (!/canal/i.test(sh.cta)) add({ sev: 'warn', shot: at[0], id: list[0], check: 'shorts', msg: `short ${k + 1}: the hero's line never sends the viewer to the channel` });
  });
  return { findings, events, flows, frames };
}

export function formatReport(r: AuditReport, slug: string) {
  const errs = r.findings.filter(f => f.sev === 'error'), warns = r.findings.filter(f => f.sev === 'warn');
  const lines = [`scene audit: ${slug} — ${r.frames} frames checked, ${errs.length} error(s), ${warns.length} warning(s), ${r.flows.filter(f => f.on).length} flowing moves`];
  for (const f of [...errs, ...warns]) lines.push(`${f.sev === 'error' ? 'ERROR' : 'warn '}  #${f.shot} ${f.id || ''}  [${f.check}]  ${f.msg}`);
  return lines.join('\n');
}

export { THREE };
