// "Palavra-destaque": the key word of a line pops in big on its spoken cue, centred, always inside the
// 9:16 centre column (608 of 1920 px) so a hand-cut vertical short keeps it. Yellow by default (the
// payoff colour), white for setup words. Long text shrinks and wraps to stay in the column.
//
// Props
//   t      seconds since the word appears (nothing for t < 0)
//   text   the word(s), shown in caps
//   color  'yellow' (default) | 'white' | 'red' | any CSS colour
//   y      'low' (default, under the faces) | 'top' | 'mid'
//   dur    seconds on screen; shrinks away over the last 0.2 s (default 1.5)
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, COND, backOut, easeIn, seg } from '../cards/kit';

const COLORS: Record<string, string> = { yellow: C.goldHi, white: '#ffffff', red: '#ff5a4a' };
export const KEYWORD_COLUMN = 560; // px: text box width, inside the 608 px 9:16 column

export const KeyWord: React.FC<{ t: number; text: string; color?: string; y?: 'low' | 'top' | 'mid'; dur?: number; W?: number; H?: number }> = ({
  t, text, color = 'yellow', y = 'low', dur = 1.5, W = 1920, H = 1080,
}) => {
  if (t < 0) return null;
  const outK = easeIn(seg(t, dur - 0.2, dur));
  if (outK >= 1) return null;
  const up = text.toUpperCase();
  // condensed caps run ~0.5 em per glyph: size the longest line to the column, capped at 150 px
  const longest = Math.max(...up.split(/\s+/).map(w => w.length), Math.min(up.length, 9));
  const size = Math.round(Math.min(150, KEYWORD_COLUMN / (0.52 * longest)));
  const popK = seg(t, 0, 0.22);
  const scale = (0.35 + 0.65 * backOut(popK, 2.6)) * (1 - 0.35 * outK);
  const cy = y === 'top' ? H * 0.2 : y === 'mid' ? H * 0.5 : H * 0.76;
  const fill = COLORS[color] || color;
  const ink = 'rgba(10,8,25,0.95)';
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute', left: W / 2 - KEYWORD_COLUMN / 2, width: KEYWORD_COLUMN, top: cy, transform: `translateY(-50%) scale(${scale}) rotate(${-2.5 * (1 - popK)}deg)`,
          opacity: Math.min(1, popK * 4) * (1 - outK), textAlign: 'center', fontFamily: COND, fontWeight: 800, fontSize: size, lineHeight: 0.98,
          letterSpacing: '0.02em', color: fill, WebkitTextStroke: `${Math.max(4, size * 0.07)}px ${ink}`, paintOrder: 'stroke fill',
          textShadow: `0 ${size * 0.06}px 0 ${ink}, 0 0 ${size * 0.25}px rgba(0,0,0,0.55)`,
        }}
      >
        {up}
      </div>
    </AbsoluteFill>
  );
};
