// Renders one episode shot (3D scene or 2D card) at shot-local time t.
import React from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { evalActor } from '../engine/actor';
import { impulse, project, pxPerMetre, shake } from '../engine/cam';
import { rand, Shockwave, Sparks } from '../engine/fx';
import { LOOK } from '../engine/materials';
import { setRim, Stage } from '../engine/Stage';
import { Burst } from '../engine/Burst';
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
import { SFX_VISUAL } from './sfxVisual';

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

// Vertical (9:16 shorts) render: the 3D canvas is 1080×1920 with the same vertical field of view, so it shows
// exactly the 16:9 frame's centre column at full resolution. 2D layers authored in 1920×1080 (overlays, which
// project actors with the 16:9 maths) are scaled by 1920/1080 and centred, so they land where the 3D does.
export const VW = 1080, VH = 1920;
const VS = VH / H;
// The 16:9 framings are a little tight once only their centre column shows (a close becomes a head wider than
// the screen), so the vertical view opens the lens by VWIDEN; the 1920×1080 2D layer shrinks to match.
export const VWIDEN = 1.25;
export const widenFov = (fov: number) => (2 * Math.atan(Math.tan((fov * Math.PI) / 360) * VWIDEN) * 180) / Math.PI;
const VO = VS / VWIDEN;
export const Wide: React.FC<{ vertical?: boolean; children: React.ReactNode }> = ({ vertical, children }) =>
  vertical ? (
    <div style={{ position: 'absolute', left: (VW - W * VO) / 2, top: (VH - H * VO) / 2, width: W, height: H, transform: `scale(${VO})`, transformOrigin: 'top left' }}>{children}</div>
  ) : <>{children}</>;

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

