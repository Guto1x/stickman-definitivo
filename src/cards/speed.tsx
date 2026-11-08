// `speed` card: a line-art stick figure sprinting through flowing dashed wind lines that bend around
// it, faint afterimages behind, a gold count-up speed label and a small spinning stopwatch
// (IFOLOGY "250 KM/H").
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { CardProps } from './index';
import { Icon, runPose } from './icons';
import { C, Caps, GlowDefs, GoldText, NavyBg, Push, backOut, clamp01, countText, decimalsOf, easeOut, f, isNumeric, sBool, sNum, sStr, seg } from './kit';

export const SpeedCard: React.FC<CardProps> = ({ t, dur, spec, W, H }) => {
  const raw = spec.value;
  const numeric = raw != null && isNumeric(raw);
  const unit = sStr(spec, 'unit', 'KM/H');
  const label = sStr(spec, 'label');
  const stopwatch = sBool(spec, 'stopwatch', true);
  const cadence = sNum(spec, 'cadence', 2.4); // strides per second of the run cycle

  const fx = 720, fy = 560, figSize = 440;
  // wind lines: streamlines that bow around the runner and flow right→left
  const rows = 15;
  const lines: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const y0 = 170 + (r * (H - 340)) / (rows - 1);
    const rel = (y0 - fy) / 260;
    const bow = 70 * Math.sign(rel || 1) * Math.exp(-rel * rel * 0.9) * (Math.abs(rel) < 0.2 ? 0.4 : 1);
    let d = '';
    for (let x = -40; x <= W + 40; x += 30) {
      const g = Math.exp(-Math.pow((x - fx - 40) / 260, 2));
      const ripple = 7 * Math.sin(x / 150 + t * 4 + r * 1.3);
      const y = y0 + bow * g + ripple * (0.4 + 0.6 * (1 - g));
      d += `${x === -40 ? 'M' : 'L'}${x},${f(y)} `;
    }
    const appear = easeOut(seg(t, 0.02 * r, 0.02 * r + 0.35));
    const speed = 900 + (r % 3) * 220;
    const o = (0.3 + 0.35 * ((r * 7) % 5) / 4) * appear;
    lines.push(
      <path
        key={r}
        d={d}
        fill="none"
        stroke={C.line}
        strokeWidth={r % 4 === 0 ? 3.2 : 2.4}
        strokeLinecap="round"
        strokeDasharray={r % 2 ? '46 30' : '70 38'}
        strokeDashoffset={f(t * speed + r * 53)}
        opacity={o}
      />,
    );
  }

  const ph = t * cadence;
  const bob = Math.abs(Math.cos(ph * Math.PI * 2)) * -8;
  const lab = backOut(seg(t, 0.25, 0.6), 1.8);
  const c0 = 0.3, cd = Math.min(1.1, Math.max(0.6, dur * 0.3));
  const txt = numeric ? countText(t, sNum(spec, 'from', 0), sNum(spec, 'value', 0), c0, cd, decimalsOf(raw)) : label;
  const shimmerK = seg(t, c0 + cd, c0 + cd + 0.7);

  return (
    <AbsoluteFill>
      <NavyBg t={t} W={W} H={H} cx={40} />
      <Push t={t} dur={dur} ox={40}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <GlowDefs id="spd" />
          </defs>
          {lines}
          {/* afterimages */}
          {[3, 2, 1].map(k => (
            <Icon
              key={k}
              name="run"
              pose={runPose(ph - k * 0.07, 20)}
              x={fx - k * 120}
              y={fy + bob}
              size={figSize}
              p={seg(t, 0.1, 0.5)}
              sw={4}
              opacity={0.26 - k * 0.07}
            />
          ))}
          <Icon name="run" pose={runPose(ph, 20)} x={fx} y={fy + bob} size={figSize} p={seg(t, 0, 0.45)} sw={5} filter="url(#spd-soft)" />
          {stopwatch && (
            <Icon name="stopwatch" x={1640} y={300} size={120} p={seg(t, 0.3, 0.7)} t={t * 3} sw={3.5} filter="url(#spd-soft)" />
          )}
        </svg>
        <div
          style={{
            position: 'absolute', left: 1010, top: 300, transform: `translateY(-50%) scale(${0.6 + 0.4 * lab})`, transformOrigin: 'left center',
            opacity: clamp01((t - 0.25) / 0.1), display: 'flex', alignItems: 'baseline', gap: 20,
          }}
        >
          {numeric ? (
            <>
              <GoldText text={txt} size={170} shimmer={shimmerK > 0 && shimmerK < 1 ? -0.2 + 1.4 * shimmerK : null} />
              <GoldText text={unit} size={84} tabular={false} spacing={0.04} />
            </>
          ) : (
            <GoldText text={txt} size={130} tabular={false} />
          )}
        </div>
        {numeric && label && (
          <div style={{ position: 'absolute', left: 1016, top: 410, opacity: easeOut(seg(t, 0.5, 0.85)), transform: `translateY(${(1 - easeOut(seg(t, 0.5, 0.85))) * 18}px)` }}>
            <Caps text={label} size={56} spacing={0.14} />
          </div>
        )}
      </Push>
    </AbsoluteFill>
  );
};
