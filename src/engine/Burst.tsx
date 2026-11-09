// Sunburst backdrop for a reveal (house beat effect, 2026-11-09): a big camera-facing disc of rays placed
// behind a character, slowly turning — the "ta-da" background the Vitinho reference cuts to on a reveal.
// It sits between the character and the set, so the set disappears behind it for those seconds.
import React from 'react';
import * as THREE from 'three';
import type { CamState } from './cam';

const texCache = new Map<string, THREE.CanvasTexture>();

/** Rays texture (two tones alternating), built once per colour pair. */
function raysTexture(a: string, b: string): THREE.CanvasTexture {
  const key = `${a}|${b}`;
  let tex = texCache.get(key);
  if (tex) return tex;
  const S = 1024, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.fillStyle = b;
  g.fillRect(0, 0, S, S);
  const n = 18;
  g.fillStyle = a;
  for (let k = 0; k < n; k++) {
    const a0 = (k / n) * Math.PI * 2, a1 = a0 + Math.PI / n;
    g.beginPath();
    g.moveTo(S / 2, S / 2);
    g.lineTo(S / 2 + Math.cos(a0) * S, S / 2 + Math.sin(a0) * S);
    g.lineTo(S / 2 + Math.cos(a1) * S, S / 2 + Math.sin(a1) * S);
    g.closePath();
    g.fill();
  }
  // a soft bright core
  const rg = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.5);
  rg.addColorStop(0, 'rgba(255,255,255,0.55)');
  rg.addColorStop(0.35, 'rgba(255,255,255,0.08)');
  rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, S, S);
  tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, tex);
  return tex;
}

const disc = new THREE.CircleGeometry(1, 64);

export const BURST_COLORS: Record<string, [string, string]> = {
  gold: ['#ffd23f', '#ffb21a'],
  purple: ['#a58bff', '#7a5cff'],
  teal: ['#57e0c8', '#25b8a6'],
  pink: ['#ff8fb5', '#ff5c93'],
  blue: ['#7fc4ff', '#4a90ff'],
};

/** `center`: the character's chest; the disc goes `behind` metres further from the camera, facing it. */
export const Burst: React.FC<{ t: number; cam: CamState; center: THREE.Vector3; color?: string; behind?: number; k?: number }> = ({ t, cam, center, color = 'gold', behind = 1.6, k = 1 }) => {
  const [a, b] = BURST_COLORS[color] || BURST_COLORS.gold;
  const mat = React.useMemo(() => new THREE.MeshBasicMaterial({ map: raysTexture(a, b), toneMapped: false, transparent: true, depthWrite: false, fog: false }), [a, b]);
  mat.opacity = k;
  const dir = center.clone().sub(cam.pos).normalize();
  const pos = center.clone().addScaledVector(dir, behind);
  const dist = pos.distanceTo(cam.pos);
  const size = Math.tan((cam.fov * Math.PI) / 360) * dist * 2.6 * (0.6 + 0.4 * k);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().negate());
  const spin = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), t * 0.35);
  q.multiply(spin);
  return <mesh geometry={disc} material={mat} position={pos} quaternion={q} scale={size} renderOrder={-5} />;
};
