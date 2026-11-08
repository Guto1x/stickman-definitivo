// Effects library. Every effect is a pure function of time (seconds since its trigger),
// so frames render in any order. Styles follow the toon look: dust is shaded blobs, energy is
// additive purple light, shockwaves are flat white rings.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Vec3 } from '../types';
import { envMaterial, flat } from './materials';
import { glowTexture } from './Stickman';

const sphere = new THREE.SphereGeometry(1, 20, 14);
const leafGeo = new THREE.CircleGeometry(1, 10);
const ringGeo = new THREE.RingGeometry(0.86, 1, 96);
const torusGeo = new THREE.TorusGeometry(1, 0.035, 10, 96);
const planeGeo = new THREE.PlaneGeometry(1, 1);

export function rand(seed: number) {
  let s = Math.floor(seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** Soft additive glow sprite. */
export const Glow: React.FC<{ p: Vec3 | THREE.Vector3; size: number | [number, number]; color: string; opacity?: number }> = ({ p, size, color, opacity = 0.6 }) => {
  const s = typeof size === 'number' ? [size, size] : size;
  if (opacity <= 0.001) return null;
  return (
    <sprite position={Array.isArray(p) ? p : p.toArray()} scale={[s[0], s[1], 1]} renderOrder={6}>
      <spriteMaterial map={glowTexture()} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  );
};

/** Rising energy sparks around a body. `t` = seconds since start; `area` = half extents. */
export const Sparks: React.FC<{ t: number; center: THREE.Vector3; n?: number; area?: Vec3; color?: string; seed?: number; intensity?: number }> = ({ t, center, n = 26, area = [0.35, 0.8, 0.25], color = '#c9a4ff', seed = 3, intensity = 1 }) => {
  if (t < 0 || intensity <= 0) return null;
  const r = rand(seed);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const life = 0.45 + r() * 0.5, delay = r() * life;
    const ph = ((t + delay) % life) / life;
    const x = (r() * 2 - 1) * area[0], y0 = (r() * 2 - 1) * area[1], z = (r() * 2 - 1) * area[2];
    const rise = 0.25 + r() * 0.5;
    const s = 0.012 * (1 - ph) * (0.6 + r()) * intensity;
    const wob = Math.sin((t + i) * 9) * 0.03;
    if (s <= 0.001) continue;
    out.push(<mesh key={i} geometry={sphere} material={flat(i % 3 === 0 ? '#ffffff' : color)} position={[center.x + x + wob, center.y + y0 + ph * rise, center.z + z]} scale={s} />);
  }
  return <group>{out}</group>;
};

/** Toon dust burst: shaded puffs that fly out, grow, then shrink away. */
export const DustBurst: React.FC<{ t: number; origin: Vec3; n?: number; dir?: Vec3; spread?: number; speed?: number; color?: string; seed?: number; size?: number; life?: number }> = ({
  t, origin, n = 36, dir = [0, 0, 0], spread = 1, speed = 5, color = '#efe7d8', seed = 11, size = 0.35, life = 1.1,
}) => {
  if (t < 0 || t > life * 1.6) return null;
  const r = rand(seed);
  const m = envMaterial(color);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const up = 0.15 + r() * 0.5;
    const v = speed * (0.4 + r() * 0.8);
    const vx = Math.cos(a) * spread + dir[0], vz = Math.sin(a) * spread + dir[2];
    const L = Math.hypot(vx, vz) || 1;
    const drag = 3.2 + r() * 2;
    const k = (1 - Math.exp(-drag * t)) / drag;
    const myLife = life * (0.6 + r() * 0.6);
    const ph = t / myLife;
    if (ph >= 1) continue;
    const grow = easeOut(ph * 3) * (1 - Math.pow(ph, 2.2));
    const sc = size * (0.5 + r() * 0.8) * grow;
    if (sc < 0.004) continue;
    out.push(
      <mesh key={i} geometry={sphere} material={m} castShadow={false}
        position={[origin[0] + (vx / L) * v * k, origin[1] + 0.1 + up * v * k * 0.5 + sc * 0.6, origin[2] + (vz / L) * v * k]}
        scale={[sc, sc * 0.85, sc]} />,
    );
  }
  return <group>{out}</group>;
};

/** Leaves/paper bits blown along a direction with spin and gravity. */
export const Leaves: React.FC<{ t: number; origin: Vec3; n?: number; push?: Vec3; area?: Vec3; seed?: number; colors?: string[] }> = ({
  t, origin, n = 24, push = [14, 3, 0], area = [2.5, 0.2, 1.5], seed = 5, colors = ['#5aa54a', '#7cbf55', '#e2b23f', '#d9822b', '#f2efe6'],
}) => {
  if (t < 0) return null;
  const r = rand(seed);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x0 = origin[0] + (r() * 2 - 1) * area[0], y0 = origin[1] + r() * area[1], z0 = origin[2] + (r() * 2 - 1) * area[2];
    const delay = r() * 0.12;
    const tt = Math.max(0, t - delay);
    const drag = 1.6 + r() * 1.5;
    const k = (1 - Math.exp(-drag * tt)) / drag;
    const pv = 0.5 + r() * 0.9;
    const x = x0 + push[0] * pv * k, z = z0 + push[2] * pv * k + Math.sin(tt * 5 + i) * 0.3 * k;
    const y = Math.max(0.03, y0 + push[1] * pv * k - 0.9 * tt * tt + Math.sin(tt * 7 + i) * 0.08);
    const spin = (r() * 2 - 1) * 14;
    const c = colors[Math.floor(r() * colors.length)];
    out.push(
      <mesh key={i} geometry={leafGeo} material={envMaterial(c)} position={[x, y, z]}
        rotation={[spin * tt + i, spin * tt * 0.7, i * 0.5]} scale={[0.07, 0.04, 1]}>
        {null}
      </mesh>,
    );
  }
  return <group>{out}</group>;
};

