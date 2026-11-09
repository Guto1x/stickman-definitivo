// IFOLOGY episode title for laying over an establishing shot (or a navy card):
//   small cream serif line   "WHAT IF YOU COULD"
//   big gold gradient serif  "STOP TIME?"   (letters pop up in a quick stagger, then a shimmer)
//
// 9:16 opening: the title first appears COMPACT — the small line and the big line broken into two
// balanced lines, everything inside a 540 px column at the centre — so a vertical short cut by hand from
// the 16:9 video can use it. After `compact` seconds every word glides and resizes into the one-line
// 16:9 layout (~1 s: sideways first, then the rows close). Words are measured with the real font (canvas measureText), so both layouts are exact.
//
// Props
//   t       seconds since the title appears (nothing is drawn for t < 0)
//   big     the big gold line (required)
//   small   the small cream line above it (optional)
//   dur     seconds the title stays; it animates out over the last `out` s (omit = stays forever)
//   out     out-animation length (default 0.4)
//   pos     'top' (default, IFOLOGY placement over 3D) | 'center' | number (top of block in px)
//   size    big-line font size in px (default 150; long lines shrink to fit 84% of the width)
//   compact seconds held in the 9:16 layout before growing (default: until the letters land, ≥ 1.6 s;
//           0 = start in the 16:9 layout)
//   W, H    frame size (default 1920×1080)
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GoldText, SERIF, clamp01, easeIn, easeOut, seg } from '../cards/kit';

