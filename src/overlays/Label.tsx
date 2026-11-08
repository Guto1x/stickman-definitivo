// Chapter tag in a corner over a 3D shot: small cream condensed caps with a gold tick, typed on
// (typewriter with a gold cursor) or slid in. "RULE 3", "DAY 1", "EARTH. EARLIER THAT NIGHT."
//
// Props
//   t        seconds since the label appears (nothing for t < 0)
//   text     the tag text (rendered in caps)
//   corner   'tl' (default) | 'tr' | 'bl' | 'br'
//   mode     'type' (default, typewriter) | 'slide'
//   dur      seconds on screen; slides/fades out over the last 0.3 s (omit = stays)
//   size     font size in px (default 46)
//   accent   tick/cursor colour (default gold)
//   W, H     frame size (default 1920×1080)
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, COND, clamp01, easeIn, easeOut, seg } from '../cards/kit';

export const Label: React.FC<{
  t: number; text: string; corner?: 'tl' | 'tr' | 'bl' | 'br'; mode?: 'type' | 'slide'; dur?: number; size?: number; accent?: string; W?: number; H?: number;
}> = ({ t, text, corner = 'tl', mode = 'type', dur, size = 46, accent = C.goldHi, W = 1920, H = 1080 }) => {
  if (t < 0) return null;
  const right = corner === 'tr' || corner === 'br';
  const bottom = corner === 'bl' || corner === 'br';
  const chars = Array.from(text.toUpperCase());
  const outK = dur != null ? easeIn(seg(t, dur - 0.3, dur)) : 0;
  if (outK >= 1) return null;

  const bar = easeOut(seg(t, 0, 0.18));
  const typeStart = 0.12;
  const cps = Math.max(22, chars.length / 0.7); // whole tag typed in ≤ 0.7 s
  const typed = mode === 'type' ? Math.floor(clamp01((t - typeStart) * cps / chars.length) * chars.length + 1e-6) : chars.length;
  const typingDone = typeStart + chars.length / cps;
  const cursorOn = mode === 'type' && t < typingDone + 0.9 && (t < typingDone || Math.floor((t - typingDone) * 3.4) % 2 === 0);
  const slide = mode === 'slide' ? easeOut(seg(t, 0.08, 0.45)) : 1;

  const shadow = `0 2px 0 rgba(10,8,25,0.85), 0 0 14px rgba(0,0,0,0.55), 0 0 3px rgba(0,0,0,0.6)`;
  const tick = (
    <div
      style={{
        position: 'relative', width: Math.max(5, size * 0.12), height: size * 1.05 * bar, borderRadius: 4, background: accent, alignSelf: 'center',
        boxShadow: `0 0 10px rgba(255,200,90,0.55), 0 2px 0 rgba(10,8,25,0.7)`,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute', [right ? 'right' : 'left']: 86, [bottom ? 'bottom' : 'top']: 76,
          display: 'flex', flexDirection: right ? 'row-reverse' : 'row', alignItems: 'center', gap: size * 0.38,
          opacity: 1 - outK, transform: `translateX(${(right ? 1 : -1) * outK * 40}px)`,
        }}
      >
        {/* soft dark scrim so cream text reads over bright daytime shots */}
        <div
          style={{
            position: 'absolute', [right ? 'right' : 'left']: -size * 0.9, top: -size * 0.5, bottom: -size * 0.5,
            width: `calc(${(100 * Math.max(typed, 1)) / chars.length}% + ${size * 2.4}px)`,
            background: `linear-gradient(${right ? 270 : 90}deg, rgba(8,10,30,0.42) 0%, rgba(8,10,30,0.3) 60%, rgba(8,10,30,0) 100%)`,
            filter: `blur(${size * 0.3}px)`, opacity: bar, borderRadius: size,
          }}
        />
        {tick}
        <div style={{ position: 'relative', overflow: 'hidden', padding: '6px 4px', margin: '-6px -4px' }}>
          <div
            style={{
              fontFamily: COND, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: '0.2em', color: '#fff8ea', whiteSpace: 'nowrap',
              textShadow: shadow, transform: `translateX(${(1 - slide) * (right ? 1 : -1) * 110}%)`, textAlign: right ? 'right' : 'left',
            }}
          >
            {chars.map((ch, i) => (
              <React.Fragment key={i}>
                <span style={{ opacity: i < typed ? 1 : 0 }}>{ch}</span>
                {cursorOn && i === typed - 1 && <Cursor size={size} color={accent} />}
              </React.Fragment>
            ))}
            {cursorOn && typed === 0 && <Cursor size={size} color={accent} />}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Cursor: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <span style={{ position: 'relative', display: 'inline-block', width: 0 }}>
    <span style={{ position: 'absolute', left: size * 0.06, top: -size * 0.82, width: size * 0.09, height: size * 0.9, background: color, boxShadow: '0 0 8px rgba(255,200,90,0.6)' }} />
  </span>
);
