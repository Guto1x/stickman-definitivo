// Renders one episode shot (3D scene or 2D card) at shot-local time t.
import React from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { evalActor } from '../engine/actor';
import { project, pxPerMetre } from '../engine/cam';
import { rand, Shockwave, Sparks } from '../engine/fx';
import { LOOK } from '../engine/materials';
import { setRim, Stage } from '../engine/Stage';
import { Stickman } from '../engine/Stickman';
import { CARDS } from '../cards';
import { Lighting, PALETTES } from '../sets/look';
import { WorldProp } from '../sets/props';
import { Flash, SpeedLines } from '../overlays/Energy';
import type { CardShot, CastMember, Shot, Shot3D, Vec3 } from '../types';
import { OverlayLayer } from './overlays';
import { cue, type Words } from './cue';
import { evalShot, seedOf, type ShotCtx } from './scene';
import { ReviewOverlay } from './ReviewOverlay';

const W = 1920, H = 1080;
const GRADES: Record<string, string> = {
  none: 'none',
  warm: 'saturate(1.08) sepia(0.12) brightness(1.02)',
  cool: 'saturate(0.92) hue-rotate(-8deg) brightness(0.98)',
  desat: 'saturate(0.35) brightness(1.02)',
  mono: 'grayscale(1) contrast(1.05)',
  dream: 'saturate(1.15) brightness(1.08) blur(0.6px)',
  night: 'saturate(0.85) brightness(0.9) hue-rotate(10deg)',
  danger: 'saturate(1.2) sepia(0.25) hue-rotate(-25deg) contrast(1.08)',
  flashback: 'sepia(0.45) saturate(0.8) contrast(0.95) brightness(1.05)',
};

const moteGeo = new THREE.SphereGeometry(1, 6, 4);

/** Floating motes for time-freeze and atmosphere (static in the air when frozen). */
const Motes: React.FC<{ t: number; center: THREE.Vector3; kind: string; frozen?: boolean }> = ({ t, center, kind, frozen }) => {
  const r = rand(kind.length * 31 + 7);
  const n = kind === 'snow' ? 90 : kind === 'rain' ? 140 : 60;
  const col = kind === 'embers' ? '#ffb15c' : kind === 'sparks' ? '#d2b2ff' : kind === 'rain' ? '#bcd3f0' : '#fbf6ec';
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = center.x + (r() - 0.5) * 9, z = center.z + (r() - 0.5) * 7;
    const fall = kind === 'rain' ? 9 : kind === 'snow' ? 0.6 : kind === 'embers' || kind === 'sparks' ? -0.5 : 0.08;
    const y0 = r() * 4;
    const tt = frozen ? 0 : t;
    const y = (((y0 - fall * tt) % 4) + 4) % 4;
    const wob = frozen ? 0 : Math.sin(tt * 1.3 + i) * 0.05;
    const s = kind === 'rain' ? [0.006, 0.16, 0.006] : [1, 1, 1].map(() => (kind === 'dust' ? 0.012 : 0.02) * (0.5 + r()));
    out.push(
      <mesh key={i} geometry={moteGeo} position={[x + wob, y, z]} scale={s as [number, number, number]}>
        <meshBasicMaterial color={col} transparent opacity={kind === 'dust' ? 0.55 : 0.85} toneMapped={false} depthWrite={false} />
      </mesh>,
    );
  }
  return <group>{out}</group>;
};

