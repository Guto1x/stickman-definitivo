// 4-second hero shot: our gray-jacket stickman swallows a pill and runs 100x faster.
//  A 0.00–1.45  medium close-up: looks at the pill, swallows, power surges through him
//  B 1.45–2.15  extreme close-up: shock → determined smirk, purple energy crackling
//  C 2.15–3.05  low angle behind him: sprinter crouch, LAUNCH (shockwave, dust, leaves, light trail)
//  D 3.05–4.00  tracking at speed: blurred world, speed lines, afterimages, ×100 callout, exits frame
// All timing lives in pillSprint.json, which the Python sound design reads too.
import React from 'react';
import * as THREE from 'three';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import TL from './pillSprint.json';
import { CAST } from '../cast';
import { at, evalActor, type ActorState } from '../engine/actor';
import { camAt, impulse, noise1, project, pxPerMetre, shake, type CamState } from '../engine/cam';
import { AirStreaks, DustBurst, Glow, Leaves, Shockwave, Sparks, Trail } from '../engine/fx';
import { LOOK } from '../engine/materials';
import { gaitPose, resolvePose } from '../engine/rig';
import { setRim, Stage } from '../engine/Stage';
import { Stickman } from '../engine/Stickman';
import { Lighting, PALETTES } from '../sets/look';
import { Suburb } from '../sets/suburb';
import { Crackles, Flash, SpeedLines, type Pt } from '../overlays/Energy';
import { Grade } from '../overlays/Grade';
import { StatCallout } from '../overlays/Stat';
import type { ActorInShot, Face, Pose, Vec3 } from '../types';

export const PILL_SPRINT_SECONDS = TL.duration;
const E = TL.events;
const S = TL.shots;
const W = 1920, H = 1080;
const H0: Vec3 = [0, 0.1, -4.6];
const PAL = PALETTES.afternoon;
const PURPLE = '#a56cff';
const LAVENDER = '#d2b2ff';

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};

// ---- poses -------------------------------------------------------------------------------
const relaxedL: Pose['armL'] = [2, 8, 0, 14];
const P_HOLD: Pose = { spine: [3, 0, 0], head: [17, -16, 5], armL: relaxedL, reachR: { to: [-0.2, 1.12, 0.3], pole: [-0.7, -0.75, -0.2] }, legL: [0, 4, 0], legR: [0, 4, 0] };
const P_MOUTH: Pose = { spine: [-2, 0, 0], head: [-5, 0, 0], armL: relaxedL, reachR: { to: 'mouth', pole: [-0.6, -0.8, 0.0] }, legL: [0, 4, 0], legR: [0, 4, 0] };
const P_DOWN: Pose = { spine: [2, 0, 0], head: [5, 0, 0], armL: relaxedL, armR: [3, 8, 0, 16], legL: [0, 4, 0], legR: [0, 4, 0] };
const P_GULP: Pose = { ...P_DOWN, head: [19, 0, 0], spine: [5, 0, 0] };
const P_STILL: Pose = { ...P_DOWN, head: [0, 0, 0] };
const P_SURGE: Pose = { spine: [-12, 0, 0], head: [-9, 0, 0], armL: [16, 34, 0, 20], armR: [16, 34, 0, 20], handL: 'open', handR: 'open', legL: [0, 7, 0], legR: [0, 7, 0] };
const P_POWER: Pose = { spine: [-2, 0, 0], head: [-3, 0, 0], armL: [12, 22, 0, 40], armR: [12, 22, 0, 40], handL: 'fist', handR: 'fist', legL: [0, 9, 0], legR: [0, 9, 0] };
const P_CROUCH: Pose = { hipY: -0.36, spine: [48, 0, 0], head: [-36, 0, 0], legL: [70, 5, 105], legR: [-12, 5, 67], armL: [-45, 12, 0, 40], armR: [55, 12, 0, 60], handL: 'fist', handR: 'fist' };
const P_CROUCH_DEEP: Pose = { hipY: -0.4, spine: [56, 0, 0], head: [-42, 0, 0], legL: [78, 5, 108], legR: [-16, 5, 68], armL: [-55, 12, 0, 40], armR: [60, 12, 0, 60], handL: 'fist', handR: 'fist' };

