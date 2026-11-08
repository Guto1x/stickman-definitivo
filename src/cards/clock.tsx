// `clock` card: a big line-art clock face whose gold second hand sweeps, then freezes (with a jolt, a
// gold shock ring and the background dust stopping mid-air), slows down, speeds up or just ticks.
// Optional gold value ("0.25 s") beside it and a caps label.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { CardProps } from './index';
import { C, Caps, GlowDefs, GoldText, NavyBg, Push, Stroke, backOut, circlePath, clamp01, easeOut, f, sBool, sNum, sStr, seg } from './kit';

type Mode = 'freeze' | 'slow' | 'fast' | 'tick';

/** Second-hand angle (deg) for each mode; `at` is when the change happens. */
function handAngle(mode: Mode, t: number, at: number, w: number) {
  const base = 30;
  if (mode === 'tick') return base + 6 * 4 * (Math.floor(t * 1) + Math.min(1, (t % 1) / 0.12)); // 24°/tick for readability
  if (t <= at) return base + w * t;
  const dt = t - at;
  if (mode === 'freeze') {
    const brake = 0.28; // decelerate to a halt over `brake` s
    const k = Math.min(dt, brake);
    const travel = w * (k - (k * k) / (2 * brake));
    const jolt = dt > brake ? 2.4 * Math.exp(-(dt - brake) * 9) * Math.sin((dt - brake) * 46) : 0;
    const strain = dt > brake ? 0.35 * Math.sin(t * 37) * Math.sin(t * 23) : 0;
    return base + w * at + travel + jolt + strain;
  }
  if (mode === 'slow') {
    const tau = 0.45;
    const slowW = w / 12;
    const travel = slowW * dt + (w - slowW) * tau * (1 - Math.exp(-dt / tau));
    return base + w * at + travel;
  }
  // fast
  const tau = 0.5;
  const fastW = w * 8;
  return base + w * at + fastW * dt - (fastW - w) * tau * (1 - Math.exp(-dt / tau));
}

