// "Visual beats" (house rule 2026-11-09, from the Vitinho reference): something changes on screen every
// 1–2 s even without a cut. Small 2D effects drawn in the 1920×1080 overlay layer:
//   emote      a mark on a character's head: sweat, tears, ?, !, music notes, sparkles, anger, hearts, zzz
//   circle     a highlight ring that draws itself around a detail (a head, a hand, a point)
//   flyin      objects that fly through the frame (calendar pages, clocks, papers, money, hearts, stars, books)
//   timewarp   time passing: calendar pages and clocks swirl while the light flickers day ↔ night
//   spotlight  the frame goes dark except a pool of light on a character or point
// Every one of them has an automatic sound (tools/sfx/episode_audio.py), so no visual event is silent.
import React from 'react';
import { AbsoluteFill } from 'remotion';

const W = 1920, H = 1080;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const easeOutBack = (x: number) => { const c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; };
const rnd = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

/** Pop-in scale (overshoot) and fade-out at the end. */
const life = (t: number, dur: number) => {
  const pin = t < 0.22 ? easeOutBack(clamp(t / 0.22)) : 1;
  const out = 1 - clamp((t - (dur - 0.2)) / 0.2);
  return { s: Math.max(0, pin), o: clamp(t / 0.06) * out };
};

export type EmoteKind = 'sweat' | 'tears' | 'question' | 'exclaim' | 'notes' | 'sparkle' | 'anger' | 'love' | 'zzz';

/** A mark on a head. (x, y) = projected head top, `px` = pixels per metre at the head. */
export const Emote: React.FC<{ t: number; kind: EmoteKind; x: number; y: number; px: number; dur?: number }> = ({ t, kind, x, y, px, dur = 1.6 }) => {
  const { s, o } = life(t, dur);
  const R = 0.21 * px; // head radius on screen
  const cy = y + R * 1.15; // head centre
  const stroke = Math.max(3, R * 0.06);
  const ink = '#111';
  const wrap = (child: React.ReactNode, ox: number, oy: number) => (
    <div style={{ position: 'absolute', left: ox, top: oy, transform: `translate(-50%, -50%) scale(${s})`, opacity: o }}>{child}</div>
  );
  switch (kind) {
    case 'sweat': {
      const slide = clamp(t / dur) * R * 0.5;
      const d = R * 0.42;
      return wrap(<svg width={d} height={d * 1.4} viewBox="0 0 10 14"><path d="M5 0 C7 4 10 7 10 9.5 A5 5 0 0 1 0 9.5 C0 7 3 4 5 0Z" fill="#7cc8ff" stroke={ink} strokeWidth={0.9} /><ellipse cx={3.4} cy={9} rx={1.1} ry={1.8} fill="#fff" opacity={0.8} /></svg>, x + R * 0.95, cy - R * 0.55 + slide);
    }
    case 'tears': {
      const drops = [0, 0.35, 0.7].map(k => {
        const u = ((t * 1.6 + k) % 1);
        return <circle key={k} cx={k * 6 % 3} cy={u * 26} r={1.6 * (1 - u * 0.3)} fill="#7cc8ff" stroke={ink} strokeWidth={0.4} opacity={1 - u} />;
      });
      return <>
        {wrap(<svg width={R * 0.5} height={R * 1.6} viewBox="-2 -2 6 30">{drops}</svg>, x - R * 0.5, cy + R * 0.85)}
        {wrap(<svg width={R * 0.5} height={R * 1.6} viewBox="-2 -2 6 30">{drops}</svg>, x + R * 0.5, cy + R * 0.85)}
      </>;
    }
    case 'question':
    case 'exclaim': {
      const bob = Math.sin(t * 7) * R * 0.05;
      const ch = kind === 'question' ? '?' : '!';
      return wrap(
        <div style={{ fontFamily: 'Arial Black, Arial', fontWeight: 900, fontSize: R * 1.15, color: kind === 'question' ? '#ffd23f' : '#ff4d4d', WebkitTextStroke: `${stroke}px ${ink}`, paintOrder: 'stroke fill', transform: `rotate(${kind === 'question' ? 12 : -8}deg)` }}>{ch}</div>,
        x + R * 0.95, y - R * 0.35 + bob,
      );
    }
    case 'notes':
    case 'love':
    case 'zzz':
    case 'sparkle': {
      const n = kind === 'sparkle' ? 5 : 3;
      const r = rnd(kind.length * 97);
      const items = Array.from({ length: n }, (_, k) => {
        const ph = k / n, u = ((t / 1.4 + ph) % 1);
        const ox = x + R * (0.7 + 0.35 * r()) * (k % 2 ? 1 : -0.4) + Math.sin((t + k) * 3) * R * 0.08;
        const oy = y + R * 0.2 - u * R * 1.3;
        const sz = R * (0.38 + 0.15 * r());
        const op = Math.sin(Math.PI * u) * o;
        const glyph = kind === 'notes' ? (k % 2 ? '♪' : '♫') : kind === 'love' ? '♥' : kind === 'zzz' ? 'Z' : '✦';
        const col = kind === 'notes' ? '#7a5cff' : kind === 'love' ? '#ff4f7b' : kind === 'zzz' ? '#9fd0ff' : '#ffe27a';
        return (
          <div key={k} style={{ position: 'absolute', left: ox, top: oy, transform: `translate(-50%, -50%) scale(${s * (kind === 'sparkle' ? 0.6 + 0.6 * Math.sin(Math.PI * u) : 1)})`, opacity: op, fontFamily: 'Arial Black, Arial', fontWeight: 900, fontSize: sz, color: col, WebkitTextStroke: `${stroke * 0.7}px ${ink}`, paintOrder: 'stroke fill' }}>{glyph}</div>
        );
      });
      return <>{items}</>;
    }
    case 'anger': {
      const pulse = 1 + 0.12 * Math.sin(t * 14);
      return wrap(
        <svg width={R * 0.7 * pulse} height={R * 0.7 * pulse} viewBox="-10 -10 20 20">
          {[0, 90, 180, 270].map(a => <path key={a} d="M2 -9 C2 -3 3 -2 9 -2" fill="none" stroke="#ff3b3b" strokeWidth={3.2} strokeLinecap="round" transform={`rotate(${a})`} />)}
        </svg>,
        x + R * 0.8, y + R * 0.2,
      );
    }
    default:
      return null;
  }
};

