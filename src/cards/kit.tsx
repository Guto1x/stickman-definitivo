// Shared kit for the IFOLOGY navy explainer cards and the 2D overlays: fonts, palette, easing,
// spec readers, the navy background, gold serif text and stroke draw-on helpers.
// Everything is a pure function of `t` (seconds), so any frame renders on its own.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { loadFont as loadSerif } from '@remotion/google-fonts/BreeSerif';
import { loadFont as loadCond } from '@remotion/google-fonts/BarlowCondensed';
import { loadFont as loadHand } from '@remotion/google-fonts/PatrickHand';

export const SERIF = loadSerif('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;
export const COND = loadCond('normal', { weights: ['600', '700', '800'], subsets: ['latin'] }).fontFamily;
export const HAND = loadHand('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;

// ---------- palette ----------
export const C = {
  navyC: '#1f2b58', // card centre
  navyM: '#162048',
  navyE: '#0b1130', // card edges
  line: '#f5f3ee', // line-art white
  lineDim: 'rgba(245,243,238,0.42)',
  cream: '#fff3dc', // condensed caps labels
  creamSoft: '#f6e7c6', // small serif title line
  gold: '#f0b44c',
  goldHi: '#ffd56b',
  goldLight: '#fff1c2',
  goldDeep: '#e9972c',
  red: '#ff7a6b',
  ink: '#1d1830', // text on white bubbles
  shadow: 'rgba(30,12,60,0.95)', // dark purple drop shadow (matches Stat.tsx)
  navyShadow: 'rgba(6,9,28,0.9)',
};
export const GOLD_GRAD = 'linear-gradient(180deg, #fff1c2 0%, #ffd56b 45%, #f0a531 100%)';

// ---------- maths / easing ----------
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0..1 progress of t through the window [a, b]. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(1e-6, b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeIn = (x: number) => Math.pow(clamp01(x), 3);
export const easeInOut = (x: number) => {
  const k = clamp01(x);
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
};
export const backOut = (x: number, s = 1.70158) => {
  const k = clamp01(x) - 1;
  return 1 + (s + 1) * k * k * k + s * k * k;
};
/** Damped spring settle 0→1 (slight overshoot), for pops. */
export const spring01 = (x: number) => {
  const k = Math.max(0, x);
  return 1 - Math.exp(-6 * k) * Math.cos(9 * k);
};
export function rng(seed: number) {
  let s = (Math.floor(seed * 7919) ^ 0x9e3779b9) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- spec readers (episode.json is loosely typed) ----------
type Spec = Record<string, unknown>;
export const sNum = (s: Spec, k: string, d: number): number => {
  const v = s[k];
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && isFinite(Number(v.replace(/,/g, '')))) return Number(v.replace(/,/g, ''));
  return d;
};
export const sStr = (s: Spec, k: string, d = ''): string => (s[k] == null ? d : String(s[k]));
export const sBool = (s: Spec, k: string, d: boolean): boolean => (s[k] == null ? d : s[k] === true || s[k] === 'true' || s[k] === 1);
export const sArr = <T,>(s: Spec, k: string): T[] => (Array.isArray(s[k]) ? (s[k] as T[]) : []);
export const isNumeric = (v: unknown) =>
  typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && isFinite(Number(v.replace(/,/g, ''))));

/** Decimal places a value was written with ("0.25" → 2). */
export const decimalsOf = (v: unknown): number => {
  const s = String(v ?? '');
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
};
export const fmtNum = (v: number, decimals = 0) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
/** Count-up value text: eases from `from` to `to` over [start, start+dur]. */
export const countText = (t: number, from: number, to: number, start: number, dur: number, decimals = 0) => {
  const k = seg(t, start, start + dur);
  const e = 1 - Math.pow(1 - k, 3.2);
  const v = k >= 1 ? to : from + (to - from) * e;
  return fmtNum(v, decimals);
};

// ---------- background ----------
/** IFOLOGY navy card background: radial navy, drifting dust motes, soft vignette. */
export const NavyBg: React.FC<{ t: number; W?: number; H?: number; seed?: number; motes?: number; cx?: number; cy?: number }> = ({
  t, W = 1920, H = 1080, seed = 7, motes = 44, cx = 50, cy = 46,
}) => {
  const r = rng(seed);
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < motes; i++) {
    const x0 = r() * W, y0 = r() * H;
    const vx = (r() - 0.35) * 14, vy = -(4 + r() * 10);
    const size = 1.1 + r() * r() * 3.2;
    const ph = r() * 6.28, tw = 0.6 + r() * 1.4;
    const x = ((x0 + vx * t) % W + W) % W;
    const y = ((y0 + vy * t) % H + H) % H;
    const o = (0.1 + r() * 0.28) * (0.65 + 0.35 * Math.sin(ph + t * tw));
    dots.push(<circle key={i} cx={x} cy={y} r={size} fill={i % 5 === 0 ? '#ffe6b0' : '#cfdcff'} opacity={o} />);
  }
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 85% at ${cx}% ${cy}%, ${C.navyC} 0%, ${C.navyM} 48%, ${C.navyE} 100%)` }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        {dots}
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(3,5,18,0.45) 100%)' }} />
    </AbsoluteFill>
  );
};

/** Slow push-in plus a faint breath, so held cards never look dead. Wrap the card content. */
export const Push: React.FC<{ t: number; dur: number; amount?: number; children: React.ReactNode; ox?: number; oy?: number }> = ({
  t, dur, amount = 0.03, children, ox = 50, oy = 50,
}) => {
  const k = clamp01(t / Math.max(0.5, dur));
  const s = 1 + amount * easeInOut(k) * 0.8 + amount * 0.2 * k + 0.003 * Math.sin(t * 1.7);
  return <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${ox}% ${oy}%` }}>{children}</AbsoluteFill>;
};