// ---- faces -------------------------------------------------------------------------------
const F_CURIOUS: Face = { eyes: 1, look: [-0.75, 0.65], mouth: 0.35, brow: 0.25, browY: 0.25 };
const F_DETERMINED: Face = { eyes: 0.62, brow: -0.75, mouth: 0.6, width: 0.85 };
const F_RUN: Face = { eyes: 0.6, brow: -0.7, mouth: 0.75, open: 0.3, width: 0.9 };

/** Shots A and B share one continuous performance (global time). */
function heroAB(T: number): ActorInShot {
  return {
    id: 'hero', pos: H0, rot: 10,
    pose: P_HOLD,
    poses: [
      { t: E.pillLift, pose: P_MOUTH, blend: 0.28 },
      { t: E.pillIn + 0.04, pose: P_DOWN, blend: 0.3 },
      { t: E.gulp - 0.02, pose: P_GULP, blend: 0.07 },
      { t: E.gulp + 0.1, pose: P_STILL, blend: 0.18 },
      { t: E.surge, pose: P_SURGE, blend: 0.07 },
      { t: E.surge + 0.14, pose: P_POWER, blend: 0.24 },
    ],
    face: F_CURIOUS,
    faces: [
      { t: E.pillLift, face: { eyes: 1, look: [0, -0.15], mouth: 0.2, browY: 0.15 }, blend: 0.12 },
      { t: E.pillLift + 0.13, face: { eyes: 0.9, open: 0.55, mouth: 0.1 }, blend: 0.1 },
      { t: E.pillIn, face: { eyes: 0.9, open: 0, mouth: 0.15 }, blend: 0.06 },
      { t: E.gulp - 0.08, face: { eyes: 0.06, mouth: -0.15 }, blend: 0.06 },
      { t: E.gulp + 0.15, face: { eyes: 1, mouth: 0 }, blend: 0.08 },
      { t: E.surge, face: { eyes: 1.45, pupils: true, open: 0.7, brow: 0.2, browY: 0.6 }, blend: 0.04 },
      { t: E.beat2, face: { eyes: 1.28, pupils: true, open: 0.12, mouth: 0.1, browY: 0.3 }, blend: 0.1 },
      { t: E.smirk, face: F_DETERMINED, blend: 0.12 },
    ],
    hold: T < E.pillIn ? { R: 'pill' } : undefined,
  };
}

function heroC(T: number): ActorInShot {
  return {
    id: 'hero', pos: H0, rot: 90,
    pose: P_POWER,
    poses: [
      { t: E.crouch, pose: P_CROUCH, blend: 0.2 },
      { t: E.launch - 0.09, pose: P_CROUCH_DEEP, blend: 0.08 },
    ],
    face: F_DETERMINED,
    faces: [{ t: E.launch - 0.06, face: { ...F_DETERMINED, eyes: 0.5, mouth: 0.8, open: 0.2 } }],
  };
}

/** Energy level 0..1 after the surge (pulses). */
function energy(T: number) {
  if (T < E.surge) return 0;
  const base = 0.75 + 0.25 * Math.sin((T - E.surge) * 22) * Math.sin((T - E.surge) * 7.3);
  return base * (0.6 + 0.4 * impulse(T, E.surge, 0.25));
}

function applyEnergyLook(T: number) {
  const k = smooth(E.surge, E.surge + 0.12, T);
  const c = new THREE.Color('#f6e7c6').lerp(new THREE.Color(LAVENDER), k);
  setRim([-0.55, 0.8, 0.0], '#' + c.getHexString());
}

