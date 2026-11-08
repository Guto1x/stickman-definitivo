// IFOLOGY-style stat callout: chunky gold serif number with a cream condensed label.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { loadFont as loadSerif } from '@remotion/google-fonts/BreeSerif';
import { loadFont as loadCond } from '@remotion/google-fonts/BarlowCondensed';

const serif = loadSerif('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;
const cond = loadCond('normal', { weights: ['700', '800'], subsets: ['latin'] }).fontFamily;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const backOut = (x: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export const StatCallout: React.FC<{
  t: number; // seconds since the callout starts
  big: (k: number) => string; // value text for count-up progress k (0..1)
  small?: (k: number) => string;
  countDur?: number;
  x?: number; y?: number;
  align?: 'left' | 'center' | 'right';
  size?: number;
}> = ({ t, big, small, countDur = 0.35, x = 120, y = 110, align = 'left', size = 150 }) => {
  if (t < 0) return null;
  const pop = backOut(clamp01(t / 0.22));
  const k = clamp01(t / countDur);
  const kk = 1 - Math.pow(1 - k, 3);
  const line = clamp01((t - 0.12) / 0.25);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute', left: x, top: y, transform: `translate(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'}, 0) scale(${0.6 + 0.4 * pop})`,
          transformOrigin: align === 'left' ? 'left center' : 'center', opacity: clamp01(t / 0.08), textAlign: align,
        }}
      >
        <div
          style={{
            fontFamily: serif, fontSize: size, lineHeight: 0.95, letterSpacing: 2,
            background: 'linear-gradient(180deg, #fff1c2 0%, #ffd56b 45%, #f0a531 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            filter: 'drop-shadow(0 5px 0 rgba(46,18,84,0.95)) drop-shadow(0 12px 22px rgba(0,0,0,0.5))',
          }}
        >
          {big(kk)}
        </div>
        <div style={{ height: 6, marginTop: 10, width: `${line * 100}%`, background: 'linear-gradient(90deg,#ffd56b,#f0a531)', borderRadius: 3, boxShadow: '0 3px 0 rgba(40,16,70,0.8)' }} />
        {small && (
          <div style={{ fontFamily: cond, fontWeight: 800, fontSize: size * 0.36, letterSpacing: 5, color: '#fff6e2', marginTop: 10, textShadow: '0 3px 0 rgba(46,18,84,0.95), 0 0 18px rgba(20,8,40,0.7)' }}>
            {small(kk)}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