/** A ring that draws itself around (x, y), then pulses. */
export const HighlightCircle: React.FC<{ t: number; x: number; y: number; r: number; color?: string; dur?: number }> = ({ t, x, y, r, color = '#ff3b3b', dur = 1.6 }) => {
  const draw = clamp(t / 0.35);
  const out = 1 - clamp((t - (dur - 0.2)) / 0.2);
  const pulse = 1 + 0.04 * Math.sin(t * 9) * clamp((t - 0.35) / 0.2);
  const c = 2 * Math.PI * r;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, opacity: out }} width={W} height={H}>
      <circle cx={x} cy={y} r={r * pulse} fill="rgba(255,59,59,0.10)" stroke="#000" strokeWidth={14} strokeDasharray={`${c * draw} ${c}`} transform={`rotate(-90 ${x} ${y})`} strokeLinecap="round" />
      <circle cx={x} cy={y} r={r * pulse} fill="none" stroke={color} strokeWidth={9} strokeDasharray={`${c * draw} ${c}`} transform={`rotate(-90 ${x} ${y})`} strokeLinecap="round" />
    </svg>
  );
};

// ---- flying objects ----
export type FlyKind = 'calendar' | 'clock' | 'paper' | 'money' | 'heart' | 'star' | 'book';
const Sprite: React.FC<{ kind: FlyKind; size: number; seed: number }> = ({ kind, size, seed }) => {
  const ink = '#1a1a1a';
  switch (kind) {
    case 'calendar':
      return (
        <svg width={size} height={size * 1.1} viewBox="0 0 40 44">
          <rect x={2} y={4} width={36} height={38} rx={4} fill="#fff" stroke={ink} strokeWidth={2.5} />
          <rect x={2} y={4} width={36} height={11} rx={4} fill="#e23d3d" stroke={ink} strokeWidth={2.5} />
          <text x={20} y={36} fontSize={18} fontWeight={900} textAnchor="middle" fontFamily="Arial Black, Arial" fill={ink}>{1 + (seed * 7) % 30}</text>
        </svg>
      );
    case 'clock': {
      const a = seed * 47;
      return (
        <svg width={size} height={size} viewBox="0 0 40 40">
          <circle cx={20} cy={20} r={17} fill="#fff" stroke={ink} strokeWidth={3} />
          <line x1={20} y1={20} x2={20 + 9 * Math.sin(a)} y2={20 - 9 * Math.cos(a)} stroke={ink} strokeWidth={3} strokeLinecap="round" />
          <line x1={20} y1={20} x2={20 + 13 * Math.sin(a * 3)} y2={20 - 13 * Math.cos(a * 3)} stroke="#e23d3d" strokeWidth={2} strokeLinecap="round" />
        </svg>
      );
    }
    case 'paper':
      return <svg width={size} height={size * 1.3} viewBox="0 0 30 39"><path d="M2 2 H22 L28 8 V37 H2Z" fill="#fff" stroke={ink} strokeWidth={2} />{[12, 18, 24, 30].map(y => <line key={y} x1={7} y1={y} x2={23} y2={y} stroke="#9aa" strokeWidth={2} />)}</svg>;
    case 'money':
      return <svg width={size * 1.6} height={size * 0.8} viewBox="0 0 48 24"><rect x={1} y={1} width={46} height={22} rx={3} fill="#7ccf6b" stroke={ink} strokeWidth={2} /><circle cx={24} cy={12} r={6} fill="#bfe8a8" stroke={ink} strokeWidth={1.5} /><text x={24} y={16} fontSize={10} fontWeight={900} textAnchor="middle" fill={ink}>$</text></svg>;
    case 'book':
      return <svg width={size * 1.2} height={size} viewBox="0 0 36 30"><rect x={2} y={3} width={32} height={24} rx={2} fill="#3d6fb6" stroke={ink} strokeWidth={2.5} /><rect x={6} y={6} width={24} height={4} fill="#f2b632" /></svg>;
    case 'heart':
      return <div style={{ fontSize: size, color: '#ff4f7b', WebkitTextStroke: `2px ${ink}`, fontFamily: 'Arial Black, Arial', lineHeight: 1 }}>♥</div>;
    default:
      return <div style={{ fontSize: size, color: '#ffd23f', WebkitTextStroke: `2px ${ink}`, fontFamily: 'Arial Black, Arial', lineHeight: 1 }}>★</div>;
  }
};