function bodyAnchors(s: ActorState): THREE.Vector3[] {
  const b = s.bones;
  return [
    s.anchors.headTop, at(b.head, 0.2, 0.05, 0), at(b.head, -0.2, 0.05, 0), at(b.chest, 0.17, -0.05, 0), at(b.chest, -0.17, -0.05, 0),
    s.anchors.handL, s.anchors.handR, at(b.hips, 0.12, -0.1, 0), at(b.hips, -0.12, -0.1, 0), at(b.shinL), at(b.shinR),
  ];
}

const toScreen = (pts: THREE.Vector3[], cam: CamState): Pt[] => pts.map(p => project(p, cam, W, H)).filter(p => p.visible);

const EnergyFx3D: React.FC<{ s: ActorState; T: number; light?: boolean; headGlow?: number }> = ({ s, T, light = true, headGlow = 0.22 }) => {
  const e = energy(T);
  if (e <= 0) return null;
  const chest = s.anchors.chest;
  return (
    <>
      <Glow p={chest} size={[2.4, 3.0]} color={PURPLE} opacity={0.32 * e} />
      <Glow p={s.anchors.head} size={1.2} color={LAVENDER} opacity={headGlow * e} />
      <Sparks t={T - E.surge} center={chest} n={30} area={[0.38, 0.75, 0.3]} color={LAVENDER} intensity={e} />
      {light && <pointLight position={chest.clone().add(new THREE.Vector3(0, -0.4, 0.7))} color={PURPLE} intensity={1.1 * e} distance={4} decay={2} />}
    </>
  );
};

// ---- shot A + B (continuous performance) --------------------------------------------------
const ShotAB: React.FC<{ T: number; close: boolean; frame: number }> = ({ T, close, frame }) => {
  applyEnergyLook(T);
  const hero = evalActor(heroAB(T), CAST.hero, T, 3.1);
  let cam: CamState;
  if (!close) {
    cam = camAt([
      { t: 0, pos: [0.5, 1.44, -2.15], look: [-0.03, 1.37, -4.6], fov: 30 },
      { t: E.surge, pos: [0.44, 1.45, -2.38], look: [-0.02, 1.38, -4.6], fov: 30, ease: 'inOut' },
      { t: E.surge + 0.12, pos: [0.38, 1.47, -2.62], look: [0, 1.41, -4.6], fov: 30, ease: 'snap' },
      { t: S.A[1], pos: [0.36, 1.48, -2.72], look: [0, 1.42, -4.6], fov: 30, ease: 'out' },
    ], T);
    cam = shake(cam, T, 0.035 * impulse(T, E.surge, 0.22), 22, 2);
  } else {
    const hc = hero.anchors.head;
    cam = camAt([
      { t: S.B[0], pos: [hc.x + 0.2, hc.y - 0.12, hc.z + 0.98], look: [hc.x, hc.y - 0.03, hc.z], fov: 28, roll: 4 },
      { t: S.B[1], pos: [hc.x + 0.12, hc.y - 0.08, hc.z + 0.8], look: [hc.x, hc.y - 0.02, hc.z], fov: 28, roll: -1, ease: 'linear' },
    ], T);
    cam = shake(cam, T, 0.012 + 0.02 * impulse(T, E.beat2, 0.15), 16, 5);
  }
  const anchors = close
    ? [hero.anchors.headTop, at(hero.bones.head, 0.21, 0.05, 0), at(hero.bones.head, -0.21, 0.05, 0), at(hero.bones.head, 0.15, 0.16, 0), at(hero.bones.head, -0.16, -0.12, 0.05)]
    : bodyAnchors(hero);
  const scale = pxPerMetre(hero.anchors.chest, cam, H);
  const e = energy(T);
  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        <Lighting p={PAL} center={[0, 0, -4.6]} shadowBox={10} rim={false} />
        <Suburb centerX={0} behind={60} ahead={80} />
        <Stickman s={hero} faceGlow={T >= E.surge ? '#b98aff' : undefined} />
        <EnergyFx3D s={hero} T={T} headGlow={close ? 0.08 : 0.2} />
      </Stage>
      <Crackles frame={frame} anchors={toScreen(anchors, cam)} center={project(close ? hero.anchors.head : hero.anchors.chest, cam, W, H)} scale={scale} intensity={e * (close ? 1.1 : 1.0)} seed={close ? 7 : 3} color={PURPLE} />
      <Flash t={T} at={E.surge} dur={0.22} color="#b98aff" peak={0.55} />
    </AbsoluteFill>
  );
};

