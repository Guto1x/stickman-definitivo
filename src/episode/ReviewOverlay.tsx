// Review-mode overlay (never in final renders): name tags over every character, expected-position
// markers for effects (where each swapper must end up), and a banner with shot id, time and the
// flow/cut decision. Makes overlaps ("two tags on one spot") and missing characters obvious.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { project } from '../engine/cam';
import * as THREE from 'three';
import type { SceneState } from './scene';

const COLORS = ['#ffd23f', '#5ce1ff', '#ff6b9a', '#9dff6b', '#ffa94d', '#c9a6ff', '#ffffff'];
const W = 1920, H = 1080;

export const ReviewOverlay: React.FC<{ scene: SceneState; label: string; t: number; dur: number }> = ({ scene, label, t, dur }) => {
  const { cam, states, swap, flow } = scene;
  const tags = states.map((s, i) => {
    const head = project(s.anchors.headTop.clone().add(new THREE.Vector3(0, 0.08, 0)), cam, W, H);
    const feet = project(s.anchors.feet, cam, W, H);
    return { name: (s.cast.name || s.spec.id).toUpperCase(), head, feet, color: COLORS[i % COLORS.length], ghost: !!s.spec.ghost };
  });
  const markers: { x: number; y: number; text: string; color: string }[] = [];
  if (swap && !swap.keepPaths) {
    // after the swap, ids[0] must stand where ids[1] stood, and vice versa
    const [a, b] = swap.pre;
    const pa = project(new THREE.Vector3(...(a.pos as [number, number, number])), cam, W, H);
    const pb = project(new THREE.Vector3(...(b.pos as [number, number, number])), cam, W, H);
    const after = t >= swap.t;
    if (pb.visible) markers.push({ x: pb.x, y: pb.y, text: `${after ? '✓ expect' : 'after swap'} ${swap.ids[0].toUpperCase()}`, color: '#ffd23f' });
    if (pa.visible) markers.push({ x: pa.x, y: pa.y, text: `${after ? '✓ expect' : 'after swap'} ${swap.ids[1].toUpperCase()}`, color: '#5ce1ff' });
  }
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', fontFamily: 'Consolas, monospace' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, padding: '10px 16px', background: 'rgba(0,0,0,0.72)', color: '#fff', fontSize: 26, display: 'flex', gap: 28 }}>
        <span style={{ color: '#ffd23f', fontWeight: 700 }}>{label}</span>
        <span>t {t.toFixed(2)} / {dur.toFixed(2)} s</span>
        {swap && <span style={{ color: '#c9a6ff' }}>swap @ {swap.t.toFixed(2)} s {swap.keepPaths ? '(paths)' : ''}</span>}
        {flow && <span style={{ color: flow.on ? '#9dff6b' : '#aaa' }}>{flow.on ? `FLOW in (${flow.camBlend.toFixed(2)} s)` : `CUT in`} · {flow.reason}</span>}
      </div>
      {markers.map((m, i) => (
        <div key={'m' + i} style={{ position: 'absolute', left: m.x - 46, top: m.y - 18, width: 92, height: 36, border: `4px dashed ${m.color}`, borderRadius: '50%' }}>
          <div style={{ position: 'absolute', top: 38, left: -60, width: 212, textAlign: 'center', color: m.color, fontSize: 20, fontWeight: 700, textShadow: '0 2px 3px #000' }}>{m.text}</div>
        </div>
      ))}
      {tags.map((g, i) =>
        g.head.visible ? (
          <React.Fragment key={'t' + i}>
            <div style={{ position: 'absolute', left: g.head.x, top: g.head.y - 44, transform: 'translateX(-50%)', background: g.color, color: '#000', padding: '3px 10px', borderRadius: 6, fontSize: 24, fontWeight: 800, opacity: g.ghost ? 0.5 : 1, whiteSpace: 'nowrap' }}>
              {g.name}
            </div>
            {g.feet.visible && <div style={{ position: 'absolute', left: g.feet.x - 7, top: g.feet.y - 7, width: 14, height: 14, borderRadius: 7, background: g.color, border: '2px solid #000' }} />}
          </React.Fragment>
        ) : null,
      )}
    </AbsoluteFill>
  );
};
