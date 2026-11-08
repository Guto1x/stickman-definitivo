// `stat` card: one big gold serif number that counts up, a unit beside it, a cream caps label under a
// gold rule, and an optional line-art icon on the left (IFOLOGY "14,000 CALORIES").
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { CardProps } from './index';
import { Icon } from './icons';
import {
  C, Caps, GlowDefs, GoldText, NavyBg, Push, backOut, clamp01, countText, decimalsOf, easeOut, isNumeric, sNum, sStr, seg, serifWidth,
} from './kit';

export const StatCard: React.FC<CardProps> = ({ t, dur, spec, W, H }) => {
  const icon = sStr(spec, 'icon');
  const raw = spec.value ?? 0;
  const numeric = isNumeric(raw);
  const to = sNum(spec, 'value', 0);
  const from = sNum(spec, 'from', 0);
  const decimals = spec.decimals != null ? sNum(spec, 'decimals', 0) : Math.max(decimalsOf(raw), decimalsOf(spec.from));
  const prefix = sStr(spec, 'prefix');
  const unit = sStr(spec, 'unit');
  const label = sStr(spec, 'label');
  const countDur = sNum(spec, 'countDur', Math.min(1.1, Math.max(0.5, dur * 0.3)));

  const c0 = 0.15;
  const valueText = numeric ? countText(t, from, to, c0, countDur, decimals) : String(raw);
  const finalText = numeric ? countText(1e9, from, to, 0, 1, decimals) : String(raw);
  const big = `${prefix}${valueText}`;
  const hasIcon = !!icon;
  const blockLeft = hasIcon ? 790 : W / 2;
  const maxW = hasIcon ? W - blockLeft - 170 : W - 260;
  // fit number + unit on one line
  const est = (s: number) => serifWidth(prefix + finalText, s) + (unit ? s * 0.12 + serifWidth(unit, s * 0.46) : 0);
  const size = Math.round(Math.min(250, (250 * maxW) / est(250)));
  const unitSize = Math.round(size * 0.46);

  const pop = backOut(seg(t, 0.05, 0.4), 1.6);
  const done = c0 + countDur;
  const settle = Math.exp(-Math.pow((t - done - 0.08) / 0.09, 2)) * 0.05;
  const shimmerK = seg(t, done, done + 0.7);
  const shimmer = shimmerK > 0 && shimmerK < 1 ? -0.2 + 1.4 * shimmerK : null;
  const rule = easeOut(seg(t, 0.3, 0.75));
  const lab = easeOut(seg(t, 0.4, 0.85));

  const iconX = 490, iconY = H * 0.5, iconSize = 380;
  const align = hasIcon ? 'flex-start' : 'center';
  const glowK = clamp01(t / 0.6);

  return (
    <AbsoluteFill>
      <NavyBg t={t} W={W} H={H} cx={hasIcon ? 34 : 50} />
      <Push t={t} dur={dur}>
        {hasIcon && (
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <GlowDefs id="stat" />
              <radialGradient id="stat-disc">
                <stop offset="0" stopColor={C.goldHi} stopOpacity={0.16} />
                <stop offset="1" stopColor={C.goldHi} stopOpacity={0} />
              </radialGradient>
            </defs>
            <circle cx={iconX} cy={iconY} r={300 * (0.9 + 0.1 * glowK) + 6 * Math.sin(t * 1.6)} fill="url(#stat-disc)" opacity={glowK} />
            <Icon name={icon} x={iconX} y={iconY} size={iconSize} p={seg(t, 0, 0.65)} t={t} sw={5} filter="url(#stat-soft)" />
          </svg>
        )}
        <div
          style={{
            position: 'absolute', left: blockLeft, top: H * 0.5, transform: `translate(${hasIcon ? '0' : '-50%'}, -50%)`,
            display: 'flex', flexDirection: 'column', alignItems: align,
          }}
        >
          <div
            style={{
              display: 'flex', alignItems: 'baseline', gap: size * 0.12,
              transform: `scale(${(0.55 + 0.45 * pop) * (1 + settle)})`, transformOrigin: hasIcon ? 'left 70%' : 'center 70%', opacity: clamp01(t / 0.1),
            }}
          >
            <GoldText text={big} size={size} shimmer={shimmer} />
            {unit && <GoldText text={unit} size={unitSize} tabular={false} spacing={0.04} shimmer={shimmer} />}
          </div>
          <div
            style={{
              height: 7, width: rule * (hasIcon ? 620 : 560), marginTop: size * 0.1, borderRadius: 4,
              background: hasIcon ? `linear-gradient(90deg, ${C.goldHi}, ${C.gold} 70%, rgba(240,180,76,0))` : `linear-gradient(90deg, rgba(240,180,76,0), ${C.goldHi} 25%, ${C.goldHi} 75%, rgba(240,180,76,0))`,
              alignSelf: hasIcon ? 'flex-start' : 'center', boxShadow: '0 3px 0 rgba(6,9,28,0.8)',
            }}
          />
          {label && (
            <Caps
              text={label}
              size={label.length > 26 ? 56 : 70}
              spacing={0.14}
              style={{ marginTop: 26, opacity: lab, transform: `translateY(${(1 - lab) * 24}px)`, textAlign: hasIcon ? 'left' : 'center' }}
            />
          )}
        </div>
      </Push>
    </AbsoluteFill>
  );
};