// ---- shot C: launch ------------------------------------------------------------------------
function launchX(tau: number) {
  if (tau <= 0) return 0;
  const tc = 0.0889; // reaches 160 m/s
  return tau < tc ? 900 * tau * tau : 900 * tc * tc + 160 * (tau - tc);
}

const ShotC: React.FC<{ T: number; frame: number }> = ({ T, frame }) => {
  applyEnergyLook(T);
  const tau = T - E.launch;
  let cam = camAt([
    { t: S.C[0], pos: [-2.4, 0.5, -2.5], look: [2.5, 0.92, -4.85], fov: 34 },
    { t: E.launch, pos: [-2.25, 0.5, -2.55], look: [2.5, 0.93, -4.85], fov: 34, ease: 'linear' },
    { t: E.launch + 0.12, pos: [-2.0, 0.52, -2.62], look: [2.7, 0.95, -4.85], fov: 35, ease: 'snap' },
    { t: S.C[1], pos: [-1.9, 0.53, -2.65], look: [2.8, 0.96, -4.85], fov: 35, ease: 'out' },
  ], T);
  cam = shake(cam, T, 0.008 + 0.07 * impulse(T, E.launch, 0.28), 24, 9);
  const base = evalActor(heroC(T), CAST.hero, T, 3.1);
  const x = launchX(tau);
  const visible = tau < 0.1;
  let hero = base;
  if (tau >= 0) {
    // mid-launch: athletic dash pose leaning hard, placed along the street
    // every launch frame shows a full-extension stride (alternating legs) so he never reads as walking
    const dash = gaitPose('dash', 0.25 + 0.5 * Math.floor(tau * 30 + 1e-6));
    const spec: ActorInShot = { id: 'hero', pos: [H0[0] + x, H0[1], H0[2]], rot: 90, pose: { ...dash, spine: [42, 0, 0], head: [-32, 0, 0], hipY: -0.1 } };
    hero = evalActor(spec, CAST.hero, T, 3.1);
  }
  const ghosts: { st: ActorState; o: number }[] = [];
  if (tau >= 0) {
    const g = (pos: Vec3, pose: Pose, life: number, o0: number) => {
      const o = o0 * (1 - clamp01(tau / life));
      if (o > 0.01) ghosts.push({ st: evalActor({ id: 'hero', pos, rot: 90, pose }, CAST.hero, E.launch, 3.1), o });
    };
    g(H0, resolvePose(P_CROUCH_DEEP), 0.42, 0.4);
    g([H0[0] + 1.0, H0[1], H0[2]], { ...gaitPose('dash', 0.25), spine: [42, 0, 0], hipY: -0.1 }, 0.34, 0.34);
    g([H0[0] + 4.0, H0[1], H0[2]], { ...gaitPose('dash', 0.75), spine: [42, 0, 0], hipY: -0.1 }, 0.26, 0.26);
  }
  const trailOp = tau < 0 ? 0 : Math.pow(1 - clamp01(tau / 0.55), 1.3);
  const headX = Math.min(x, 150);
  const e = energy(T);
  const scale = pxPerMetre(base.anchors.chest, cam, H);
  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        <Lighting p={PAL} center={[4, 0, -4.6]} shadowBox={14} rim={false} />
        <Suburb centerX={20} behind={60} ahead={180} lamps={false} />
        {visible && <Stickman s={hero} faceGlow="#b98aff" />}
        {visible && tau < 0 && <EnergyFx3D s={hero} T={T} />}
        {ghosts.map((g, i) => <Stickman key={i} s={g.st} ghostOpacity={g.o} ghostColor="#b07cff" ghostOrder={20 + i * 2} shadowBlob={false} />)}
        {tau >= 0 && (
          <>
            <Trail from={[H0[0] + 0.3, 1.05, H0[2]]} to={[H0[0] + headX, 1.05, H0[2]]} width={0.6} color={PURPLE} opacity={trailOp} camPos={cam.pos} />
            {!visible && <Glow p={[H0[0] + headX, 1.05, H0[2]]} size={1.6} color={LAVENDER} opacity={0.9 * trailOp} />}
            <Shockwave t={tau} origin={[H0[0] + 0.25, H0[1], H0[2]]} maxR={5.5} dur={0.42} />
            <DustBurst t={tau} origin={[H0[0] + 0.1, H0[1], H0[2]]} dir={[-1.0, 0, -0.2]} spread={1.0} speed={3.6} n={40} size={0.17} seed={21} life={1.0} />
            <DustBurst t={tau - 0.03} origin={[H0[0] + 3.0, H0[1], H0[2]]} dir={[1.4, 0, 0]} spread={0.8} speed={2.6} n={22} size={0.13} seed={33} life={0.85} />
            <DustBurst t={tau - 0.06} origin={[H0[0] + 8.0, H0[1], H0[2]]} dir={[1.4, 0, 0]} spread={0.8} speed={2.4} n={18} size={0.13} seed={45} life={0.8} />
            <Leaves t={tau - 0.03} origin={[H0[0] + 2.5, 0.12, -6.3]} area={[3.5, 0.6, 1.0]} push={[17, 3.6, 1.6]} n={30} seed={8} />
            <Leaves t={tau - 0.02} origin={[H0[0] + 1.0, 0.12, -4.2]} area={[2.0, 0.05, 0.8]} push={[12, 2.2, 0.4]} n={10} seed={19} colors={['#f2efe6', '#e8e1d0', '#e2b23f']} />
            <AirStreaks t={tau} center={[H0[0] + 10, 1.0, H0[2]]} n={14} dir={1} speed={90} area={[10, 0.8, 0.8]} opacity={0.55 * trailOp} />
            {/* distant sonic boom where he breaks the sound barrier */}
            <Shockwave t={tau - 0.12} origin={[H0[0] + 18, H0[1], H0[2]]} maxR={3} dur={0.38} air airAxis="x" />
            <Glow p={[H0[0] + 18, 1.05, H0[2]]} size={3.2} color="#ffffff" opacity={tau > 0.12 ? 0.8 * Math.max(0, 1 - (tau - 0.12) / 0.25) : 0} />
          </>
        )}
      </Stage>
      {tau < 0 && <Crackles frame={frame} anchors={toScreen(bodyAnchors(base), cam)} center={project(base.anchors.chest, cam, W, H)} scale={scale} intensity={e * 1.2} seed={5} color={PURPLE} />}
      <Flash t={T} at={E.launch} dur={0.1} color="#ffffff" peak={0.5} />
    </AbsoluteFill>
  );
};

