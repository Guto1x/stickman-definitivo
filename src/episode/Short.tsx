// Vertical short (1080×1920, ~60 s) cut from an episode: a few pieces of shots played as in the episode,
// then the world FREEZES and the hero alone turns to the lens to send the viewer to the full story
// (the 4th-wall break, user rule 2026-11-09). The plan comes from tools/shorts.mjs:
//   public/episodes/<slug>/shorts/plan_<n>.json  (+ short_<n>.wav when the audio was built)
//   npx remotion render Short out.mp4 --props='{"slug":"menu-corpo","n":1}'
import React from 'react';
import { AbsoluteFill, Audio, type CalculateMetadataFunction, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/BarlowCondensed';
import { evalActor } from '../engine/actor';
import { setRim, Stage } from '../engine/Stage';
import { Stickman } from '../engine/Stickman';
import { LOOK } from '../engine/materials';
import { Lighting, PALETTES } from '../sets/look';
import { WorldProp } from '../sets/props';
import { Grade } from '../overlays/Grade';
import type { CameraSpec, CastMember, Episode as EpisodeSpec, Shot3D, Timing, Vec3 } from '../types';
import { solveCamera } from './camsolve';
import { castOf } from './resolve';
import { evalShot, seedOf, sentenceStarts, type ShotCtx } from './scene';
import { ShotView, VH, VW } from './ShotView';

const { fontFamily } = loadFont('normal', { weights: ['800'], subsets: ['latin', 'latin-ext'] });

export type ShortPlan = {
  n: number;
  title: string;
  cta: string;
  pieces: { shot: number; from: number; to: number }[]; // shot-local seconds
  freeze: {
    stage: number; // shot whose frozen world (at `at`) stages the 4th-wall break; the hero must be in it
    at: number;
    hold: number; // seconds of the frozen last frame (the "pause" hit) before the hero turns
    lead: number; // seconds into the 4th-wall scene before he speaks
    lineDur: number;
    tail: number; // seconds after the line
    words?: [string, number][]; // CTA word times (s, from the line start) when the line was voiced
  };
  total: number;
};

export type ShortProps = { slug: string; n: number; episode?: EpisodeSpec; timing?: Timing; plan?: ShortPlan; hasAudio?: boolean };

export const calculateShortMetadata: CalculateMetadataFunction<ShortProps> = async ({ props }) => {
  const base = `episodes/${props.slug}`;
  const get = (f: string) => fetch(staticFile(`${base}/${f}`)).then(r => {
    if (!r.ok) throw new Error(`missing ${base}/${f} — run: node tools/shorts.mjs plan ${props.slug}`);
    return r.json();
  });
  const [episode, timing, plan] = await Promise.all([get('episode.json'), get('timing.json'), get(`shorts/plan_${props.n}.json`)]);
  const hasAudio = await fetch(staticFile(`${base}/shorts/short_${props.n}.wav`), { method: 'HEAD' }).then(r => r.ok).catch(() => false);
  const fps = episode.fps || 30;
  return { durationInFrames: Math.ceil(plan.total * fps), fps, width: VW, height: VH, props: { ...props, episode, timing, plan, hasAudio } };
};

// ---- captions: word by word, 3 words a line, the spoken one highlighted (most shorts are watched muted) ----
type Cap = { w: string; t: number; br?: boolean }; // br: a sentence ends after this word
const Captions: React.FC<{ words: Cap[]; t: number; y?: number; hot?: string }> = ({ words, t, y = 1230, hot = '#ffd23f' }) => {
  let i = -1;
  for (let k = 0; k < words.length; k++) if (words[k].t <= t) i = k;
  if (i < 0) return null;
  // nothing spoken for a while: hide the stale line
  if (t - words[i].t > 1.6 && (i === words.length - 1 || words[i + 1].t - words[i].t > 1.6)) return null;
  // lines of up to 3 words that never run across a sentence end
  let g = 0;
  for (let k = 0, n = 0; k <= i; k++) {
    if (k > 0 && (n === 3 || words[k - 1].br)) { g = k; n = 0; }
    n++;
  }
  let e = g;
  while (e < words.length && e - g < 3) { e++; if (words[e - 1].br) break; }
  const line = words.slice(g, e);
  const pop = Math.min(1, (t - words[i].t) / 0.08);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 26px' }}>
      {line.map((c, k) => {
        const on = g + k === i;
        return (
          <span key={k} style={{
            fontFamily, fontWeight: 800, fontSize: 104, lineHeight: 1.05, textTransform: 'uppercase', color: on ? hot : '#ffffff',
            WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,0.55)',
            transform: on ? `scale(${1 + 0.12 * (1 - pop)})` : undefined, display: 'inline-block',
          }}>{c.w}</span>
        );
      })}
    </div>
  );
};

