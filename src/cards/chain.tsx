// `chain` card: 2–4 line-art icon nodes joined by arrows (EYES → BRAIN → MUSCLES). A gold pulse
// travels node to node; each node lights up gold as it arrives, then pulses keep flowing.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { CardProps } from './index';
import { Icon } from './icons';
import { C, Caps, GlowDefs, NavyBg, Push, Stroke, backOut, circlePath, clamp01, easeOut, sNum, sStr, seg } from './kit';

type Node = { icon?: string; label?: string; value?: string };

export const ChainCard: React.FC<CardProps> = ({ t, dur, spec, W, H }) => {
  const rawNodes = Array.isArray(spec.nodes) ? (spec.nodes as unknown[]) : [];
  const nodes: Node[] = rawNodes.slice(0, 5).map(n => (typeof n === 'string' ? { icon: n, label: n.toUpperCase() } : (n as Node)));
  while (nodes.length < 2) nodes.push({ icon: 'question', label: '?' });
  const n = nodes.length;
  const title = sStr(spec, 'title');
  const step = sNum(spec, 'step', Math.min(0.75, Math.max(0.35, (dur - 1.2) / (n + 1))));

  const R = n >= 5 ? 96 : n === 4 ? 112 : 128;
  const spacing = n === 2 ? 640 : n === 3 ? 520 : n === 4 ? 430 : 340;
  const cy = title ? 560 : 500;
  const xs = nodes.map((_, i) => W / 2 + (i - (n - 1) / 2) * spacing);
  const lightAt = (i: number) => 0.6 + i * step;
  const allLit = lightAt(n - 1) + 0.3;

  return (
    <AbsoluteFill>
      <NavyBg t={t} W={W} H={H} />
      <Push t={t} dur={dur}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <GlowDefs id="chn" gold={10} />
            <radialGradient id="chn-disc">
              <stop offset="0" stopColor={C.goldHi} stopOpacity={0.28} />
              <stop offset="0.7" stopColor={C.goldHi} stopOpacity={0.07} />
              <stop offset="1" stopColor={C.goldHi} stopOpacity={0} />
            </radialGradient>
          </defs>
          {/* arrows */}
          {xs.slice(0, -1).map((x, i) => {
            const a = x + R + 30, b = xs[i + 1] - R - 30;
            const k0 = lightAt(i) + 0.05, k1 = lightAt(i + 1);
            const base = seg(t, 0.25 + i * 0.1, 0.6 + i * 0.1);
            const gold = easeOut(seg(t, k0, k1));
            const head = `M${b - 22},${cy - 18} L${b},${cy} L${b - 22},${cy + 18}`;
            // looping pulses once the chain is lit
            const loop = t > allLit ? ((t - allLit) * 0.9 + i * 0.15) % 1 : -1;
            const travel = t >= k0 && t <= k1 ? (t - k0) / (k1 - k0) : loop;
            return (
              <g key={i}>
                <Stroke d={`M${a},${cy} L${b},${cy}`} p={base} w={3} color={C.line} opacity={0.35} dash="2 14" />
                <g filter="url(#chn-softU)">
                  <Stroke d={`M${a},${cy} L${b},${cy}`} p={gold} w={5} color={C.goldHi} />
                  {gold > 0.98 && <Stroke d={head} p={seg(t, k1 - 0.05, k1 + 0.08)} w={5} color={C.goldHi} />}
                </g>
                {travel >= 0 && travel <= 1 && (
                  <circle cx={a + (b - a) * easeOut(travel)} cy={cy} r={9} fill="#fff7dc" filter="url(#chn-goldU)" opacity={Math.sin(Math.PI * travel)} />
                )}
              </g>
            );
          })}
          {/* nodes */}
          {nodes.map((nd, i) => {
            const x = xs[i];
            const appear = seg(t, 0.05 + i * 0.08, 0.5 + i * 0.08);
            const lit = seg(t, lightAt(i), lightAt(i) + 0.25);
            const pop = 1 + 0.1 * Math.sin(Math.PI * clamp01((t - lightAt(i)) / 0.3)) ;
            const breathe = lit > 0 ? 1 + 0.015 * Math.sin((t - lightAt(i)) * 2.6) : 1;
            return (
              <g key={i} transform={`translate(${x} ${cy}) scale(${pop * breathe}) translate(${-x} ${-cy})`}>
                <circle cx={x} cy={cy} r={R * 1.5} fill="url(#chn-disc)" opacity={lit} />
                <Stroke d={circlePath(x, cy, R)} p={appear} w={4} color={C.line} opacity={1 - lit} filter="url(#chn-soft)" />
                {lit > 0 && <Stroke d={circlePath(x, cy, R)} p={1} w={5} color={C.goldHi} opacity={lit} filter="url(#chn-soft)" />}
                <Icon name={nd.icon || 'question'} x={x} y={cy} size={R * 1.38} p={seg(appear, 0.2, 1)} t={t + i} sw={4.5} color={lit > 0.5 ? '#fffaf0' : C.line} opacity={0.75 + 0.25 * lit} filter="url(#chn-soft)" />
              </g>
            );
          })}
        </svg>
        {title && (
          <div style={{ position: 'absolute', left: W / 2, top: 150, transform: 'translateX(-50%)', textAlign: 'center', opacity: easeOut(seg(t, 0, 0.35)) }}>
            <Caps text={title} size={70} spacing={0.16} />
            <div style={{ height: 6, width: 160 * easeOut(seg(t, 0.15, 0.5)), margin: '16px auto 0', borderRadius: 3, background: C.gold }} />
          </div>
        )}
        {nodes.map((nd, i) => {
          const lab = easeOut(seg(t, 0.2 + i * 0.08, 0.55 + i * 0.08));
          const lit = seg(t, lightAt(i), lightAt(i) + 0.25);
          return (
            <div
              key={i}
              style={{
                position: 'absolute', left: xs[i], top: cy + R + 50, transform: `translateX(-50%) translateY(${(1 - lab) * 18}px)`, opacity: lab, textAlign: 'center',
              }}
            >
              <Caps text={nd.label || ''} size={n === 4 ? 50 : 58} spacing={0.16} color={lit > 0.5 ? C.goldHi : C.cream} />
              {nd.value && (
                <Caps text={nd.value} size={40} spacing={0.12} color={C.creamSoft} style={{ marginTop: 10, opacity: 0.6 + 0.4 * lit, transform: `scale(${backOut(lit, 2) * 0.2 + 0.8})` }} />
              )}
            </div>
          );
        })}
      </Push>
    </AbsoluteFill>
  );
};
