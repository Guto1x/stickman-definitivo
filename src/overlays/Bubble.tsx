// White rounded speech (or thought) bubble with handwritten text and a tail that points at a screen
// point — usually a character's mouth/head from `project()`. Pops out of the tail tip, bobs gently,
// and shrinks back into the tip at the end.
//
// Props
//   t         seconds since the bubble appears (nothing for t < 0)
//   text      the line (Patrick Hand; wraps at maxWidth)
//   x, y      screen point the tail points to (px)
//   kind      'speech' (default) | 'thought' (rounder bubble, tail of shrinking dots)
//   side      'auto' (default: bubble grows away from the nearer frame edge) | 'left' | 'right'
//   place     'auto' (default: above the point, below when y < 340) | 'above' | 'below'
//   gap       vertical gap between the point and the bubble edge (default 90)
//   size      font size in px (default 46)
//   maxWidth  max bubble text width in px (default 560)
//   dur       seconds on screen; pops back over the last 0.22 s (omit = stays)
//   W, H      frame size (default 1920×1080)
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, HAND, backOut, clamp01, easeIn, f, seg } from '../cards/kit';

export const Bubble: React.FC<{
  t: number; text: string; x: number; y: number; kind?: 'speech' | 'thought'; side?: 'auto' | 'left' | 'right'; place?: 'auto' | 'above' | 'below';
  gap?: number; size?: number; maxWidth?: number; dur?: number; W?: number; H?: number;
}> = ({ t, text, x, y, kind = 'speech', side = 'auto', place = 'auto', gap = 90, size = 46, maxWidth = 560, dur, W = 1920, H = 1080 }) => {
  if (t < 0) return null;
  const outK = dur != null ? easeIn(seg(t, dur - 0.22, dur)) : 0;
  if (outK >= 1) return null;
  const sx = side === 'left' ? -1 : side === 'right' ? 1 : x > W * 0.55 ? -1 : 1; // direction the bubble extends
  const below = place === 'below' || (place === 'auto' && y < 340);
  const sy = below ? 1 : -1;
  const thought = kind === 'thought';

  const pop = backOut(seg(t, 0, 0.3), 2.2) * (1 - outK);
  const textIn = clamp01((t - 0.04) / 0.1);
  const bob = Math.sin(t * 2.1) * 3;

  const ax = x - sx * 70; // near vertical edge of the bubble
  const by = y + sy * gap; // bubble edge nearest the point
  const b1 = ax + sx * 52, b2 = ax + sx * 122; // tail base on that edge
  const inset = sy * 9; // tuck the tail base inside the bubble
  const tail = thought
    ? null
    : `M${f(b1)},${f(by + inset)} Q${f((b1 + x) / 2 + sx * 6)},${f((by + y) / 2)} ${f(x)},${f(y)} Q${f((b2 + x) / 2 + sx * 18)},${f((by + y) / 2 - sy * 8)} ${f(b2)},${f(by + inset)} Z`;
  const dots = thought
    ? [0.28, 0.58, 0.86].map((k, i) => ({ cx: x + (ax + sx * 90 - x) * k, cy: y + (by - y) * k, r: 7 + i * 5 }))
    : [];

  const box: React.CSSProperties = {
    position: 'absolute',
    [sx > 0 ? 'left' : 'right']: sx > 0 ? ax : W - ax,
    [below ? 'top' : 'bottom']: below ? by : H - by,
    minWidth: 210, maxWidth: maxWidth + 2 * 36, padding: thought ? '30px 46px' : '22px 36px',
    background: '#fffdf8', borderRadius: thought ? 999 : 38,
    fontFamily: HAND, fontSize: size, lineHeight: 1.12, color: C.ink, textAlign: 'center',
    boxShadow: 'inset 0 -5px 0 rgba(40,30,80,0.08)',
  };
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none', transform: `translateY(${bob}px) scale(${pop})`, transformOrigin: `${x}px ${y}px`,
        filter: 'drop-shadow(0 6px 0 rgba(20,14,40,0.28)) drop-shadow(0 10px 18px rgba(0,0,0,0.35))', opacity: clamp01(t / 0.06),
      }}
    >
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {tail && <path d={tail} fill="#fffdf8" />}
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#fffdf8" opacity={clamp01((t - i * 0.06) / 0.12)} />
        ))}
      </svg>
      <div style={box}>
        <span style={{ opacity: textIn }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};
