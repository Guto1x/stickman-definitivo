// Corner HUD stopwatch (Ifverse "reaction time" look): a white line-art stopwatch whose gold hand
// spins, with a value under it that can change, e.g. "0.25 s" → "0.025 s" (old value flips up and
// away, the new one pops in gold with a ring flash, and the hand slows to match).
//
// Props
//   t           seconds since the HUD appears (nothing for t < 0)
//   from        first value text, e.g. "0.25 s"
//   to          optional second value text, e.g. "0.025 s"
//   switchAt    seconds (since appear) when `from` changes to `to` (default 1.2)
//   corner      'tr' (default) | 'tl' | 'br' | 'bl'
//   size        icon size in px (default 112); the value text scales with it
//   speed       hand revolutions per second (default 1)
//   speedAfter  revolutions per second after the switch (default speed / 10)
//   dur         seconds on screen; fades out over the last 0.3 s (omit = stays)
//   persist     already on screen (a countdown continuing across cuts): no draw-on / value pop-in
//   W, H        frame size (default 1920×1080)
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Icon } from '../cards/icons';
import { C, COND, backOut, clamp01, easeIn, easeOut, seg } from '../cards/kit';

export const Stopwatch: React.FC<{
  t: number; from: string; to?: string; switchAt?: number; corner?: 'tl' | 'tr' | 'bl' | 'br'; size?: number; speed?: number; speedAfter?: number;
  dur?: number; persist?: boolean; tick?: number; keep?: boolean; W?: number; H?: number;
}> = ({ t, from: from0, to, switchAt = 1.2, corner = 'tr', size = 112, speed = 1, speedAfter, dur, persist, tick, keep, W = 1920, H = 1080 }) => {
  if (t < 0) return null;
  // tick: live countdown — `from` ("M:SS") runs down at `tick` story-seconds per second, stopping at 0:00
  let from = from0;
  const mm = tick ? /^(\d+):(\d\d)$/.exec(from0) : null;
  if (mm && tick) {
    const left = Math.max(0, Math.ceil(+mm[1] * 60 + +mm[2] - t * tick));
    from = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  }
  // keep: the countdown continues into the next shot, so don't fade out at the cut
  const outK = dur != null && !keep ? easeIn(seg(t, dur - 0.3, dur)) : 0;
  if (outK >= 1) return null;
  const right = corner === 'tr' || corner === 'br';
  const bottom = corner === 'bl' || corner === 'br';
  const sa = speedAfter ?? speed / 10;
  const hasSwitch = !!to;
  const sw = hasSwitch ? switchAt : Infinity;
  const turns = t <= sw ? speed * t : speed * sw + sa * (t - sw);
  const pad = 70;
  const cx = right ? W - pad - size / 2 : pad + size / 2;
  const cy = bottom ? H - pad - size * 1.2 : pad + size / 2;
  const draw = persist ? 1 : seg(t, 0, 0.4);
  const ds = t >= sw ? t - sw : -1;
  const ring = ds >= 0 ? seg(ds, 0, 0.5) : 0;
  const fontSize = Math.round(size * 0.46);
  const oldK = ds >= 0 ? easeOut(seg(ds, 0, 0.2)) : 0;
  const newK = ds >= 0 ? seg(ds, 0.08, 0.38) : 0;
  const valIn = persist ? 1 : easeOut(seg(t, 0.2, 0.5));

  const valStyle: React.CSSProperties = {
    position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: COND, fontWeight: 700, fontSize, lineHeight: 1, letterSpacing: '0.04em',
    whiteSpace: 'nowrap', textShadow: '0 2px 0 rgba(10,8,25,0.85), 0 0 12px rgba(0,0,0,0.6)',
  };
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: 1 - outK }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.55))' }}>
        <defs>
          <filter id="swhud-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={6} />
          </filter>
          <radialGradient id="swhud-scrim">
            <stop offset="0" stopColor="#080a1e" stopOpacity={0.55} />
            <stop offset="0.6" stopColor="#080a1e" stopOpacity={0.32} />
            <stop offset="1" stopColor="#080a1e" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={cx} cy={cy + size * 0.45} rx={size * 1.25} ry={size * 1.05} fill="url(#swhud-scrim)" opacity={draw} />
        {ring > 0 && ring < 1 && (
          <circle cx={cx} cy={cy + size * 0.07} r={size * (0.36 + 0.4 * easeOut(ring))} fill="none" stroke={C.goldHi} strokeWidth={6 * (1 - ring) + 1} opacity={1 - ring} />
        )}
        {ds >= 0 && <circle cx={cx} cy={cy + size * 0.07} r={size * 0.42} fill={C.goldHi} opacity={0.18 * Math.exp(-ds * 3)} filter="url(#swhud-glow)" />}
        <Icon name="stopwatch" x={cx} y={cy} size={size} p={draw} t={turns * 2} sw={Math.max(3, size * 0.04)} />
      </svg>
      <div style={{ position: 'absolute', left: cx - 200, width: 400, top: cy + size * 0.62, height: fontSize * 1.2 }}>
        <div style={{ ...valStyle, color: persist ? C.goldHi : '#ffffff', opacity: valIn * (1 - oldK), transform: `translateY(${-oldK * fontSize * 0.45 + (1 - valIn) * 10}px)` }}>{from}</div>
        {hasSwitch && newK > 0 && (
          <div
            style={{
              ...valStyle, color: C.goldHi, opacity: clamp01(newK * 3),
              transform: `translateY(${(1 - easeOut(newK)) * fontSize * 0.7}px) scale(${0.7 + 0.3 * backOut(newK, 2.4)})`,
              textShadow: `${valStyle.textShadow}, 0 0 18px rgba(255,190,80,${0.6 * Math.exp(-ds * 2)})`,
            }}
          >
            {to}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