const COLUMN = 540; // px: compact layout width, inside the 608 px 9:16 column
const BIG_SP = 0.025; // GoldText letter spacing (em) used here
const SMALL_SP = 0.06;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// width of `text` at 100 px in the serif, plus per-glyph letter spacing (em); cached
const cache = new Map<string, number>();
let ctx: CanvasRenderingContext2D | null = null;
function w100(text: string, spacing: number): number {
  const key = `${text}|${spacing}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  ctx ||= document.createElement('canvas').getContext('2d');
  let w = Array.from(text).length * 0.62 * 100; // fallback estimate
  if (ctx) {
    ctx.font = `100px ${SERIF}`;
    w = ctx.measureText(text).width;
  }
  w += Array.from(text).length * spacing * 100;
  // only cache once the web font is in (a fallback-font measure would stick)
  if (typeof document === 'undefined' || !document.fonts || document.fonts.check(`100px ${SERIF}`)) cache.set(key, w);
  return w;
}

type Box = { x: number; y: number; size: number }; // left/top of the word, font size
type Word = { text: string; big: boolean; offset: number; wide: Box; tight: Box };

function layout(big: string, small: string | undefined, bigSize: number, smallSize: number, top: number, W: number): Word[] {
  const out: Word[] = [];
  const bw = big.split(/\s+/).filter(Boolean);
  const sw = (small || '').split(/\s+/).filter(Boolean);
  const space = (sizePx: number, _sp: number) => 0.3 * sizePx; // fixed word gap: a measured ' ' came out narrower than the rendered one
  const lineW = (ws: string[], sizePx: number, sp: number) => ws.reduce((a, x) => a + w100(x, sp) * (sizePx / 100), 0) + Math.max(0, ws.length - 1) * space(sizePx, sp);
  const place = (ws: string[], sizePx: number, sp: number, y: number, into: Box[]) => {
    let x = W / 2 - lineW(ws, sizePx, sp) / 2;
    for (const word of ws) { into.push({ x, y, size: sizePx }); x += w100(word, sp) * (sizePx / 100) + space(sizePx, sp); }
  };
  // 16:9: small line over one big line
  const wideS: Box[] = [], wideB: Box[] = [];
  place(sw, smallSize, SMALL_SP, top, wideS);
  const bigTop = sw.length ? top + smallSize * 1.18 : top;
  place(bw, bigSize, BIG_SP, bigTop, wideB);
  // 9:16: big line split in two balanced lines; both lines and the small line fit the column
  let best = bw.length, bestW = Infinity;
  for (let k = 1; k < bw.length; k++) {
    const m = Math.max(lineW(bw.slice(0, k), 100, BIG_SP), lineW(bw.slice(k), 100, BIG_SP));
    if (m < bestW) { bestW = m; best = k; }
  }
  const rows = bw.length > 1 ? [bw.slice(0, best), bw.slice(best)] : [bw];
  const cBig = Math.min(bigSize, (COLUMN / Math.max(...rows.map(r => lineW(r, 100, BIG_SP)))) * 100);
  const cSmall = Math.min(Math.max(smallSize * 0.9, cBig * 0.42), sw.length ? (COLUMN / lineW(sw, 100, SMALL_SP)) * 100 : smallSize);
  const tightS: Box[] = [], tightB: Box[] = [];
  place(sw, cSmall, SMALL_SP, top, tightS);
  let y = sw.length ? top + cSmall * 1.18 : top;
  for (const r of rows) { place(r, cBig, BIG_SP, y, tightB); y += cBig * 1.14; }
  let off = 0;
  sw.forEach((text, i) => out.push({ text, big: false, offset: 0, wide: wideS[i], tight: tightS[i] }));
  bw.forEach((text, i) => { out.push({ text, big: true, offset: off, wide: wideB[i], tight: tightB[i] }); off += Array.from(text).length + 1; });
  return out;
}

export const TitleOverlay: React.FC<{
  t: number; big: string; small?: string; dur?: number; out?: number; pos?: 'top' | 'center' | number; size?: number; compact?: number; W?: number; H?: number;
}> = ({ t, big, small, dur, out = 0.4, pos = 'top', size = 150, compact, W = 1920, H = 1080 }) => {
  if (t < 0) return null;
  const chars = Array.from(big).length;
  const bigSize = Math.min(size, (W * 0.84) / Math.max(1, chars * 0.62));
  const smallSize = Math.max(34, Math.round(bigSize * 0.36));
  const step = Math.min(0.04, 0.32 / Math.max(1, chars));
  const smallIn = easeOut(seg(t, 0, 0.35));
  const bigEnd = 0.1 + chars * step + 0.32;
  const shimmerK = seg(t, bigEnd + 0.25, bigEnd + 1.05);
  const shimmer = shimmerK > 0 && shimmerK < 1 ? -0.25 + 1.5 * shimmerK : null;
  const life = dur ?? 8;
  const drift = 1 + 0.035 * clamp01(t / Math.max(2, life));
  const o = dur != null ? 1 - easeIn(seg(t, dur - out, dur)) : 1;
  if (o <= 0.001) return null;
  const lift = dur != null ? -14 * easeIn(seg(t, dur - out, dur)) : 0;
  const top = pos === 'top' ? H * 0.085 : pos === 'center' ? H * 0.5 - (bigSize + smallSize * 1.4) / 2 : pos;
  const hold = compact ?? Math.max(1.6, bigEnd + 0.5);
  // 0 = 9:16 layout, 1 = 16:9 layout. Words slide sideways to their final x while the rows are still apart,
  // then the rows close vertically, so a word never runs over the other row on the way.
  const gx = hold > 0 ? easeInOut(seg(t, hold, hold + 0.6)) : 1;
  const gy = hold > 0 ? easeInOut(seg(t, hold + 0.35, hold + 0.95)) : 1;
  const gs = hold > 0 ? easeInOut(seg(t, hold, hold + 0.95)) : 1;
  const words = layout(big, small, bigSize, smallSize, top, W);
  const lerp = (a: number, b: number, g: number) => a + (b - a) * g;
  const smallShadow = (s: number) => `0 ${Math.max(2, s * 0.07)}px 0 ${C.shadow}, 0 4px 14px rgba(0,0,0,0.55)`;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${lift}px) scale(${drift})`, transformOrigin: `${W / 2}px ${top}px`, opacity: o }}>
        {words.map((wd, i) => {
          const x = lerp(wd.tight.x, wd.wide.x, gx), y = lerp(wd.tight.y, wd.wide.y, gy), s = lerp(wd.tight.size, wd.wide.size, gs);
          if (!wd.big) {
            return (
              <div key={i} style={{
                position: 'absolute', left: x, top: y, fontFamily: SERIF, fontSize: s, lineHeight: 1, color: C.creamSoft, whiteSpace: 'nowrap',
                letterSpacing: `${SMALL_SP}em`, opacity: smallIn, transform: `translateY(${(1 - smallIn) * -14}px)`, textShadow: smallShadow(s),
              }}>{wd.text}</div>
            );
          }
          const nw = Array.from(wd.text).length;
          const sh = shimmer == null ? null : (shimmer * Math.max(1, chars - 1) - wd.offset) / Math.max(1, nw - 1);
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y }}>
              <GoldText text={wd.text} size={s} tabular={false} spacing={BIG_SP} shimmer={sh} stagger={{ t, start: 0.1 + wd.offset * step, step, dur: 0.32 }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
