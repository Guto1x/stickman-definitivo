// "Body settings" HUD: a videogame-style options panel floating over a 3D shot. A title bar, rows of
// sliders (label · bar · value) and an optional notification toast under it. Rows animate from `from` to
// `value` at their own cue, with a gold flash; warn rows turn red (the cost side of a change). Always
// inside the 9:16 centre column (560 px wide), so a hand-cut vertical short keeps it.
//
// Props
//   t       seconds since the panel appears (nothing for t < 0)
//   title   caps title (default "CONFIGURAÇÕES DO CORPO")
//   rows    [{ label, value, from?, at?, warn?, dim? }]  value 0–100; `at` = seconds since the panel appeared
//   note    toast text under the panel; noteAt = seconds since the panel appeared (default 0.6)
//   alarm   red pulsing frame + "ALARME" tag (the menu only opens in a real alarm)
//   y       'top' (default) | 'mid' | 'low' | 'above' (low, but clear of a bottom-centre stopwatch)
//   dur     seconds on screen; collapses over the last 0.25 s
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, COND, backOut, easeIn, easeOut, seg } from '../cards/kit';

export type MenuRow = { label: string; value: number; from?: number; at?: number; warn?: boolean; dim?: boolean };

const RED = '#ff5a4a';
const W_PANEL = 500;

export const BodyMenu: React.FC<{
  t: number; rows: MenuRow[]; title?: string; note?: string; noteAt?: number; alarm?: boolean; y?: 'top' | 'mid' | 'low' | 'above'; dur?: number;
}> = ({ t, rows, title = 'CONFIGURAÇÕES DO CORPO', note, noteAt = 0.6, alarm, y = 'top', dur }) => {
  if (t < 0) return null;
  const outK = dur != null ? easeIn(seg(t, dur - 0.25, dur)) : 0;
  if (outK >= 1) return null;
  const inK = backOut(seg(t, 0, 0.3), 1.6);
  const rowH = 50;
  const panelH = 56 + rows.length * rowH + 12;
  const top = y === 'top' ? 36 : y === 'low' ? 1080 - panelH - 60 : y === 'above' ? 1080 - panelH - 175 : 540 - panelH / 2;
  const pulse = alarm ? 0.55 + 0.45 * Math.sin(t * 9) : 0;
  const frame = alarm ? `rgba(255,90,74,${0.55 + 0.4 * pulse})` : 'rgba(120,200,255,0.75)';
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', left: 960 - W_PANEL / 2, width: W_PANEL, top,
        transform: `scaleY(${Math.max(0.02, inK * (1 - outK))}) scaleX(${0.9 + 0.1 * Math.min(1, inK)})`, transformOrigin: '50% 0%',
        opacity: Math.min(1, seg(t, 0, 0.12) * 1.5) * (1 - outK),
        background: 'linear-gradient(180deg, rgba(14,22,52,0.9) 0%, rgba(8,12,34,0.92) 100%)',
        border: `3px solid ${frame}`, borderRadius: 14,
        boxShadow: `0 0 ${alarm ? 26 + 20 * pulse : 22}px ${alarm ? 'rgba(255,70,60,0.55)' : 'rgba(90,180,255,0.45)'}, 0 10px 30px rgba(0,0,0,0.5)`,
        fontFamily: COND, color: C.cream, overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 8px', borderBottom: '2px solid rgba(120,200,255,0.35)' }}>
          <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: '0.06em', color: '#dff3ff' }}>{title}</div>
          {alarm && <div style={{ background: RED, color: '#fff', fontWeight: 800, fontSize: 22, padding: '3px 10px', borderRadius: 6, letterSpacing: '0.08em', opacity: 0.7 + 0.3 * pulse }}>ALARME</div>}
        </div>
        <div style={{ padding: '8px 22px 8px' }}>
          {rows.map((r, i) => {
            const rowIn = easeOut(seg(t, 0.12 + i * 0.06, 0.32 + i * 0.06));
            const at = r.at ?? 0;
            const k = r.from === undefined ? 1 : easeOut(seg(t, at, at + 0.45));
            const v = r.from === undefined ? r.value : r.from + (r.value - r.from) * k;
            const changing = r.from !== undefined && t >= at && t < at + 0.9;
            const flash = r.from !== undefined ? Math.max(0, 1 - Math.abs(t - at - 0.2) / 0.5) : 0;
            const col = r.warn ? RED : r.dim ? 'rgba(220,230,255,0.45)' : C.goldHi;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', height: rowH, gap: 16, opacity: rowIn * (r.dim ? 0.6 : 1), transform: `translateX(${(1 - rowIn) * -30}px)`,
                background: changing ? `rgba(255,213,107,${0.1 + 0.18 * flash})` : 'transparent', borderRadius: 8, margin: '0 -10px', padding: '0 10px',
              }}>
                <div style={{ width: 120, fontWeight: 800, fontSize: 30, letterSpacing: '0.04em', color: r.warn ? RED : '#f2f6ff' }}>{r.label}</div>
                <div style={{ flex: 1, height: 14, background: 'rgba(255,255,255,0.12)', borderRadius: 9, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(0, Math.min(100, v))}%`, background: r.warn ? RED : `linear-gradient(90deg, ${C.goldDeep}, ${C.goldHi})`, borderRadius: 9, boxShadow: flash > 0 ? `0 0 ${14 * flash}px ${col}` : 'none' }} />
                  <div style={{ position: 'absolute', top: -6, left: `calc(${Math.max(0, Math.min(100, v))}% - 13px)`, width: 26, height: 26, borderRadius: 13, background: '#fff', border: `4px solid ${col}`, boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }} />
                </div>
                <div style={{ width: 60, textAlign: 'right', fontWeight: 800, fontSize: 34, color: col, transform: `scale(${1 + 0.25 * flash})` }}>{Math.round(v)}</div>
              </div>
            );
          })}
        </div>
      </div>
      {note && (() => {
        const nK = easeOut(seg(t, noteAt, noteAt + 0.3));
        if (nK <= 0) return null;
        return (
          <div style={{
            position: 'absolute', left: 960 - W_PANEL / 2 + 20, width: W_PANEL - 40, top: y === 'low' || y === 'above' ? top - 62 : top + panelH * Math.max(0.02, inK) + 18,
            opacity: nK * (1 - outK), transform: `translateY(${(1 - nK) * 20}px)`,
            background: 'rgba(255,90,74,0.95)', color: '#fff', fontFamily: COND, fontWeight: 800, fontSize: 26, letterSpacing: '0.04em',
            textAlign: 'center', padding: '10px 16px', borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
          }}>{note.toUpperCase()}</div>
        );
      })()}
    </AbsoluteFill>
  );
};