const Scene3D: React.FC<{ ctx: ShotCtx; t: number; cast: Record<string, CastMember>; prev?: ShotCtx; review?: string }> = ({ ctx, t, cast, prev, review }) => {
  const { shot, dur, words } = ctx;
  const sc = evalShot(ctx, t, cast, prev);
  const { def, palKey, states, cam, swap: sw, frozen, props } = sc;
  const pal = PALETTES[palKey] || PALETTES.afternoon;
  LOOK.uDesat.value = frozen ? 0.55 : 0;
  setRim();
  const S = def.component;
  const look = cam.look.toArray() as Vec3;
  const grade = GRADES[shot.fx?.grade || 'none'];
  return (
    <AbsoluteFill style={{ filter: grade }}>
      <Stage cam={cam}>
        <Lighting p={pal} center={def.shadowCenter || look} shadowBox={def.shadowBox ?? 14} sky={!def.interior} desat={frozen ? 0.55 : 0} />
        <S t={frozen ? 0 : t} center={look} variant={shot.variant ?? 0} time={palKey} />
        {props.map((p, i) => <WorldProp key={i} spec={p} t={frozen ? 0 : t} />)}
        {states.map((s, i) => (
          <React.Fragment key={i}>
            <Stickman s={s} faceGlow={s.spec.glow} />
            {s.spec.glow && <Sparks t={t} center={s.anchors.chest} color={s.spec.glow} n={20} />}
          </React.Fragment>
        ))}
        {(shot.fx?.particles || frozen) && <Motes t={t} center={cam.look} kind={shot.fx?.particles || 'dust'} frozen={frozen} />}
        {sw && t >= sw.t && t < sw.t + 0.6 && sw.pre.map((a, i) => (
          <React.Fragment key={'sw' + i}>
            <Stickman s={evalActor(a, cast[a.id] || cast.hero, sw.t - 0.01, seedOf(a.id), undefined, ctx.start + sw.t - 0.01)} ghostOpacity={0.5 * (1 - (t - sw.t) / 0.6)} ghostColor="#b07cff" ghostOrder={40 + i * 2} shadowBlob={false} />
            <Shockwave t={t - sw.t} origin={a.pos as Vec3} maxR={1.6} dur={0.35} color="#c9a6ff" air={false} />
            <Sparks t={t - sw.t} center={new THREE.Vector3(...(a.pos as Vec3)).add(new THREE.Vector3(0, 1, 0))} n={18} color="#d2b2ff" intensity={1 - (t - sw.t) / 0.6} />
          </React.Fragment>
        ))}
      </Stage>
      {shot.fx?.speedLines && <SpeedLines t={t} opacity={0.55} />}
      {sw && <Flash t={t} at={sw.t} dur={0.14} color="#c9a6ff" peak={0.45} />}
      <OverlayLayer overlays={(shot.overlays || []).map(o => {
        // overlay times take word cues: `at`, `until` (shot time) and a stopwatch's `switchAt` (time since it appeared)
        const x = o as { at?: number | string; until?: number | string; switchAt?: number | string };
        const at = cue(x.at, words, 0);
        return { ...o, at, ...(x.until !== undefined ? { until: cue(x.until, words, 0) } : {}), ...(typeof x.switchAt === 'string' ? { switchAt: cue(x.switchAt, words, 0) - at } : {}) } as typeof o;
      })} t={t} dur={dur} project={(id: string) => {
        const s = sc.byId[id];
        return s ? { ...project(s.anchors.headTop, cam, W, H), scale: pxPerMetre(s.anchors.head, cam, H) } : null;
      }} />
      {review && <ReviewOverlay scene={sc} label={review} t={t} dur={dur} />}
    </AbsoluteFill>
  );
};

// any "@word" string inside a card spec becomes that word's time (seconds into the shot)
const cueSpec = (v: unknown, words: Words | undefined): unknown =>
  typeof v === 'string' && /^@[\w']/.test(v) ? cue(v, words, 0)
    : Array.isArray(v) ? v.map(x => cueSpec(x, words))
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, cueSpec(x, words)])) : v;

const CardScene: React.FC<{ shot: CardShot; t: number; dur: number; words?: Words }> = ({ shot, t, dur, words }) => {
  const def = CARDS[shot.card];
  if (!def) return <AbsoluteFill style={{ background: '#16203a', color: '#f0b44c', fontSize: 64, justifyContent: 'center', alignItems: 'center' }}>card “{shot.card}” missing</AbsoluteFill>;
  const { kind: _k, vo: _v, who: _w, hold: _h, card: _c, overlays, sfx: _s, cut: _cut, id: _id, ...spec } = shot;
  const C = def.component;
  return (
    <AbsoluteFill>
      <C t={t} dur={dur} spec={cueSpec(spec, words) as typeof spec} W={W} H={H} />
      <OverlayLayer overlays={overlays || []} t={t} dur={dur} project={() => null} />
    </AbsoluteFill>
  );
};