// ---- shot D: tracking at speed -------------------------------------------------------------
const X0 = 300, V = 24;
const heroDX = (T: number) => X0 + V * (T - S.D[0]) + (T > E.exit ? 55 * Math.pow(T - E.exit, 2) : 0);

const ShotD: React.FC<{ T: number; frame: number }> = ({ T }) => {
  applyEnergyLook(T);
  const xc = X0 + V * (T - S.D[0]) + 0.55;
  let cam: CamState = { pos: new THREE.Vector3(xc, 1.05, -0.95), look: new THREE.Vector3(xc, 1.0, -4.6), fov: 34, roll: 0 };
  cam = shake(cam, T, 0.018, 9, 13);
  const phase = 0.1 + 3.9 * (T - S.D[0]);
  const runSpec = (x: number, ph: number): ActorInShot => ({ id: 'hero', pos: [x, H0[1], H0[2]], rot: 90, pose: { ...gaitPose('dash', ph) }, face: F_RUN });
  const xh = heroDX(T);
  const hero = evalActor(runSpec(xh, phase), CAST.hero, T, 3.1);
  const ghosts = [1, 2, 3].map(k => ({ st: evalActor(runSpec(xh - 0.58 * k, phase - 0.09 * k), CAST.hero, T, 3.1), o: [0.42, 0.26, 0.13][k - 1] }));
  const flick = 0.85 + 0.15 * noise1(T * 30, 4);
  const trail: React.ReactNode[] = [];
  for (let i = 0; i < 16; i++) {
    const age = ((T * 2.2 + i / 16) % 1);
    const y = 0.5 + ((i * 37) % 11) / 11 * 1.1;
    trail.push(<mesh key={i} position={[xh - 0.3 - age * 2.4, y, H0[2] + (((i * 53) % 7) / 7 - 0.5) * 0.4]} scale={0.018 * (1 - age)}><sphereGeometry args={[1, 8, 6]} /><meshBasicMaterial color={i % 3 ? LAVENDER : '#ffffff'} toneMapped={false} /></mesh>);
  }
  const hudT = T - E.hud;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="hblur" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="46 0.6" edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: 'url(#hblur)' }}>
        <Stage cam={cam} dpr={1}>
          <Lighting p={PAL} center={[xc, 0, -4.6]} shadowBox={12} rim={false} />
          <Suburb centerX={xc} behind={50} ahead={60} lamps={false} />
        </Stage>
      </AbsoluteFill>
      <SpeedLines t={T} n={30} dir={-1} speed={5600} opacity={0.6} seed={4} band={[0.05, 0.95]} />
      <AbsoluteFill>
        <Stage cam={cam} transparent>
          <Lighting p={PAL} center={[xh, 0, -4.6]} shadowBox={6} sky={false} bg={false} rim={false} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[xh, H0[1] + 0.003, H0[2]]} receiveShadow>
            <planeGeometry args={[12, 6]} />
            <shadowMaterial transparent opacity={0.32} />
          </mesh>
          {ghosts.map((g, i) => <Stickman key={i} s={g.st} ghostOpacity={g.o} ghostColor="#a978ff" ghostOrder={20 + i * 2} shadowBlob={false} />)}
          <Stickman s={hero} faceGlow="#b98aff" shadowBlob={false} />
          <Glow p={hero.anchors.chest.clone().add(new THREE.Vector3(-0.35, 0, 0))} size={[3.2, 2.6]} color={PURPLE} opacity={0.3 * flick} />
          {trail}
        </Stage>
      </AbsoluteFill>
      <SpeedLines t={T + 0.37} n={8} dir={-1} speed={7800} opacity={0.5} seed={12} band={[0.1, 0.9]} />
      <StatCallout t={hudT} big={k => `×${Math.max(1, Math.round(1 + 99 * k))}`} small={k => `${Math.round(15 + 1485 * k).toLocaleString('en-US')} KM/H`} x={110} y={90} size={150} />
      <Flash t={T} at={S.D[0]} dur={0.12} color="#ffffff" peak={0.45} />
    </AbsoluteFill>
  );
};

export const PillSprint: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const f = (s: number) => Math.round(s * fps);
  // keep the shared look uniforms sane for any shot
  LOOK.uDesat.value = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={f(S.A[0])} durationInFrames={f(S.A[1]) - f(S.A[0])}>
        <ShotAB T={T} close={false} frame={frame} />
      </Sequence>
      <Sequence from={f(S.B[0])} durationInFrames={f(S.B[1]) - f(S.B[0])}>
        <ShotAB T={T} close frame={frame} />
      </Sequence>
      <Sequence from={f(S.C[0])} durationInFrames={f(S.C[1]) - f(S.C[0])}>
        <ShotC T={T} frame={frame} />
      </Sequence>
      <Sequence from={f(S.D[0])} durationInFrames={f(S.D[1]) - f(S.D[0])}>
        <ShotD T={T} frame={frame} />
      </Sequence>
      <Grade vignette={0.6} grain={0.03} />
      {withAudio && <Audio src={staticFile('audio/pill_sprint_mix.wav')} />}
    </AbsoluteFill>
  );
};