// ---------- SVG strokes ----------
/** A path that draws on with stroke-dashoffset (p: 0..1). */
export const Stroke: React.FC<{
  d: string; p?: number; color?: string; w?: number; opacity?: number; fill?: string; fillOpacity?: number; dash?: string; cap?: 'round' | 'butt';
  transform?: string; filter?: string;
}> = ({ d, p = 1, color = C.line, w = 3, opacity = 1, fill, fillOpacity = 1, dash, cap = 'round', transform, filter }) => {
  if (p <= 0.001) return null;
  const drawing = p < 0.999;
  return (
    <g transform={transform} filter={filter} opacity={opacity}>
      {fill && <path d={d} fill={fill} opacity={fillOpacity * clamp01((p - 0.6) / 0.4)} stroke="none" />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap={cap}
        strokeLinejoin="round"
        pathLength={drawing ? 1 : undefined}
        strokeDasharray={drawing ? '1 1' : dash}
        strokeDashoffset={drawing ? 1 - p : undefined}
      />
    </g>
  );
};

export const circlePath = (cx: number, cy: number, r: number, startDeg = -90) => {
  // full circle as two arcs, starting at startDeg (screen angle, -90 = top), clockwise
  const a = (startDeg * Math.PI) / 180;
  const x0 = cx + r * Math.cos(a), y0 = cy + r * Math.sin(a);
  const x1 = cx - r * Math.cos(a), y1 = cy - r * Math.sin(a);
  return `M${f(x0)},${f(y0)} A${f(r)},${f(r)} 0 1 1 ${f(x1)},${f(y1)} A${f(r)},${f(r)} 0 1 1 ${f(x0)},${f(y0)}`;
};
export const arcPath = (cx: number, cy: number, r: number, a0Deg: number, a1Deg: number) => {
  const a0 = (a0Deg * Math.PI) / 180, a1 = (a1Deg * Math.PI) / 180;
  const large = Math.abs(a1Deg - a0Deg) > 180 ? 1 : 0;
  const sweep = a1Deg > a0Deg ? 1 : 0;
  return `M${f(cx + r * Math.cos(a0))},${f(cy + r * Math.sin(a0))} A${f(r)},${f(r)} 0 ${large} ${sweep} ${f(cx + r * Math.cos(a1))},${f(cy + r * Math.sin(a1))}`;
};
export const f = (n: number) => (Math.round(n * 100) / 100).toString();

/**
 * Glow filters: <GlowDefs id="x"/> inside <defs>, then filter="url(#x-soft)" / "url(#x-gold)".
 * The "-softU" / "-goldU" variants use a frame-sized user-space region: use them on straight
 * horizontal/vertical lines (zero-height bounding boxes make bbox-relative filters vanish).
 */
export const GlowDefs: React.FC<{ id: string; soft?: number; gold?: number; W?: number; H?: number }> = ({ id, soft = 3, gold = 9, W = 1920, H = 1080 }) => (
  <>
    <filter id={`${id}-softU`} filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
      <feGaussianBlur stdDeviation={soft} result="b" />
      <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.45 0" result="bb" />
      <feMerge>
        <feMergeNode in="bb" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id={`${id}-goldU`} filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
      <feGaussianBlur stdDeviation={gold} result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation={soft} result="b" />
      <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.45 0" result="bb" />
      <feMerge>
        <feMergeNode in="bb" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id={`${id}-gold`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={gold} result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </>
);

// ---------- text ----------
/**
 * Chunky gold serif text (Bree Serif, gold gradient, dark drop shadow). Digits get fixed widths so
 * count-ups don't jitter. `shimmer` (0..1 or null) runs a highlight across the letters.
 */
export const GoldText: React.FC<{
  text: string; size: number; shimmer?: number | null; tabular?: boolean; spacing?: number; shadow?: string; style?: React.CSSProperties;
  stagger?: { t: number; start?: number; step?: number; dur?: number } | null;
}> = ({ text, size, shimmer = null, tabular = true, spacing = 0.02, shadow = C.shadow, style, stagger = null }) => {
  const chars = Array.from(text);
  const n = chars.length;
  return (
    <div
      style={{
        fontFamily: SERIF, fontSize: size, lineHeight: 1, letterSpacing: `${spacing}em`, whiteSpace: 'nowrap', display: 'inline-block',
        filter: `drop-shadow(0 ${Math.max(2, size * 0.035)}px 0 ${shadow}) drop-shadow(0 ${size * 0.08}px ${size * 0.14}px rgba(0,0,0,0.45))`,
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const digit = /[0-9]/.test(ch);
        const boost = shimmer == null ? 0 : 0.55 * Math.exp(-Math.pow((i / Math.max(1, n - 1) - shimmer) / 0.11, 2));
        let o = 1, dy = 0, sc = 1;
        if (stagger) {
          const st = (stagger.start ?? 0) + i * (stagger.step ?? 0.035);
          const k = seg(stagger.t, st, st + (stagger.dur ?? 0.32));
          o = clamp01(k * 2.5);
          dy = (1 - backOut(k, 2.2)) * size * 0.35;
          sc = 0.7 + 0.3 * backOut(k, 2.2);
        }
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', width: tabular && digit ? '0.6em' : undefined, textAlign: 'center',
              background: GOLD_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              filter: boost > 0.01 ? `brightness(${1 + boost})` : undefined,
              opacity: o, transform: stagger ? `translateY(${dy}px) scale(${sc})` : undefined, transformOrigin: '50% 80%',
            }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        );
      })}
    </div>
  );
};

