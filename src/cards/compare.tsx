// `compare` card: "NORMAL vs YOU". Two rows (or three with `middle`), each a line-art figure, a caps label and
// a bar that grows to its value; values count up at the bar tips and the winner's bar turns gold and glows.
// A row's `at` (seconds, or a word cue resolved by the episode) delays its reveal to the spoken line.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { CardProps } from './index';
import { Icon } from './icons';
import {
  C, COND, Caps, GlowDefs, GoldText, NavyBg, Push, backOut, clamp01, countText, decimalsOf, easeOut, fmtNum, sBool, sNum, sStr, seg,
} from './kit';

type Side = { label?: string; value?: number | string; unit?: string; icon?: string; display?: string; at?: number };

export const CompareCard: React.FC<CardProps> = ({ t, dur, spec, W, H }) => {
  const sides: Side[] = [(spec.left as Side) || {}, ...(spec.middle ? [spec.middle as Side] : []), (spec.right as Side) || {}];
  const n = sides.length;
  const unit = sStr(spec, 'unit');
  const title = sStr(spec, 'title');
  const lowerWins = sBool(spec, 'lowerWins', false);
  const vals = sides.map(s => sNum(s as Record<string, unknown>, 'value', 0));
  const max = Math.max(1e-9, ...vals.map(Math.abs));
  const best = lowerWins ? Math.min(...vals) : Math.max(...vals);
  const winner = vals.filter(v => v === best).length > 1 ? -1 : vals.indexOf(best);
  const defIcons = n === 3 ? ['walk', 'run', 'run'] : ['walk', 'run'];
  const off = sides.map((s, i) => (typeof s.at === 'number' ? Math.max(0, s.at - 0.35) : i * 0.12)); // reveal offset per row

  const trackX = 520, trackW = 900, barH = 50;
  const rowsY = n === 3 ? (title ? [400, 615, 830] : [330, 560, 790]) : title ? [470, 760] : [400, 700];
  const iconSize = n === 3 ? 170 : 230;
  const grow0 = 0.35, growDur = 0.9;
  const settled = grow0 + growDur + 0.15 + Math.max(...off);
  const win = easeOut(seg(t, settled, settled + 0.35));

  return (
    <AbsoluteFill>
      <NavyBg t={t} W={W} H={H} />
      <Push t={t} dur={dur}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <GlowDefs id="cmp" gold={12} />
            <linearGradient id="cmp-goldfill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={C.goldLight} />
              <stop offset="0.45" stopColor={C.goldHi} />
              <stop offset="1" stopColor="#f0a531" />
            </linearGradient>
            <linearGradient id="cmp-white" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
              <stop offset="1" stopColor="#c9d2ee" stopOpacity={0.85} />
            </linearGradient>
          </defs>
          {sides.map((s, i) => {
            const y = rowsY[i];
            const appear = seg(t, 0.05 + off[i], 0.5 + off[i]);
            const track = easeOut(seg(t, 0.15 + off[i], 0.5 + off[i]));
            const g = easeOut(seg(t, grow0 + off[i], grow0 + growDur + off[i]));
            const frac = Math.max(0.012, Math.abs(vals[i]) / max);
            const fillW = trackW * frac * g;
            const isWin = i === winner;
            const wk = isWin ? win : 0;
            const pulse = isWin ? 0.5 + 0.5 * Math.sin((t - settled) * 3.2) : 0;
            return (
              <g key={i} opacity={i === winner || winner < 0 ? 1 : 1 - 0.3 * win}>
                <Icon name={s.icon || defIcons[i]} x={330} y={y - 30} size={iconSize} p={appear} t={t + i * 0.4} sw={4.5} filter="url(#cmp-soft)" />
                <rect x={trackX} y={y - barH / 2} width={trackW * track} height={barH} rx={barH / 2} fill="rgba(255,255,255,0.045)" stroke="rgba(245,243,238,0.16)" strokeWidth={2} />
                {isWin && wk > 0 && (
                  <rect x={trackX} y={y - barH / 2} width={fillW} height={barH} rx={barH / 2} fill={C.goldHi} opacity={(0.45 + 0.25 * pulse) * wk} filter="url(#cmp-goldU)" />
                )}
                {fillW > 1 && (
                  <>
                    <rect x={trackX} y={y - barH / 2} width={Math.max(barH * 0.6, fillW)} height={barH} rx={barH / 2} fill="url(#cmp-white)" opacity={1 - wk} />
                    <rect x={trackX} y={y - barH / 2} width={Math.max(barH * 0.6, fillW)} height={barH} rx={barH / 2} fill="url(#cmp-goldfill)" opacity={wk} />
                    <rect x={trackX + 14} y={y - barH / 2 + 8} width={Math.max(0, Math.max(barH * 0.6, fillW) - 28)} height={7} rx={3.5} fill="#ffffff" opacity={0.35} />
                  </>
                )}
              </g>
            );
          })}
        </svg>
        {title && (
          <div style={{ position: 'absolute', left: W / 2, top: 150, transform: 'translateX(-50%)', textAlign: 'center', opacity: easeOut(seg(t, 0, 0.35)) }}>
            <Caps text={title} size={72} spacing={0.16} />
            <div style={{ height: 6, width: 160 * easeOut(seg(t, 0.15, 0.5)), margin: '16px auto 0', borderRadius: 3, background: C.gold }} />
          </div>
        )}
        {sides.map((s, i) => {
          const y = rowsY[i];
          const lab = easeOut(seg(t, 0.1 + off[i], 0.45 + off[i]));
          const g = easeOut(seg(t, grow0 + off[i], grow0 + growDur + off[i]));
          const frac = Math.max(0.012, Math.abs(vals[i]) / max);
          const tipX = trackX + Math.max(30, trackW * frac * g);
          const raw = s.value ?? 0;
          const dec = decimalsOf(raw);
          const txt = s.display ?? countText(t, 0, vals[i], grow0 + off[i], growDur, dec);
          const u = s.unit ?? unit;
          const isWin = i === winner;
          const wk = isWin ? win : 0;
          const valOp = clamp01((t - grow0 - off[i]) / 0.15);
          const pop = 1 + 0.12 * Math.exp(-Math.pow((t - settled - 0.1) / 0.12, 2)) * (isWin ? 1 : 0);
          const shimmerK = seg(t, settled, settled + 0.7);
          return (
            <React.Fragment key={i}>
              <Caps
                text={s.label || (i === 0 ? 'NORMAL' : i === n - 1 ? 'YOU' : '')}
                size={n === 3 ? 48 : 54}
                spacing={0.16}
                color={isWin && wk > 0.5 ? C.goldHi : C.cream}
                style={{ position: 'absolute', left: trackX + 6, top: y - barH / 2 - 76, opacity: lab, transform: `translateX(${(1 - lab) * -30}px)` }}
              />
              <div
                style={{
                  position: 'absolute', left: tipX + 30, top: y, transform: `translateY(-55%) scale(${backOut(clamp01(valOp * 1.5), 2) * pop})`, transformOrigin: 'left center',
                  opacity: valOp, display: 'flex', alignItems: 'baseline', gap: 14,
                }}
              >
                {isWin ? (
                  <GoldText text={txt} size={96} shimmer={shimmerK > 0 && shimmerK < 1 ? -0.2 + 1.4 * shimmerK : null} />
                ) : (
                  <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 84, color: C.cream, lineHeight: 1, textShadow: `0 4px 0 ${C.navyShadow}` }}>{txt}</div>
                )}
                {u && (
                  <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 46, letterSpacing: '0.1em', color: isWin ? C.goldHi : C.cream, opacity: 0.9, textShadow: `0 3px 0 ${C.navyShadow}` }}>
                    {u}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
        {n === 2 && winner >= 0 && vals[1 - winner] !== 0 && (
          <div
            style={{
              position: 'absolute', left: W / 2 + 20, top: H - 190, transform: `translateX(-50%) scale(${0.8 + 0.2 * backOut(seg(t, settled + 0.2, settled + 0.55), 2)})`,
              opacity: seg(t, settled + 0.2, settled + 0.4), display: 'flex', alignItems: 'baseline', gap: 16,
            }}
          >
            {sBool(spec, 'ratio', true) && (
              <>
                <GoldText text={`${fmtNum(lowerWins ? vals[1 - winner] / vals[winner] : vals[winner] / vals[1 - winner], ratioDecimals(vals, winner, lowerWins))}×`} size={88} tabular={false} />
                <Caps text={sStr(spec, 'ratioLabel', lowerWins ? 'FASTER' : 'MORE')} size={54} spacing={0.16} />
              </>
            )}
          </div>
        )}
      </Push>
    </AbsoluteFill>
  );
};

function ratioDecimals(vals: number[], w: number, lowerWins: boolean) {
  const r = lowerWins ? vals[1 - w] / vals[w] : vals[w] / vals[1 - w];
  return Math.abs(r - Math.round(r)) < 0.05 || r >= 10 ? 0 : 1;
}