export const ClockCard: React.FC<CardProps> = ({ t, dur, spec, W, H }) => {
  const mode = (['freeze', 'slow', 'fast', 'tick'].includes(sStr(spec, 'mode')) ? sStr(spec, 'mode') : 'freeze') as Mode;
  const at = sNum(spec, 'at', Math.min(1.4, dur * 0.4));
  const label = sStr(spec, 'label');
  const value = sStr(spec, 'value');
  const bar = sBool(spec, 'bar', false);
  const w = sNum(spec, 'speed', 150); // second hand °/s before the change

  const hasValue = !!value;
  const cx = hasValue ? 640 : W / 2;
  const cy = hasValue ? H * 0.5 : H * 0.44;
  const R = hasValue ? 290 : 270;

  const draw = seg(t, 0, 0.55);
  const sec = handAngle(mode, t, at, w);
  // optional fixed time on the dial (spec.time = "HH:MM"); otherwise the old decorative 7:50
  const tm = /^(\d{1,2}):(\d\d)$/.exec(sStr(spec, 'time') || '');
  const m0 = tm ? +tm[2] * 6 : 300, h0 = tm ? ((+tm[1] % 12) * 30 + +tm[2] * 0.5) : 250;
  const minute = m0 + sec / 720;
  const hour = h0 + sec / 8640;
  const changed = mode !== 'tick' && t >= at;
  const dt = t - at;
  const ring = changed ? seg(dt, 0, 0.7) : 0;
  const frozen = mode === 'freeze' && changed;
  // background time: dust stops (freeze), crawls (slow) or races (fast)
  const tBg = mode === 'freeze' ? Math.min(t, at + 0.15) : mode === 'slow' && changed ? at + dt / 12 : mode === 'fast' && changed ? at + dt * 6 : t;

  const hand = (deg: number, len: number, tail = 0) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return `M${f(cx - Math.cos(a) * tail)},${f(cy - Math.sin(a) * tail)} L${f(cx + Math.cos(a) * len)},${f(cy + Math.sin(a) * len)}`;
  };
  const ticks: React.ReactNode[] = [];
  for (let i = 0; i < 60; i++) {
    const a = ((i * 6 - 90) * Math.PI) / 180;
    const major = i % 5 === 0;
    const r0 = R - (major ? 46 : 26), r1 = R - 18;
    const k = seg(draw, 0.2 + (i / 60) * 0.5, 0.3 + (i / 60) * 0.5);
    if (k <= 0) continue;
    ticks.push(
      <line
        key={i}
        x1={f(cx + Math.cos(a) * r0)} y1={f(cy + Math.sin(a) * r0)} x2={f(cx + Math.cos(a) * (r0 + (r1 - r0) * k))} y2={f(cy + Math.sin(a) * (r0 + (r1 - r0) * k))}
        stroke={C.line} strokeWidth={major ? 5 : 2.2} strokeLinecap="round" opacity={major ? 1 : 0.55}
      />,
    );
  }
  const handsK = easeOut(seg(t, 0.35, 0.65));
  const labelAt = sNum(spec, 'labelAt', mode === 'tick' ? 0.45 : at + 0.1);
  const labelShown = easeOut(seg(t, labelAt, labelAt + 0.4));
  const valK = easeOut(seg(t, 0.35, 0.75));
  const glowPulse = frozen ? 0.5 + 0.5 * Math.sin(dt * 3) : 0;

  return (
    <AbsoluteFill>
      <NavyBg t={tBg} W={W} H={H} cx={(cx / W) * 100} cy={(cy / H) * 100} />
      <Push t={t} dur={dur} ox={(cx / W) * 100} oy={(cy / H) * 100}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <GlowDefs id="clk" gold={10} />
            <radialGradient id="clk-face">
              <stop offset="0" stopColor="#2a3a74" stopOpacity={0.55} />
              <stop offset="1" stopColor="#2a3a74" stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={cx} cy={cy} r={R} fill="url(#clk-face)" opacity={draw} />
          {/* shock ring when time changes */}
          {ring > 0 && ring < 1 && (
            <circle cx={cx} cy={cy} r={R * (1 + 0.55 * easeOut(ring))} fill="none" stroke={C.goldHi} strokeWidth={10 * (1 - ring) + 1} opacity={0.8 * (1 - ring)} filter="url(#clk-gold)" />
          )}
          {frozen && <circle cx={cx} cy={cy} r={R + 3} fill="none" stroke={C.goldHi} strokeWidth={5} opacity={0.25 + 0.25 * glowPulse} filter="url(#clk-gold)" />}
          <Stroke d={circlePath(cx, cy, R)} p={draw} w={5.5} filter="url(#clk-soft)" />
          <Stroke d={circlePath(cx, cy, R - 10)} p={seg(draw, 0.15, 1)} w={2} opacity={0.35} />
          <g filter="url(#clk-soft)">{ticks}</g>
          <g opacity={handsK}>
            <Stroke d={hand(hour, R * 0.48)} w={10} />
            <Stroke d={hand(minute, R * 0.7)} w={7} />
            <g filter="url(#clk-goldU)" opacity={0.55 + 0.25 * glowPulse}>
              <Stroke d={hand(sec, R * 0.82, R * 0.16)} w={4.5} color={C.goldHi} />
            </g>
            <Stroke d={hand(sec, R * 0.82, R * 0.16)} w={4.5} color={C.goldHi} />
            <circle cx={cx} cy={cy} r={14} fill={C.goldHi} />
            <circle cx={cx} cy={cy} r={5} fill={C.navyM} />
          </g>
          {bar && (() => {
            const bx = cx - 360, bw = 720, by = cy + R + 90;
            const k = clamp01(((sec - 30) / 360) * 0.5);
            return (
              <g opacity={draw}>
                <line x1={bx} y1={by} x2={bx + bw} y2={by} stroke={C.lineDim} strokeWidth={3} strokeLinecap="round" />
                <line x1={bx} y1={by} x2={bx + bw * Math.min(1, k)} y2={by} stroke={C.goldHi} strokeWidth={12} strokeLinecap="round" filter="url(#clk-softU)" />
              </g>
            );
          })()}
        </svg>
        {hasValue && (
          <div style={{ position: 'absolute', left: 1060, top: H * 0.5, transform: `translateY(-60%) scale(${0.6 + 0.4 * backOut(valK, 1.8)})`, transformOrigin: 'left center', opacity: clamp01(valK * 3) }}>
            <GoldText text={value} size={value.length > 6 ? 150 : 190} tabular={false} />
          </div>
        )}
        {label && (
          <div
            style={{
              position: 'absolute', left: hasValue ? 1066 : W / 2, top: hasValue ? H * 0.5 + 120 : cy + R + (bar ? 130 : 70),
              transform: `translateX(${hasValue ? 0 : -50}%) translateY(${(1 - labelShown) * 22}px)`, opacity: labelShown, textAlign: hasValue ? 'left' : 'center',
            }}
          >
            <Caps text={label} size={hasValue ? 62 : 76} spacing={0.16} color={frozen ? C.goldLight : C.cream} />
          </div>
        )}
      </Push>
    </AbsoluteFill>
  );
};