const Scene3D: React.FC<{ ctx: ShotCtx; t: number; cast: Record<string, CastMember>; prev?: ShotCtx; review?: string; vertical?: boolean }> = ({ ctx, t, cast, prev, review, vertical }) => {
  const { shot, dur, words } = ctx;
  const sc = evalShot(ctx, t, cast, prev);
  const { def, palKey, states, swap: sw, frozen, props } = sc;
  // sound → picture: every scripted sound kicks the camera / flashes / pops an emote on its frame (sfxVisual.ts)
  const cues = sfxCues(shot, words);
  const kick = cues.reduce((a, c) => a + (c.v.shake ?? 0) * impulse(t, c.t, 0.25), 0);
  const cam = kick > 0.001 ? shake(sc.cam, t, 0.04 * kick, 20, 11) : sc.cam;
  const tgt = shot.camera?.target;
  const mainActor = typeof tgt === 'string' ? tgt : Array.isArray(tgt) && typeof tgt[0] === 'string' ? (tgt as string[])[0] : sc.byId.hero ? 'hero' : states[0]?.spec.id;
  const autoOverlays = cues.filter(c => c.v.emote && mainActor).map(c => ({ type: 'emote' as const, actor: mainActor!, kind: c.v.emote!, at: c.t }));
  const autoBurst = cues.find(c => c.v.burst && t >= c.t && t < c.t + 1.6);
  const pal = PALETTES[palKey] || PALETTES.afternoon;
  LOOK.uDesat.value = frozen ? 0.55 : 0;
  setRim();
  const S = def.component;
  const look = cam.look.toArray() as Vec3;
  const grade = GRADES[shot.fx?.grade || 'none'];
  // beat effects: a sunburst behind an actor, and selective colour (everyone but fx.focus.ids goes grey)
  const win = (sp?: { at?: number | string; until?: number | string }, def = 2.2) => {
    if (!sp) return 0;
    const a = cue(sp.at, words, 0), b = sp.until !== undefined ? cue(sp.until, words, dur) : a + def;
    return t < a || t > b ? 0 : Math.min(1, (t - a) / 0.2, (b - t) / 0.2);
  };
  const burstK = autoBurst ? Math.min(1, (t - autoBurst.t) / 0.2, (autoBurst.t + 1.6 - t) / 0.2) : win(shot.fx?.burst);
  const burstWho = burstK > 0 ? sc.byId[(autoBurst ? mainActor : shot.fx?.burst?.actor) || 'hero'] : undefined;
  const focusK = win(shot.fx?.focus, 2.5);
  const focusIds = focusK > 0 ? shot.fx?.focus?.ids || [] : [];
  const camV = vertical ? { ...cam, fov: widenFov(cam.fov) } : cam;
  const stageSize = vertical ? { width: VW, height: VH } : {};
  const worldFilter = [grade !== 'none' ? grade : '', focusK > 0 ? `saturate(${1 - 0.85 * focusK}) brightness(${1 - 0.15 * focusK})` : ''].filter(Boolean).join(' ') || 'none';
  return (
    <AbsoluteFill>
    <AbsoluteFill style={{ filter: worldFilter }}>
      <Stage cam={camV} {...stageSize}>
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
        {burstWho && <Burst t={t} cam={cam} center={burstWho.anchors.chest} color={autoBurst?.v.burst ?? shot.fx?.burst?.color} k={burstK} />}
        {sw && t >= sw.t && t < sw.t + 0.6 && sw.pre.map((a, i) => (
          <React.Fragment key={'sw' + i}>
            <Stickman s={evalActor(a, cast[a.id] || cast.hero, sw.t - 0.01, seedOf(a.id), undefined, ctx.start + sw.t - 0.01)} ghostOpacity={0.5 * (1 - (t - sw.t) / 0.6)} ghostColor="#b07cff" ghostOrder={40 + i * 2} shadowBlob={false} />
            <Shockwave t={t - sw.t} origin={a.pos as Vec3} maxR={1.6} dur={0.35} color="#c9a6ff" air={false} />
            <Sparks t={t - sw.t} center={new THREE.Vector3(...(a.pos as Vec3)).add(new THREE.Vector3(0, 1, 0))} n={18} color="#d2b2ff" intensity={1 - (t - sw.t) / 0.6} />
          </React.Fragment>
        ))}
      </Stage>
    </AbsoluteFill>
      {focusIds.length > 0 && (
        <AbsoluteFill style={{ filter: grade !== 'none' ? grade : undefined }}>
          <Stage cam={camV} {...stageSize} transparent>
            <Lighting p={pal} center={def.shadowCenter || look} shadowBox={def.shadowBox ?? 14} sky={false} bg={false} desat={0} />
            {states.filter(s => focusIds.includes(s.spec.id)).map((s, i) => <Stickman key={i} s={s} faceGlow={s.spec.glow} shadowBlob={false} />)}
          </Stage>
        </AbsoluteFill>
      )}
      {shot.fx?.speedLines && <SpeedLines t={t} opacity={0.55} />}
      {sw && <Flash t={t} at={sw.t} dur={0.14} color="#c9a6ff" peak={0.45} />}
      {cues.filter(c => c.v.flash).map((c, i) => <Flash key={'sf' + i} t={t} at={c.t} dur={0.16} peak={c.v.flash} />)}
      <Wide vertical={vertical}>
      <OverlayLayer overlays={[...(shot.overlays || []), ...autoOverlays].map(o => {
        // overlay times take word cues: `at`, `until` (shot time) and a stopwatch's `switchAt` (time since it appeared)
        const x = o as { at?: number | string; until?: number | string; switchAt?: number | string };
        const at = cue(x.at, words, 0);
        // a body menu's row cues / noteAt are shot times too: make them relative to the panel
        const m = o.type === 'menu' ? { rows: o.rows.map(r => (r.at !== undefined ? { ...r, at: cue(r.at, words, 0) - at } : r)), ...(o.noteAt !== undefined ? { noteAt: cue(o.noteAt, words, 0) - at } : {}) } : {};
        // vertical shorts keep the title in its compact 9:16 layout (the wide one loses its sides)
        const vt = vertical && o.type === 'title' ? { compact: 999 } : {};
        return { ...o, at, ...m, ...vt, ...(x.until !== undefined ? { until: cue(x.until, words, 0) } : {}), ...(typeof x.switchAt === 'string' ? { switchAt: cue(x.switchAt, words, 0) - at } : {}) } as typeof o;
      })} t={t} dur={dur} project={(id: string) => {
        const s = sc.byId[id];
        return s ? { ...project(s.anchors.headTop, cam, W, H), scale: pxPerMetre(s.anchors.head, cam, H) } : null;
      }} />
      </Wide>
      {review && <ReviewOverlay scene={sc} label={review} t={t} dur={dur} />}
    </AbsoluteFill>
  );
};

/** The shot's scripted sounds that have an automatic visual (sfxVisual.ts), with their resolved times. */
function sfxCues(shot: Shot, words: Words | undefined) {
  return (shot.sfx || []).flatMap(c => {
    const v = SFX_VISUAL[c.name];
    return v ? [{ t: cue(c.t as number | string, words, 0), v }] : [];
  });
}

