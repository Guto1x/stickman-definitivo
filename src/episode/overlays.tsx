// Dispatches episode overlay specs (labels, titles, stats, bubbles…) onto overlay components.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Flash } from '../overlays/Energy';
import { StatCallout } from '../overlays/Stat';
import { TitleOverlay } from '../overlays/TitleOverlay';
import { Label } from '../overlays/Label';
import { Stopwatch } from '../overlays/Stopwatch';
import { Bubble } from '../overlays/Bubble';
import { CrushMeter } from '../overlays/CrushMeter';
import { NewsBar } from '../overlays/NewsBar';
import { KeyWord } from '../overlays/KeyWord';
import { BodyMenu, type MenuRow } from '../overlays/BodyMenu';
import type { Overlay } from '../types';

export type Projector = (actorId: string) => { x: number; y: number; visible: boolean; scale: number } | null;

const fmt = (v: number, decimals = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const OverlayLayer: React.FC<{ overlays: Overlay[]; t: number; dur: number; project: Projector }> = ({ overlays, t, dur, project }) => (
  <>
    {overlays.map((o, i) => {
      const at = (o as { at?: number }).at ?? 0;
      const until = (o as { until?: number }).until ?? dur;
      const lt = t - at;
      if (lt < 0 || t > until) return null;
      switch (o.type) {
        case 'stat': {
          const num = typeof o.value === 'number' ? o.value : null;
          return (
            <StatCallout key={i} t={lt}
              big={k => `${o.prefix ?? ''}${num !== null ? fmt(num * k, o.decimals ?? 0) : o.value}${o.unit && o.unit.length <= 2 ? o.unit : ''}`}
              small={o.label || (o.unit && o.unit.length > 2) ? () => [o.unit && o.unit.length > 2 ? o.unit : '', o.label || ''].filter(Boolean).join(' · ').toUpperCase() : undefined}
              x={o.pos === 'center' ? 960 : o.pos === 'right' ? 1810 : 110} y={o.pos === 'center' ? 380 : 90}
              align={o.pos === 'center' ? 'center' : o.pos === 'right' ? 'right' : 'left'} />
          );
        }
        case 'flash':
          return <Flash key={i} t={t} at={at} color={o.color} />;
        case 'caption':
          return (
            <AbsoluteFill key={i} style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 90 }}>
              <div style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: 46, color: '#fff', textShadow: '0 3px 8px rgba(0,0,0,0.8)', opacity: Math.min(1, lt / 0.15) }}>{o.text}</div>
            </AbsoluteFill>
          );
        default:
          return <OverlayExt key={i} o={o} t={lt} project={project} />;
      }
    })}
  </>
);

// Title / label / stopwatch / bubble overlays live in src/overlays.
const OverlayExt: React.FC<{ o: Overlay; t: number; project: Projector }> = ({ o, t, project }) => {
  const dur = (o as { until?: number; at?: number }).until !== undefined ? (o as { until: number }).until - ((o as { at?: number }).at ?? 0) : undefined;
  switch (o.type) {
    case 'title':
      return <TitleOverlay t={t} big={o.big} small={o.small} dur={dur} compact={o.compact} />;
    case 'label':
      return <Label t={t} text={o.text} corner={o.corner} dur={dur} />;
    case 'stopwatch':
      return <Stopwatch t={t} from={o.from || '0.00 s'} to={o.to} switchAt={(o as { switchAt?: number }).switchAt} dur={dur} persist={(o as { persist?: boolean }).persist} tick={(o as { tick?: number }).tick} keep={(o as { keep?: boolean }).keep} corner={(o as { corner?: 'tl' | 'tr' | 'bl' | 'br' | 'tc' | 'bc' }).corner} />;
    case 'news':
      return <NewsBar t={t} headline={o.headline} ticker={o.ticker} tag={(o as { tag?: string }).tag} dur={dur} safe={o.safe} />;
    case 'menu':
      return <BodyMenu t={t} rows={o.rows as MenuRow[]} title={o.title} note={o.note} noteAt={o.noteAt as number | undefined} alarm={o.alarm} y={o.y} dur={dur} />;
    case 'word':
      return <KeyWord t={t} text={o.text} color={o.color} y={o.y} dur={dur} />;
    case 'bubble':
    case 'thought': {
      const p = project(o.actor);
      if (!p || !p.visible) return null;
      return <Bubble t={t} text={o.text} x={p.x} y={p.y} kind={o.type === 'thought' ? 'thought' : 'speech'} gap={Math.max(30, 0.12 * p.scale)} dur={dur} />;
    }
    case 'crush': {
      const p = project(o.actor);
      if (!p || !p.visible) return null;
      return <CrushMeter t={t} x={p.x} y={p.y} value={o.value} from={o.from} countDur={o.countDur} scale={p.scale} dur={dur} />;
    }
    default:
      return null;
  }
};
