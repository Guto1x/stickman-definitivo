// `icon` card: one big line-art icon drawing itself on over a soft gold glow, with a caps caption
// and an optional gold sub-line. Also the `title` card (IFOLOGY episode title on navy or clear).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { CardProps } from './index';
import { Icon } from './icons';
import { C, Caps, GlowDefs, NavyBg, Push, clamp01, easeOut, sBool, sNum, sStr, seg } from './kit';
import { TitleOverlay } from '../overlays/TitleOverlay';

export const IconCard: React.FC<CardProps> = ({ t, dur, spec, W, H }) => {
  const icon = sStr(spec, 'icon', 'question');
  const caption = sStr(spec, 'caption');
  const sub = sStr(spec, 'sub');
  const size = sNum(spec, 'size', 480);
  const cy = caption ? H * 0.42 : H * 0.48;
  const glow = clamp01(t / 0.6);
  const float = Math.sin(t * 1.3) * 6;
  const cap = easeOut(seg(t, 0.3, 0.7));
  const subK = easeOut(seg(t, 0.45, 0.85));
  return (
    <AbsoluteFill>
      <NavyBg t={t} W={W} H={H} cy={42} />
      <Push t={t} dur={dur}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <GlowDefs id="ico" soft={4} />
            <radialGradient id="ico-disc">
              <stop offset="0" stopColor={C.goldHi} stopOpacity={0.17} />
              <stop offset="0.6" stopColor={C.goldHi} stopOpacity={0.05} />
              <stop offset="1" stopColor={C.goldHi} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={W / 2} cy={cy} r={size * (0.75 + 0.05 * Math.sin(t * 1.7)) * (0.85 + 0.15 * glow)} fill="url(#ico-disc)" opacity={glow} />
          <Icon name={icon} x={W / 2} y={cy + float} size={size} p={seg(t, 0, 0.6)} t={t} sw={6} filter="url(#ico-soft)" />
        </svg>
        {caption && (
          <div style={{ position: 'absolute', left: W / 2, top: cy + size * 0.6 + 20, transform: `translate(-50%, ${(1 - cap) * 26}px)`, opacity: cap, textAlign: 'center' }}>
            <Caps text={caption} size={caption.length > 22 ? 70 : 92} spacing={0.14} />
          </div>
        )}
        {sub && (
          <div style={{ position: 'absolute', left: W / 2, top: cy + size * 0.6 + (caption ? 140 : 20), transform: `translate(-50%, ${(1 - subK) * 20}px)`, opacity: subK, textAlign: 'center' }}>
            <Caps text={sub} size={48} spacing={0.16} color={C.goldHi} />
          </div>
        )}
      </Push>
    </AbsoluteFill>
  );
};

export const TitleCard: React.FC<CardProps> = ({ t, dur, spec, W, H }) => {
  const bg = sBool(spec, 'bg', true);
  const big = sStr(spec, 'big', 'WHAT IF?');
  const small = sStr(spec, 'small');
  const icon = sStr(spec, 'icon');
  const out = sBool(spec, 'out', !bg);
  return (
    <AbsoluteFill>
      {bg && <NavyBg t={t} W={W} H={H} />}
      {bg && icon && (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <GlowDefs id="ttl" />
          </defs>
          <Icon name={icon} x={W / 2} y={H * 0.27 + Math.sin(t * 1.3) * 5} size={220} p={seg(t, 0, 0.55)} t={t} sw={4.5} filter="url(#ttl-soft)" />
        </svg>
      )}
      <TitleOverlay
        t={t}
        big={big}
        small={small || undefined}
        dur={out ? dur : undefined}
        compact={0}
        pos={bg ? (icon ? H * 0.43 : 'center') : sStr(spec, 'pos', 'top') === 'center' ? 'center' : 'top'}
        size={sNum(spec, 'size', bg ? 170 : 150)}
        W={W}
        H={H}
      />
    </AbsoluteFill>
  );
};
