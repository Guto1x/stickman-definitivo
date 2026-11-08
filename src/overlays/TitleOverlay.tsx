// IFOLOGY episode title for laying over an establishing shot (or a navy card):
//   small cream serif line   "WHAT IF YOU COULD"
//   big gold gradient serif  "STOP TIME?"   (letters pop up in a quick stagger, then a shimmer)
//
// Props
//   t       seconds since the title appears (nothing is drawn for t < 0)
//   big     the big gold line (required)
//   small   the small cream line above it (optional)
//   dur     seconds the title stays; it animates out over the last `out` s (omit = stays forever)
//   out     out-animation length (default 0.4)
//   pos     'top' (default, IFOLOGY placement over 3D) | 'center' | number (top of block in px)
//   size    big-line font size in px (default 150; long lines shrink to fit 84% of the width)
//   W, H    frame size (default 1920×1080)
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GoldText, SERIF, clamp01, easeIn, easeOut, seg } from '../cards/kit';

export const TitleOverlay: React.FC<{
  t: number; big: string; small?: string; dur?: number; out?: number; pos?: 'top' | 'center' | number; size?: number; W?: number; H?: number;
}> = ({ t, big, small, dur, out = 0.4, pos = 'top', size = 150, W = 1920, H = 1080 }) => {
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

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute', left: W / 2, top, transform: `translate(-50%, ${lift}px) scale(${drift})`, transformOrigin: 'center top',
          display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o,
        }}
      >
        {small && (
          <div
            style={{
              fontFamily: SERIF, fontSize: smallSize, lineHeight: 1, color: C.creamSoft, whiteSpace: 'nowrap',
              letterSpacing: `${0.06 + 0.1 * (1 - smallIn)}em`, opacity: smallIn, transform: `translateY(${(1 - smallIn) * -14}px)`,
              textShadow: `0 ${Math.max(2, smallSize * 0.07)}px 0 ${C.shadow}, 0 4px 14px rgba(0,0,0,0.55)`, marginBottom: smallSize * 0.18,
            }}
          >
            {small}
          </div>
        )}
        <GoldText text={big} size={bigSize} tabular={false} spacing={0.025} shimmer={shimmer} stagger={{ t, start: 0.1, step, dur: 0.32 }} />
      </div>
    </AbsoluteFill>
  );
};
