// `distance` card: line-art stick figure(s) on a ground line with a gold dimension arrow and a
// "14 METERS" label (IFOLOGY "10x Faster"). count > 1 lays out a chronophotography row of strides;
// count = 1 measures from the figure to a target icon. Optional corner stopwatch with a time label.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { CardProps } from './index';
import { Icon, runPose, walkPose, POSES, type FigPose } from './icons';
import {
  C, Caps, GlowDefs, GoldText, NavyBg, Push, Stroke, backOut, clamp01, countText, decimalsOf, easeOut, isNumeric, sNum, sStr, seg,
} from './kit';

export const DistanceCard: React.FC<CardProps> = ({ t, dur, spec, W, H }) => {
  const count = Math.max(1, Math.min(9, Math.round(sNum(spec, 'count', 1))));
  const pose = sStr(spec, 'pose', 'run');
  const target = sStr(spec, 'target', count === 1 ? 'flag' : '');
  const unit = sStr(spec, 'unit', 'METERS');
  const label = sStr(spec, 'label');
  const time = sStr(spec, 'time');
  const raw = spec.value;
  const numeric = raw != null && isNumeric(raw);

  const groundY = time ? 640 : 600;
  const figSize = count > 6 ? 280 : count > 4 ? 310 : 340;
  const x0 = count === 1 ? 470 : 330;
  const x1 = count === 1 ? 1450 : 1590;
  const xs = count === 1 ? [x0] : Array.from({ length: count }, (_, i) => x0 + (i * (x1 - x0)) / (count - 1));
  const figAt = (i: number) => 0.2 + (count === 1 ? 0 : (i * 0.6) / Math.max(1, count - 1));
  const lastAppear = figAt(count - 1) + 0.3;

  const poseFor = (i: number): FigPose | undefined => {
    const live = count === 1 ? t * 1.3 : 0;
    const ph = 0.13 + i * 0.37 + live;
    if (pose === 'run') return runPose(ph);
    if (pose === 'walk') return walkPose(ph);
    return POSES[pose];
  };

  // dimension line from first foot to the last figure / target
  const dimY = groundY + 72;
  const dA = count === 1 ? x0 + 40 : x0;
  const dB = count === 1 ? x1 - 30 : x1;
  const dimK = easeOut(seg(t, 0.35, count === 1 ? 0.95 : lastAppear + 0.1));
  const dx = dA + (dB - dA) * dimK;
  const tick = (x: number, k: number) => `M${x},${dimY - 22 * k} L${x},${dimY + 22 * k}`;
  const labK = easeOut(seg(t, 0.55, 0.95));
  const numTxt = numeric ? countText(t, sNum(spec, 'from', 0), sNum(spec, 'value', 0), 0.35, Math.max(0.6, lastAppear - 0.2), decimalsOf(raw)) : '';

  return (
    <AbsoluteFill>
      <NavyBg t={t} W={W} H={H} />
      <Push t={t} dur={dur} oy={55}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <GlowDefs id="dst" gold={6} />
          </defs>
          {/* ground */}
          <Stroke d={`M150,${groundY} L${W - 150},${groundY}`} p={easeOut(seg(t, 0, 0.45))} color={C.line} w={3} opacity={0.75} />
          {/* figures */}
          {xs.map((x, i) => {
            const k = seg(t, figAt(i), figAt(i) + 0.32);
            const dim = count === 1 ? 1 : 0.5 + 0.5 * (i / (count - 1));
            return (
              <Icon
                key={i}
                name="stand"
                pose={poseFor(i)}
                x={x}
                y={groundY - figSize * 0.45}
                size={figSize}
                p={k}
                t={t}
                sw={4}
                opacity={dim}
                filter="url(#dst-soft)"
              />
            );
          })}
          {/* faint stride marks under the row */}
          {count > 1 &&
            xs.map((x, i) => (
              <circle key={`m${i}`} cx={x} cy={groundY} r={5} fill={C.goldHi} opacity={0.8 * seg(t, figAt(i) + 0.1, figAt(i) + 0.3)} />
            ))}
          {target && count === 1 && (
            <Icon name={target} x={x1 + 20} y={groundY - 122} size={260} p={seg(t, 0.25, 0.75)} t={t} sw={4} filter="url(#dst-soft)" />
          )}
          {/* gold dimension arrow */}
          <g filter="url(#dst-goldU)" opacity={dimK > 0 ? 1 : 0}>
            <Stroke d={tick(dA, 1)} p={seg(t, 0.35, 0.5)} color={C.goldHi} w={4} />
            <Stroke d={`M${dA},${dimY} L${dx},${dimY}`} p={1} color={C.goldHi} w={4} />
            {dimK > 0.98 && <Stroke d={tick(dB, 1)} p={seg(t, count === 1 ? 0.95 : lastAppear + 0.1, (count === 1 ? 0.95 : lastAppear + 0.1) + 0.15)} color={C.goldHi} w={4} />}
            <path d={`M${dA + 18},${dimY - 11} L${dA + 2},${dimY} L${dA + 18},${dimY + 11}`} fill="none" stroke={C.goldHi} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${dx - 18},${dimY - 11} L${dx - 2},${dimY} L${dx - 18},${dimY + 11}`} fill="none" stroke={C.goldHi} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {time && (
            <Icon name="stopwatch" x={180} y={170} size={120} p={seg(t, 0, 0.45)} t={t} k={clamp01(seg(t, 0.3, Math.max(1.2, lastAppear + 0.2)))} sw={3.5} filter="url(#dst-soft)" />
          )}
        </svg>
        {time && (
          <div style={{ position: 'absolute', left: 265, top: 170, transform: `translate(${(1 - easeOut(seg(t, 0.15, 0.5))) * -20}px, -50%)`, opacity: seg(t, 0.15, 0.45) }}>
            <Caps text={time} size={58} spacing={0.12} />
          </div>
        )}
        <div
          style={{
            position: 'absolute', left: (dA + dB) / 2, top: dimY + 44, transform: `translateX(-50%) translateY(${(1 - labK) * 20}px) scale(${0.85 + 0.15 * backOut(labK, 2)})`,
            opacity: labK, display: 'flex', alignItems: 'baseline', gap: 22, transformOrigin: 'center top',
          }}
        >
          {numeric && <GoldText text={numTxt} size={120} />}
          <Caps text={numeric ? unit : label || unit} size={numeric ? 70 : 84} spacing={0.14} />
        </div>
        {numeric && label && (
          <div style={{ position: 'absolute', left: (dA + dB) / 2, top: dimY + 200, transform: 'translateX(-50%)', opacity: seg(t, 0.8, 1.1) }}>
            <Caps text={label} size={44} spacing={0.18} color={C.creamSoft} style={{ opacity: 0.85 }} />
          </div>
        )}
      </Push>
    </AbsoluteFill>
  );
};