// any "@word" string inside a card spec becomes that word's time (seconds into the shot)
const cueSpec = (v: unknown, words: Words | undefined): unknown =>
  typeof v === 'string' && /^@[\w']/.test(v) ? cue(v, words, 0)
    : Array.isArray(v) ? v.map(x => cueSpec(x, words))
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, cueSpec(x, words)])) : v;

const CardScene: React.FC<{ shot: CardShot; t: number; dur: number; words?: Words; vertical?: boolean }> = ({ shot, t, dur, words, vertical }) => {
  const def = CARDS[shot.card];
  if (!def) return <AbsoluteFill style={{ background: '#16203a', color: '#f0b44c', fontSize: 64, justifyContent: 'center', alignItems: 'center' }}>card “{shot.card}” missing</AbsoluteFill>;
  const { kind: _k, vo: _v, who: _w, hold: _h, card: _c, overlays, sfx: _s, cut: _cut, id: _id, ...spec } = shot;
  const C = def.component;
  const card = (
    <AbsoluteFill>
      <C t={t} dur={dur} spec={cueSpec(spec, words) as typeof spec} W={W} H={H} />
      <OverlayLayer overlays={overlays || []} t={t} dur={dur} project={() => null} />
    </AbsoluteFill>
  );
  if (!vertical) return card;
  // vertical: a 16:9 card would lose its sides in the centre column, so it is fitted to the width,
  // over a blurred, darkened copy of itself that fills the frame
  const fit = VW / W;
  return (
    <AbsoluteFill style={{ background: '#0d1220', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: (VW - W * VS) / 2, top: 0, width: W, height: H, transform: `scale(${VS})`, transformOrigin: 'top left', filter: 'blur(14px) brightness(0.45) saturate(1.2)' }}>{card}</div>
      <div style={{ position: 'absolute', left: 0, top: (VH - H * fit) / 2, width: W, height: H, transform: `scale(${fit})`, transformOrigin: 'top left', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}>{card}</div>
    </AbsoluteFill>
  );
};

// Two-sided transitions: the outgoing shot plays the first half in its last frames (nextCut),
// the incoming shot the second half in its first frames (cut). Pure 2D, on the finished frame.
const TR = { whip: 0.17, zoom: 0.2, smash: 0.28, push: 0.2 };
let trSeq = 0;
function transition(cut: string | undefined, nextCut: string | undefined, t: number, dur: number) {
  const id = `tr${++trSeq % 1000}`;
  let x = 0, sc = 1, bx = 0, by = 0, rot = 0;
  const outK = (w: number) => Math.max(0, Math.min(1, (t - (dur - w)) / w));
  const inK = (w: number) => Math.max(0, Math.min(1, 1 - t / w));
  // blur raised 2026-11-09 (Vitinho reference: the motion blur of a whip/zoom is what sells it)
  if (nextCut === 'whip') { const k = outK(TR.whip) ** 2; x -= k * 14; bx += k * 160; sc *= 1 + k * 0.3; }
  if (cut === 'whip') { const k = inK(TR.whip) ** 2; x += k * 14; bx += k * 160; sc *= 1 + k * 0.3; }
  if (nextCut === 'zoom') { const k = outK(TR.zoom) ** 2; sc *= 1 + k * 1.2; bx += k * 24; by += k * 24; }
  if (cut === 'zoom') { const k = inK(TR.zoom) ** 2; sc *= 1 + k * 0.8; bx += k * 24; by += k * 24; }
  // push: the new shot shoves the old one out to the left
  if (nextCut === 'push') { const k = outK(TR.push) ** 2; x -= k * 100; bx += k * 60; }
  if (cut === 'push') { const k = inK(TR.push) ** 2; x += k * 100; bx += k * 60; }
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
  shot: Shot; t: number; dur: number; cast: Record<string, CastMember>; frame: number; words?: Words; start?: number; prev?: ShotCtx; review?: string; nextCut?: string; vertical?: boolean;
}> = ({ shot, t, dur, cast, words, start = 0, prev, review, nextCut, vertical }) => {
  const body = shot.kind === 'card'
    ? <CardScene shot={shot as CardShot} t={t} dur={dur} words={words} vertical={vertical} />
    : <Scene3D ctx={{ shot: shot as Shot3D, dur, start, words }} t={t} cast={cast} prev={prev} review={review} vertical={vertical} />;
  const cut = shot.cut;
  const tr = transition(cut, nextCut, t, dur);
  const punch = sfxCues(shot, words).reduce((a, c) => a + (c.v.zoom ?? 0) * impulse(t, c.t, 0.18), 0);
  if (punch > 0.002) tr.transform = `${tr.transform || ''} scale(${1 + punch})`;
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