// ---- the 4th-wall break -------------------------------------------------------------------------------
// The stage shot is evaluated at `at` and held: set, props and every other actor stay frozen (and
// desaturated, as a CSS filter on the world layer). The hero keeps his frozen pose but comes alive: head to
// the lens, a smug face, the mouth on the line. A second, transparent canvas draws him again on top,
// unfiltered, so he alone keeps his colour. The camera is a fresh front medium that pushes in.
const FreezeScene: React.FC<{ ctx: ShotCtx; at: number; t: number; dur: number; lead: number; lineDur: number; cast: Record<string, CastMember> }> = ({ ctx, at, t, dur, lead, lineDur, cast }) => {
  const sc = evalShot(ctx, at, cast);
  const hero = sc.byId.hero;
  const pal = PALETTES[sc.palKey] || PALETTES.afternoon;
  const fallback: Vec3 = sc.def.marks.center || [0, 0, 0];
  // a full shot that pushes in toward medium: the whole frozen hero, then his face, with room for the badge
  const spec: CameraSpec = { shot: 'full', target: 'hero', angle: 8, height: 6, move: 'pushIn', amount: 1.1 };
  const cam = hero ? solveCamera(spec, t, dur, sc.byId, fallback, { hero: hero.rot }) : sc.cam;
  const live = hero && evalActor(
    {
      ...hero.spec, pos: hero.pos, rot: hero.rot, path: undefined, gait: undefined, poses: undefined,
      pose: hero.pose as never,
      faces: [{ t: 0, face: 'smug' }, { t: lead + lineDur * 0.55, face: 'grin', blend: 0.25 }], face: undefined,
      talk: [[lead, lead + lineDur]], look: 'camera',
    } as never,
    cast.hero, t, seedOf('hero'), target => (target === 'camera' ? cam.pos : undefined), ctx.start + at + t,
  );
  LOOK.uDesat.value = 0;
  setRim();
  const S = sc.def.component;
  const look = cam.look.toArray() as Vec3;
  const k = Math.min(1, t / 0.25);
  const lights = <Lighting p={pal} center={sc.def.shadowCenter || look} shadowBox={sc.def.shadowBox ?? 14} sky={!sc.def.interior} desat={0} />;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `saturate(${1 - 0.8 * k}) brightness(${1 - 0.18 * k}) contrast(1.05)` }}>
        <Stage cam={cam} width={VW} height={VH}>
          {lights}
          <S t={0} center={look} variant={(ctx.shot as Shot3D).variant ?? 0} time={sc.palKey} />
          {sc.props.map((p, i) => <WorldProp key={i} spec={p} t={0} />)}
          {sc.states.map((s, i) => (s.spec.id === 'hero' && live ? <Stickman key={i} s={live} /> : <Stickman key={i} s={s} />))}
        </Stage>
      </AbsoluteFill>
      {live && (
        <AbsoluteFill>
          <Stage cam={cam} width={VW} height={VH} transparent>
            {React.cloneElement(lights, { sky: false, bg: false })}
            <Stickman s={live} shadowBlob={false} />
          </Stage>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// the pause badge pops on the freeze and leaves once the pause has read (~1.3 s), before the push-in
// brings the hero's head up under it
const PauseBadge: React.FC<{ t: number }> = ({ t }) => {
  const k = Math.min(1, t / 0.18);
  const out = Math.max(0, Math.min(1, (t - 1.1) / 0.3));
  if (out >= 1) return null;
  return (
    <div style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: k * (1 - out) }}>
      <div style={{ display: 'flex', gap: 22, padding: '26px 34px', borderRadius: 28, background: 'rgba(0,0,0,0.55)', transform: `scale(${1.25 - 0.25 * k})` }}>
        <div style={{ width: 30, height: 110, background: '#fff', borderRadius: 6 }} />
        <div style={{ width: 30, height: 110, background: '#fff', borderRadius: 6 }} />
      </div>
    </div>
  );
};