/** Flat expanding ground ring + vertical sonic ring. */
export const Shockwave: React.FC<{ t: number; origin: Vec3; maxR?: number; dur?: number; color?: string; air?: boolean; airAxis?: 'x' | 'z' }> = ({ t, origin, maxR = 7, dur = 0.45, color = '#ffffff', air = true, airAxis = 'x' }) => {
  if (t < 0 || t > dur * 1.5) return null;
  const k = easeOut(t / dur);
  const op = Math.max(0, 1 - t / dur) * 0.85;
  const airK = easeOut(t / (dur * 0.7));
  const airOp = Math.max(0, 1 - t / (dur * 0.7)) * 0.45;
  return (
    <group>
      {op > 0 && (
        <mesh geometry={ringGeo} position={[origin[0], origin[1] + 0.02, origin[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={0.2 + k * maxR} renderOrder={4}>
          <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      )}
      {air && airOp > 0 && (
        <mesh geometry={torusGeo} position={[origin[0], origin[1] + 1.0, origin[2]]} rotation={airAxis === 'x' ? [0, Math.PI / 2, 0] : [0, 0, 0]} scale={0.3 + airK * 2.4} renderOrder={4}>
          <meshBasicMaterial color={color} transparent opacity={airOp} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

let trailTex: THREE.Texture | null = null;
function trailTexture() {
  if (trailTex) return trailTex;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 64;
  const g = c.getContext('2d')!;
  const img = g.createImageData(512, 64);
  for (let y = 0; y < 64; y++)
    for (let x = 0; x < 512; x++) {
      const v = 1 - Math.abs(y - 31.5) / 32; // across
      const a = Math.pow(Math.max(0, v), 2.2) * Math.pow(x / 511, 1.4); // fades toward the tail (x=0)
      const i = (y * 512 + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
      img.data[i + 3] = Math.round(a * 255);
    }
  g.putImageData(img, 0, 0);
  trailTex = new THREE.CanvasTexture(c);
  return trailTex;
}

/** Light-streak ribbon from `from` to `to` (head end bright), billboarded around its axis toward the camera. */
export const Trail: React.FC<{ from: Vec3; to: Vec3; width?: number; color?: string; opacity?: number; camPos: THREE.Vector3; core?: boolean }> = ({ from, to, width = 0.5, color = '#a46bff', opacity = 1, camPos, core = true }) => {
  if (opacity <= 0.001) return null;
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const axis = b.clone().sub(a);
  const len = axis.length();
  if (len < 0.01) return null;
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const xAxis = axis.clone().normalize();
  const toCam = camPos.clone().sub(mid);
  const zAxis = toCam.clone().sub(xAxis.clone().multiplyScalar(toCam.dot(xAxis))).normalize();
  const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis));
  return (
    <group position={mid} quaternion={q}>
      {/* normal blending so the purple still reads over a bright daytime street */}
      <mesh geometry={planeGeo} scale={[len, width, 1]} renderOrder={7}>
        <meshBasicMaterial map={trailTexture()} color={color} transparent opacity={opacity * 0.9} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {core && (
        <mesh geometry={planeGeo} scale={[len, width * 0.28, 1]} renderOrder={8}>
          <meshBasicMaterial map={trailTexture()} color="#ffffff" transparent opacity={opacity * 0.9} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

/** Thin white air-streaks flying past (world-space), for speed. */
export const AirStreaks: React.FC<{ t: number; center: Vec3; n?: number; dir?: 1 | -1; speed?: number; area?: Vec3; seed?: number; opacity?: number }> = ({ t, center, n = 18, dir = -1, speed = 60, area = [12, 1.6, 2.5], seed = 9, opacity = 0.7 }) => {
  const r = rand(seed);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const L = area[0] * 2;
    const off = r() * L;
    const x = center[0] + ((((off + dir * speed * t * (0.7 + r() * 0.6)) % L) + L) % L) - area[0];
    const y = center[1] + (r() * 2 - 1) * area[1];
    const z = center[2] + (r() * 2 - 1) * area[2];
    const len = 1.5 + r() * 3.5;
    out.push(
      <mesh key={i} geometry={planeGeo} position={[x, y, z]} scale={[len, 0.012 + r() * 0.012, 1]} renderOrder={6}>
        <meshBasicMaterial map={trailTexture()} color="#ffffff" transparent opacity={opacity * (0.4 + r() * 0.6)} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>,
    );
  }
  return <group>{out}</group>;
};

/** Pill prop: two-tone capsule (purple/white). Local origin at its centre. */
export const Pill: React.FC<{ p?: Vec3; r?: Vec3; s?: number }> = ({ p, r, s = 1 }) => {
  const halfA = useMemo(() => new THREE.CapsuleGeometry(0.0105, 0.016, 6, 16), []);
  return (
    <group position={p} rotation={r} scale={s}>
      <mesh geometry={halfA} material={envMaterial('#8a4dff')} position={[0, 0.0085, 0]} scale={[1, 1, 1]} />
      <mesh geometry={halfA} material={envMaterial('#f6f2ff')} position={[0, -0.0085, 0]} />
    </group>
  );
};
