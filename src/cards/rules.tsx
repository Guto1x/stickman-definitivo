// `rules` card: a "RULE 1 / 2 / 3" list that reveals row by row; then the current rule is boxed in
// gold and the others dim.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { CardProps } from './index';
import { IconSvg } from './icons';
import { C, Caps, GoldText, NavyBg, Push, clamp01, easeOut, sNum, sStr, seg } from './kit';

type Rule = { text: string; icon?: string };

export const RulesCard: React.FC<CardProps> = ({ t, dur, spec, W, H }) => {
  const raw = Array.isArray(spec.rules) ? (spec.rules as unknown[]) : [];
  const rules: Rule[] = raw.slice(0, 6).map(r => (typeof r === 'string' ? { text: r } : (r as Rule)));
  const n = Math.max(1, rules.length);
  const current = Math.round(sNum(spec, 'current', 0)); // 1-based, 0 = none
  const title = sStr(spec, 'title');
  const prefix = sStr(spec, 'prefix', 'RULE');
  const hasIcons = rules.some(r => r.icon);

  const rowH = n <= 3 ? 170 : n === 4 ? 140 : 118;
  const textSize = n <= 3 ? 68 : n === 4 ? 60 : 52;
  const tagSize = n <= 3 ? 76 : n === 4 ? 66 : 58;
  const top = (title ? 650 : H / 2) - ((n - 1) * rowH) / 2;
  const left = 330;
  const rowAt = (i: number) => 0.15 + i * 0.2;
  const revealed = rowAt(n - 1) + 0.35;
  const hl = current > 0 && current <= n ? easeOut(seg(t, revealed + 0.1, revealed + 0.45)) : 0;

  return (
    <AbsoluteFill>
      <NavyBg t={t} W={W} H={H} />
      <Push t={t} dur={dur}>
        {title && (
          <div style={{ position: 'absolute', left: W / 2, top: 120, transform: 'translateX(-50%)', textAlign: 'center', opacity: easeOut(seg(t, 0, 0.35)) }}>
            <Caps text={title} size={72} spacing={0.16} />
            <div style={{ height: 6, width: 160 * easeOut(seg(t, 0.15, 0.5)), margin: '16px auto 0', borderRadius: 3, background: C.gold }} />
          </div>
        )}
        {rules.map((r, i) => {
          const y = top + i * rowH;
          const k = easeOut(seg(t, rowAt(i), rowAt(i) + 0.35));
          const isCur = i + 1 === current;
          const dimK = current > 0 && !isCur ? hl : 0;
          const dimmed = 1 - 0.5 * dimK;
          const sc = isCur ? 1 + 0.05 * hl : 1 - 0.03 * hl * (current > 0 ? 1 : 0);
          const panelW = W - left * 2 + 80;
          return (
            <div key={i} style={{ position: 'absolute', left, top: y, transform: `translate(${(1 - k) * -60}px, -50%) scale(${sc})`, transformOrigin: 'left center', opacity: k * dimmed, filter: dimK > 0.01 ? `saturate(${1 - 0.7 * dimK})` : undefined }}>
              {isCur && hl > 0 && (
                <div
                  style={{
                    position: 'absolute', left: -50, top: '50%', width: panelW * hl, height: rowH * 0.86, transform: 'translateY(-50%)', borderRadius: 18,
                    background: 'linear-gradient(90deg, rgba(255,213,107,0.16), rgba(255,213,107,0.04) 70%, rgba(255,213,107,0))',
                    border: `2.5px solid rgba(255,213,107,${0.75 * hl})`, borderRight: 'none',
                    boxShadow: `0 0 ${40 * hl}px rgba(255,200,90,${0.25 * hl}), inset 0 0 30px rgba(255,213,107,${0.08 * hl})`,
                  }}
                >
                  <div style={{ position: 'absolute', left: -2, top: 10, bottom: 10, width: 9, borderRadius: 5, background: C.goldHi, boxShadow: `0 0 16px ${C.gold}` }} />
                </div>
              )}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 44 }}>
                <div style={{ minWidth: tagSize * 3.9, display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <GoldText text={`${prefix} ${i + 1}`} size={tagSize} tabular={false} spacing={0.03} />
                </div>
                {hasIcons && (
                  <div style={{ width: rowH * 0.62, height: rowH * 0.62, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {r.icon && <IconSvg name={r.icon} size={rowH * 0.62} p={seg(t, rowAt(i) + 0.05, rowAt(i) + 0.5)} t={t} sw={3.5} />}
                  </div>
                )}
                <Caps
                  text={r.text}
                  size={r.text.length > 34 ? textSize * 0.82 : textSize}
                  spacing={0.08}
                  weight={isCur ? 800 : 700}
                  color={isCur ? '#fffaf0' : C.cream}
                  style={{ whiteSpace: 'normal', maxWidth: hasIcons ? 1000 : 1100, lineHeight: 1.05, opacity: clamp01(0.85 + 0.15 * hl) }}
                />
              </div>
            </div>
          );
        })}
      </Push>
    </AbsoluteFill>
  );
};
