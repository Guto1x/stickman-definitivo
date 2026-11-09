// Lower-third "viral video" bar over a 3D shot: a red tag ("TRENDING"), the headline in white caps
// on a dark band, and a gold ticker line under it (view counts, channel). Slides in from the left.
//
// Props
//   t         seconds since the bar appears (nothing for t < 0)
//   headline  the video title / headline
//   ticker    small line under it, e.g. "2,000,000 VIEWS · FILMED BY THEO"
//   tag       red tag text (default "TRENDING")
//   dur       seconds on screen; slides out over the last 0.3 s (omit = stays)
//   safe      centred and wrapped to the 9:16 centre column (a hand-cut vertical short keeps it); rises in instead
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, COND, easeIn, easeOut, seg } from '../cards/kit';

export const NewsBar: React.FC<{ t: number; headline: string; ticker?: string; tag?: string; dur?: number; safe?: boolean }> = ({ t, headline, ticker, tag = 'TRENDING', dur, safe }) => {
  if (t < 0) return null;
  const outK = dur != null ? easeIn(seg(t, dur - 0.3, dur)) : 0;
  if (outK >= 1) return null;
  const inK = easeOut(seg(t, 0, 0.35));
  const tickK = easeOut(seg(t, 0.25, 0.55));
  const x = -900 * (1 - inK) - 900 * outK;
  if (safe) {
    // 9:16-safe: a centred card, 560 px wide, headline wrapped; rises in and drops out
    const dy = 140 * (1 - inK) + 140 * outK;
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: 960 - 280, width: 560, bottom: 110, transform: `translateY(${dy}px)`, opacity: Math.min(1, inK * 2) * (1 - outK), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#e03a2f', color: '#fff', fontFamily: COND, fontWeight: 800, fontSize: 34, letterSpacing: '0.06em', padding: '6px 18px', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>{tag.toUpperCase()}</div>
          <div style={{ background: 'rgba(14,16,30,0.92)', color: '#fff', fontFamily: COND, fontWeight: 700, fontSize: 50, lineHeight: 1.08, letterSpacing: '0.02em', padding: '10px 24px', textAlign: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>{headline.toUpperCase()}</div>
          {ticker && (
            <div style={{ opacity: tickK, background: 'rgba(14,16,30,0.78)', color: C.goldHi, fontFamily: COND, fontWeight: 600, fontSize: 28, letterSpacing: '0.08em', padding: '6px 18px', textAlign: 'center' }}>{ticker.toUpperCase()}</div>
          )}
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 90 + x, bottom: 120, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'stretch', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
          <div style={{ background: '#e03a2f', color: '#fff', fontFamily: COND, fontWeight: 800, fontSize: 34, letterSpacing: '0.06em', padding: '10px 18px' }}>{tag.toUpperCase()}</div>
          <div style={{ background: 'rgba(14,16,30,0.92)', color: '#fff', fontFamily: COND, fontWeight: 700, fontSize: 52, letterSpacing: '0.02em', padding: '6px 26px', whiteSpace: 'nowrap' }}>{headline.toUpperCase()}</div>
        </div>
        {ticker && (
          <div style={{ opacity: tickK, transform: `translateX(${(1 - tickK) * -30}px)`, background: 'rgba(14,16,30,0.78)', color: C.goldHi, fontFamily: COND, fontWeight: 600, fontSize: 30, letterSpacing: '0.08em', padding: '6px 18px' }}>{ticker.toUpperCase()}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};