// Two-sided transitions: the outgoing shot plays the first half in its last frames (nextCut),
// the incoming shot the second half in its first frames (cut). Pure 2D, on the finished frame.
const TR = { whip: 0.17, zoom: 0.2, smash: 0.28 };
let trSeq = 0;
function transition(cut: string | undefined, nextCut: string | undefined, t: number, dur: number) {
  const id = `tr${++trSeq % 1000}`;
  let x = 0, sc = 1, bx = 0, by = 0, rot = 0;
  const outK = (w: number) => Math.max(0, Math.min(1, (t - (dur - w)) / w));
  const inK = (w: number) => Math.max(0, Math.min(1, 1 - t / w));
  if (nextCut === 'whip') { const k = outK(TR.whip) ** 2; x -= k * 12; bx += k * 110; sc *= 1 + k * 0.3; }
  if (cut === 'whip') { const k = inK(TR.whip) ** 2; x += k * 12; bx += k * 110; sc *= 1 + k * 0.3; }
  if (nextCut === 'zoom') { const k = outK(TR.zoom) ** 2; sc *= 1 + k * 1.1; bx += k * 14; by += k * 14; }
  if (cut === 'zoom') { const k = inK(TR.zoom) ** 2; sc *= 1 + k * 0.7; bx += k * 14; by += k * 14; }
  if (cut === 'smash') {
    // punch-in that settles + a decaying shake
    const k = inK(TR.smash);
    sc *= 1 + 0.07 * k;
    x += Math.sin(t * 95) * 1.4 * k;
    rot += Math.sin(t * 71 + 1) * 1.2 * k;
  }
  return { id, transform: x || sc !== 1 || rot ? `translateX(${x}%) scale(${sc}) rotate(${rot}deg)` : undefined, blurX: bx, blurY: by };
}

export const ShotView: React.FC<{
  shot: Shot; t: number; dur: number; cast: Record<string, CastMember>; frame: number; words?: Words; start?: number; prev?: ShotCtx; review?: string; nextCut?: string;
}> = ({ shot, t, dur, cast, words, start = 0, prev, review, nextCut }) => {
  const body = shot.kind === 'card'
    ? <CardScene shot={shot as CardShot} t={t} dur={dur} words={words} />
    : <Scene3D ctx={{ shot: shot as Shot3D, dur, start, words }} t={t} cast={cast} prev={prev} review={review} />;
  const cut = shot.cut;
  const tr = transition(cut, nextCut, t, dur);
  return (
    <AbsoluteFill>
      {tr.blurX > 0.5 && (
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          <filter id={tr.id} x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation={`${tr.blurX} ${tr.blurY}`} /></filter>
        </svg>
      )}
      <AbsoluteFill style={{ transform: tr.transform, filter: tr.blurX > 0.5 ? `url(#${tr.id})` : undefined }}>{body}</AbsoluteFill>
      {cut === 'flash' && <Flash t={t} at={0} dur={0.18} peak={0.7} />}
      {cut === 'smash' && <Flash t={t} at={0} dur={0.1} peak={0.85} />}
      {cut === 'dip' && t < 0.3 && <AbsoluteFill style={{ background: '#000', opacity: 1 - t / 0.3 }} />}
      {review && shot.kind === 'card' && (
        <div style={{ position: 'absolute', left: 0, top: 0, right: 0, padding: '10px 16px', background: 'rgba(0,0,0,0.72)', color: '#ffd23f', fontSize: 26, fontFamily: 'Consolas, monospace' }}>
          {review} · t {t.toFixed(2)} / {dur.toFixed(2)} s · card:{(shot as CardShot).card}
        </div>
      )}
    </AbsoluteFill>
  );
};
