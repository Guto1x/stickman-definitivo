// 2D effect overlays drawn over (or between) 3D layers: electric crackles around a character,
// anime speed lines, full-frame flashes.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { rand } from '../engine/fx';

export type Pt = { x: number; y: number };

function bolt(r: () => number, a: Pt, b: Pt, jag: number, segs: number): string {
  const pts: Pt[] = [a];
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  for (let i = 1; i < segs; i++) {
    const k = i / segs;
    const off = (r() * 2 - 1) * jag * Math.sin(Math.PI * k);
    pts.push({ x: a.x + dx * k + nx * off, y: a.y + dy * k + ny * off });
  }
  pts.push(b);
  return 'M' + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L');
}

/**
 * Electric arcs hugging a silhouette. `anchors` are screen points on/near the body (head, shoulders,
 * hands, hips); `scale` is px per metre at the subject so arcs keep a sensible size in any framing.
 */
export const Crackles: React.FC<{ frame: number; anchors: Pt[]; scale: number; center?: Pt; intensity?: number; seed?: number; color?: string; W?: number; H?: number }> = ({
  frame, anchors, scale, center, intensity = 1, seed = 1, color = '#a66bff', W = 1920, H = 1080,
}) => {
  if (intensity <= 0 || anchors.length === 0) return null;
  const bucket = Math.floor(frame / 2); // new pattern every 2 frames
  const r = rand(seed * 1000 + bucket * 17 + 3);
  const count = Math.round((1 + r() * 2.5) * intensity);
  const paths: { d: string; w: number; o: number }[] = [];
  for (let i = 0; i < count; i++) {
    if (r() > 0.85) continue; // occasional gaps = flicker
    const a = anchors[Math.floor(r() * anchors.length)];
    // arcs leave the silhouette outward (away from the body centre) so they never scribble across the face
    const ang = center ? Math.atan2(a.y - center.y, a.x - center.x) + (r() - 0.5) * 1.3 : r() * Math.PI * 2;
    const len = (0.12 + r() * 0.28) * scale;
    const start = { x: a.x + Math.cos(ang) * 0.06 * scale, y: a.y + Math.sin(ang) * 0.06 * scale };
    const end = { x: start.x + Math.cos(ang + (r() - 0.5) * 0.6) * len, y: start.y + Math.sin(ang + (r() - 0.5) * 0.6) * len };
    paths.push({ d: bolt(r, start, end, len * 0.25, 6), w: 1 + r(), o: 0.7 + r() * 0.3 });
    if (r() < 0.5) {
      const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
      const end2 = { x: mid.x + (r() - 0.5) * len * 0.7, y: mid.y + (r() - 0.5) * len * 0.7 };
      paths.push({ d: bolt(r, mid, end2, len * 0.15, 4), w: 0.7, o: 0.6 });
    }
  }
  const sw = Math.max(1.5, scale * 0.006);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id={`cglow${seed}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={sw * 2.2} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter={`url(#cglow${seed})`} strokeLinecap="round" strokeLinejoin="round" fill="none">
          {paths.map((p, i) => (
            <g key={i} opacity={p.o * Math.min(1, intensity)}>
              <path d={p.d} stroke={color} strokeWidth={sw * 2.6 * p.w} />
              <path d={p.d} stroke="#f4ecff" strokeWidth={sw * p.w} />
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Anime speed lines streaking horizontally (dir -1 = moving left). */
export const SpeedLines: React.FC<{ t: number; n?: number; dir?: 1 | -1; speed?: number; opacity?: number; seed?: number; band?: [number, number]; W?: number; H?: number }> = ({
  t, n = 34, dir = -1, speed = 5200, opacity = 0.75, seed = 4, band = [0.04, 0.96], W = 1920, H = 1080,
}) => {
  const r = rand(seed);
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const y = H * (band[0] + r() * (band[1] - band[0]));
    const len = 160 + r() * 700;
    const th = 1.2 + r() * 3.8;
    const span = W + len * 2;
    const x0 = r() * span;
    const v = speed * (0.6 + r() * 0.8);
    const x = ((((x0 + dir * v * t) % span) + span) % span) - len;
    const o = opacity * (0.25 + r() * 0.75);
    lines.push(
      <rect key={i} x={x} y={y - th / 2} width={len} height={th} rx={th / 2} fill={`url(#sl${seed})`} opacity={o} />,
    );
  }
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id={`sl${seed}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity={dir < 0 ? 0.95 : 0} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={dir < 0 ? 0 : 0.95} />
          </linearGradient>
        </defs>
        {lines}
      </svg>
    </AbsoluteFill>
  );
};

export const Flash: React.FC<{ t: number; at: number; dur?: number; color?: string; peak?: number }> = ({ t, at, dur = 0.16, color = '#ffffff', peak = 0.85 }) => {
  const k = (t - at) / dur;
  if (k < 0 || k > 1) return null;
  const o = peak * (k < 0.15 ? k / 0.15 : Math.pow(1 - (k - 0.15) / 0.85, 1.6));
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: 'screen', pointerEvents: 'none' }} />;
};