/** Objects crossing the frame: from a side, falling from the top, or swirling around the centre. */
export const FlyIn: React.FC<{ t: number; kinds: FlyKind[]; n?: number; from?: 'left' | 'right' | 'top' | 'swirl'; dur?: number; seed?: number }> = ({ t, kinds, n = 9, from = 'swirl', dur = 1.6, seed = 3 }) => {
  const r = rnd(seed * 131 + 7);
  const items = Array.from({ length: n }, (_, k) => {
    const delay = r() * 0.35, u = clamp((t - delay) / (dur - delay));
    if (u <= 0 || u >= 1) { r(); r(); r(); return null; }
    const kind = kinds[k % kinds.length], size = 70 + 70 * r(), lane = r(), spin = (r() - 0.5) * 900;
    let x = 0, y = 0;
    if (from === 'swirl') {
      const a = lane * Math.PI * 2 + u * Math.PI * 2.2, rad = 120 + 520 * u;
      x = W / 2 + Math.cos(a) * rad * 1.3; y = H / 2 + Math.sin(a) * rad * 0.8;
    } else if (from === 'top') {
      x = 260 + lane * (W - 520); y = -150 + u * (H + 300);
    } else {
      const dir = from === 'left' ? 1 : -1;
      x = W / 2 - dir * (W / 2 + 200) + dir * u * (W + 400); y = 160 + lane * (H - 320) - Math.sin(u * Math.PI) * 80;
    }
    return (
      <div key={k} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${spin * u}deg)`, filter: 'drop-shadow(0 6px 4px rgba(0,0,0,0.35))' }}>
        <Sprite kind={kind} size={size} seed={k + seed} />
      </div>
    );
  });
  return <AbsoluteFill style={{ pointerEvents: 'none' }}>{items}</AbsoluteFill>;
};

/** Time passing: calendar pages and clocks swirl while the light flickers between night and day. */
export const TimeWarp: React.FC<{ t: number; dur?: number }> = ({ t, dur = 1.8 }) => {
  const phase = Math.floor(t / 0.22) % 2;
  const k = Math.sin(Math.PI * clamp(t / dur));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: phase ? 'rgba(18,24,70,0.55)' : 'rgba(255,190,90,0.22)', opacity: k, mixBlendMode: phase ? 'multiply' : 'screen' }} />
      <FlyIn t={t} kinds={['calendar', 'clock', 'calendar']} n={12} from="swirl" dur={dur} seed={11} />
    </AbsoluteFill>
  );
};

/** Darkness everywhere except a soft pool of light at (x, y). */
export const Spotlight: React.FC<{ t: number; x: number; y: number; r: number; dim?: number; dur?: number }> = ({ t, x, y, r, dim = 0.8, dur = 2 }) => {
  const k = clamp(t / 0.25) * (1 - clamp((t - (dur - 0.25)) / 0.25));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,0) ${r * 0.75}px, rgba(0,0,0,${dim}) ${r * 1.35}px)`, opacity: k }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${r * 0.9}px ${r * 2.2}px at ${x}px ${y - r * 1.4}px, rgba(255,245,210,0.18), rgba(255,245,210,0) 70%)` }} />
    </AbsoluteFill>
  );
};