/** Cream condensed caps label (Barlow Condensed 800). */
export const Caps: React.FC<{ text: string; size: number; color?: string; spacing?: number; weight?: number; style?: React.CSSProperties; shadow?: boolean }> = ({
  text, size, color = C.cream, spacing = 0.12, weight = 800, style, shadow = true,
}) => (
  <div
    style={{
      fontFamily: COND, fontWeight: weight, fontSize: size, lineHeight: 1.05, letterSpacing: `${spacing}em`, color, textTransform: 'uppercase',
      whiteSpace: 'nowrap', textShadow: shadow ? `0 ${Math.max(2, size * 0.05)}px 0 ${C.navyShadow}, 0 0 ${size * 0.3}px rgba(5,8,25,0.6)` : undefined,
      ...style,
    }}
  >
    {text}
  </div>
);

/** Rough rendered width of Bree Serif text in px (digits use GoldText's fixed 0.6em). */
export const serifWidth = (text: string, size: number) => {
  let w = 0;
  for (const ch of text) {
    if (/[0-9]/.test(ch)) w += 0.6;
    else if (/[.,:;'!]/.test(ch)) w += 0.3;
    else if (ch === ' ') w += 0.27;
    else if (/[A-Z?%$×]/.test(ch)) w += 0.62;
    else w += 0.52;
  }
  return w * size;
};
