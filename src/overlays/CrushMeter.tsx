// Pink heart badge with a percentage floating above a character's head: how much they like the hero.
// Anchored with `project()` like Bubble. Counts from `from` to `value` over `countDur`, pops in,
// bobs gently, and pulses when the number climbs. 0% draws a dim, hollow heart.
//
// Props
//   t         seconds since the badge appears (nothing for t < 0)
//   x, y      screen point above the head (px), from project(headTop)
//   value     target percentage 0..100
//   from      starting percentage (default: value, i.e. no count)
//   countDur  seconds for the count (default 0.9)
//   scale     px per metre at the head, so far-away badges shrink
//   dur       seconds on screen; shrinks out over the last 0.2 s (omit = stays)
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COND, backOut, clamp01, easeIn, easeOut, seg } from '../cards/kit';

const HEART = 'M12 21.3l-1.4-1.3C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.6 11.5L12 21.3z';

export const CrushMeter: React.FC<{
  t: number; x: number; y: number; value: number; from?: number; countDur?: number; scale?: number; dur?: number;
}> = ({ t, x, y, value, from, countDur = 0.9, scale = 400, dur }) => {
  if (t < 0) return null;
  const outK = dur != null ? easeIn(seg(t, dur - 0.2, dur)) : 0;
  if (outK >= 1) return null;
  const start = from ?? value;
  const k = easeOut(seg(t, 0.15, 0.15 + countDur));
  const v = Math.round(start + (value - start) * k);
  const rising = value > start && k > 0 && k < 1;
  const pop = backOut(seg(t, 0, 0.28), 2.4) * (1 - outK);
  const pulse = rising ? 1 + 0.08 * Math.sin(t * 22) : 1;
  const size = Math.max(30, Math.min(58, scale * 0.11)); // number px, shrinks with distance
  const empty = v <= 0;
  const pink = empty ? '#c9b8c4' : '#ff4f9a';
  const bob = Math.sin(t * 2.3) * 3;
  const top = Math.max(y - size * 0.55 + bob, size * 1.45 + 14); // keep the whole badge inside the frame when the head is near the top
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: clamp01(t / 0.06) }}>
      <div
        style={{
          position: 'absolute', left: x, top, transform: `translate(-50%, -100%) scale(${pop * pulse})`, transformOrigin: '50% 100%',
          display: 'flex', alignItems: 'center', gap: size * 0.18, padding: `${size * 0.12}px ${size * 0.34}px ${size * 0.12}px ${size * 0.22}px`,
          background: empty ? 'rgba(40,30,48,0.78)' : 'rgba(58,14,40,0.82)', borderRadius: 999,
          border: `${Math.max(2, size * 0.06)}px solid ${pink}`,
          boxShadow: empty ? '0 4px 12px rgba(0,0,0,0.35)' : `0 0 ${size * 0.5}px rgba(255,79,154,0.75), 0 4px 12px rgba(0,0,0,0.35)`,
          whiteSpace: 'nowrap',
        }}
      >
        <svg width={size * 0.95} height={size * 0.95} viewBox="0 0 24 24">
          <path d={HEART} fill={empty ? 'none' : pink} stroke={pink} strokeWidth={empty ? 2 : 0.5} />
        </svg>
        <span style={{ fontFamily: COND, fontWeight: 800, fontSize: size, lineHeight: 1, color: empty ? '#d9cdd5' : '#ffffff', letterSpacing: 1 }}>
          {v}%
        </span>
      </div>
    </AbsoluteFill>
  );
};