export const Short: React.FC<ShortProps> = ({ slug, n, episode, timing, plan, hasAudio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!episode || !timing || !plan) return null;
  const cast = castOf(episode);
  const T = frame / fps;
  const durOf = (i: number) => {
    const tm = timing.shots[i];
    return Math.max(1, Math.round((tm.start + tm.dur) * fps) - Math.round(tm.start * fps)) / fps;
  };
  // pieces on the short's timeline
  let off = 0;
  const laid = plan.pieces.map((p, k) => {
    const o = off;
    off += p.to - p.from;
    return { ...p, k, off: o };
  });
  const piecesEnd = off;
  const { freeze } = plan;
  const ctaStart = piecesEnd + freeze.hold;
  // captions: the episode's words inside each piece, then the CTA line
  const caps: Cap[] = [];
  laid.forEach(p => {
    const ws = timing.shots[p.shot].words || [];
    const starts = sentenceStarts(episode.shots[p.shot].vo, ws);
    ws.forEach(([w, t], k) => { if (t >= p.from && t < p.to - 0.05) caps.push({ w, t: p.off + t - p.from, br: starts.has(k + 1) || k === ws.length - 1 }); });
  });
  const ctaWords: Cap[] = freeze.words?.length
    ? freeze.words.map(([w, t]) => ({ w, t: ctaStart + freeze.lead + t }))
    : plan.cta.split(/\s+/).filter(Boolean).map((w, i, a) => ({ w: w.replace(/[.,!?…]+$/, ''), br: /[.!?…]$/.test(w), t: ctaStart + freeze.lead + (i / a.length) * freeze.lineDur }));
  const last = laid[laid.length - 1];
  const stageShot = episode.shots[freeze.stage] as Shot3D;
  const stageTm = timing.shots[freeze.stage];
  const ctx = (i: number): ShotCtx => ({ shot: episode.shots[i] as Shot3D, dur: durOf(i), start: timing.shots[i].start, words: timing.shots[i].words });
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {laid.map(p => {
        const shot = episode.shots[p.shot];
        const prevP = laid[p.k - 1], nextP = laid[p.k + 1];
        const contPrev = prevP && prevP.shot === p.shot - 1 && p.from < 0.01 && shot.kind !== 'card' && episode.shots[prevP.shot].kind !== 'card';
        const contNext = nextP && nextP.shot === p.shot + 1 && p.to >= durOf(p.shot) - 0.01;
        return (
          <Sequence key={p.k} from={Math.round(p.off * fps)} durationInFrames={Math.max(1, Math.round((p.to - p.from) * fps))} name={`${p.shot} ${shot.id || ''}`}>
            <ShotView shot={shot} t={p.from + (frame - Math.round(p.off * fps)) / fps} dur={durOf(p.shot)} cast={cast} frame={frame}
              words={timing.shots[p.shot].words} start={timing.shots[p.shot].start} vertical
              prev={contPrev ? ctx(p.shot - 1) : undefined} nextCut={contNext ? episode.shots[p.shot + 1]?.cut : undefined} />
          </Sequence>
        );
      })}
      {/* the pause hit: the last frame held, draining of colour */}
      <Sequence from={Math.round(piecesEnd * fps)} durationInFrames={Math.max(1, Math.round(freeze.hold * fps))} name="pause">
        <AbsoluteFill style={{ filter: `saturate(${1 - 0.8 * Math.min(1, (T - piecesEnd) / freeze.hold)}) brightness(0.92)` }}>
          <ShotView shot={episode.shots[last.shot]} t={last.to - 1 / fps} dur={durOf(last.shot)} cast={cast} frame={frame}
            words={timing.shots[last.shot].words} start={timing.shots[last.shot].start} vertical />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: '#fff', opacity: Math.max(0, 0.6 - (T - piecesEnd) * 4) }} />
      </Sequence>
      <Sequence from={Math.round(ctaStart * fps)} name="4th wall">
        <FreezeScene ctx={{ shot: stageShot, dur: durOf(freeze.stage), start: stageTm.start, words: stageTm.words }} at={freeze.at}
          t={T - ctaStart} dur={plan.total - ctaStart} lead={freeze.lead} lineDur={freeze.lineDur} cast={cast} />
      </Sequence>
      {T >= piecesEnd && <PauseBadge t={T - piecesEnd} />}
      <Grade vignette={0.5} grain={0.03} />
      <Captions words={T < ctaStart ? caps : ctaWords} t={T} hot={T < ctaStart ? '#ffd23f' : '#7fe0ff'} />
      {hasAudio && <Audio src={staticFile(`episodes/${slug}/shorts/short_${n}.wav`)} />}
    </AbsoluteFill>
  );
};

