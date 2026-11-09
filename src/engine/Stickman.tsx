// The stickman, modelled on the IFOLOGY look: matte black sphere head with a cream crescent,
// tiny line-art face, puffy cel-shaded clothing with thin black contours, stick limbs, mitten hands.
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ActorState, FullFace } from './actor';
import { DIM } from './actor';
import { clothMaterial, flat, inkMaterial, outlineMaterial, toon } from './materials';
import { HandProp } from '../sets/props';

const geoCache = new Map<string, THREE.BufferGeometry>();
const memo = (key: string, make: () => THREE.BufferGeometry) => {
  if (!geoCache.has(key)) geoCache.set(key, make());
  return geoCache.get(key)!;
};
const capsule = (len: number, r: number) => memo(`cap|${len.toFixed(3)}|${r.toFixed(3)}`, () => new THREE.CapsuleGeometry(r, Math.max(0.001, len), 8, 16));
const sphere = memo('sphere', () => new THREE.SphereGeometry(1, 40, 28));
const headGeo = memo('head', () => new THREE.SphereGeometry(DIM.headR, 64, 48));
const cyl = memo('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 24));

/** Puffy hoodie body: a lathe profile (waist → chest → shoulders → neck), flattened front-to-back.
 *  The upper part rides the spine; the hem part rides the hips so bending never flares it like a bell. */
const lathe = (key: string, pts: number[][]) =>
  memo(key, () => {
    // bottom → top so the lathe faces point outward
    const g = new THREE.LatheGeometry(new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(40), 48);
    g.computeVertexNormals();
    return g;
  });
const hoodieGeo = (len: number) =>
  lathe(`hoodie|${len}`, [
    [0.0, -0.035], [0.15, -0.034], [0.167, 0.0], [0.165, len * 0.45], [0.168, len - 0.16],
    [0.155, len - 0.06], [0.11, len - 0.01], [0.06, len + 0.015], [0.0, len + 0.02],
  ]);
const hemSkirtGeo = lathe('hemSkirt', [[0.0, -0.13], [0.15, -0.128], [0.171, -0.105], [0.17, -0.03], [0.16, 0.06], [0.15, 0.13], [0.0, 0.135]]);
// long coat tails (lab coats) and a flared dress, also riding the hips
const coatTailGeo = lathe('coatTail', [[0.0, -0.5], [0.2, -0.49], [0.215, -0.45], [0.19, -0.2], [0.168, 0.02], [0.15, 0.13], [0.0, 0.135]]);
const dressGeo = lathe('dress', [[0.0, -0.46], [0.28, -0.45], [0.29, -0.42], [0.2, -0.15], [0.16, 0.06], [0.15, 0.13], [0.0, 0.135]]);
const hemGeo = memo('hem', () => new THREE.TorusGeometry(1, 0.16, 12, 48));
/** Trapezoid kangaroo pocket with rounded corners, slightly puffy. */
const pocketGeo = memo('pocket', () => {
  const s = new THREE.Shape();
  const w0 = 0.075, w1 = 0.1, h = 0.11, r = 0.018;
  s.moveTo(-w1 + r, 0);
  s.lineTo(w1 - r, 0);
  s.quadraticCurveTo(w1, 0, w1, r);
  s.lineTo(w0, h - r);
  s.quadraticCurveTo(w0, h, w0 - r, h);
  s.lineTo(-w0 + r, h);
  s.quadraticCurveTo(-w0, h, -w0, h - r);
  s.lineTo(-w1, r);
  s.quadraticCurveTo(-w1, 0, -w1 + r, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3, curveSegments: 6 });
  g.computeVertexNormals();
  return g;
});
const hoodGeo = memo('hood', () => new THREE.TorusGeometry(0.1, 0.045, 14, 32, Math.PI * 1.15));

type Mat = THREE.Material;

/** Contours are switched off for a whole character (afterimages) through context. */
const OutlineCtx = createContext(true);

/** Mesh plus its inverted-hull contour. */
const O: React.FC<{
  g: THREE.BufferGeometry; m: Mat; p?: [number, number, number]; r?: [number, number, number]; s?: number | [number, number, number];
  outline?: boolean; shadow?: boolean;
}> = ({ g, m, p, r, s, outline = true, shadow = true }) => {
  const allowed = useContext(OutlineCtx);
  return (
    <group position={p} rotation={r} scale={s as never}>
      <mesh geometry={g} material={m} castShadow={shadow && allowed} />
      {outline && allowed && <mesh geometry={g} material={outlineMaterial()} />}
    </group>
  );
};

/** A bone: world transform decomposed into props so three's normal update path applies. */
const Bone: React.FC<{ m: THREE.Matrix4; children?: React.ReactNode }> = ({ m, children }) => {
  const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  m.decompose(p, q, s);
  return <group position={p} quaternion={q} scale={s}>{children}</group>;
};

/** Segment hanging down from its joint (bone-local -Y). */
const Seg: React.FC<{ len: number; r: number; mat: Mat; from?: number; to?: number; outline?: boolean }> = ({ len, r, mat, from = 0, to = 1, outline = true }) => {
  const l = len * (to - from);
  return <O g={capsule(l, r)} m={mat} p={[0, -len * from - l / 2, 0]} outline={outline} />;
};

// --- face ---------------------------------------------------------------------------------
const FACE_PHI = (112 * Math.PI) / 180;
const FACE_THETA0 = (38 * Math.PI) / 180;
const FACE_THETA = (104 * Math.PI) / 180;
const faceGeo = memo('face', () => new THREE.SphereGeometry(DIM.headR * 1.003, 64, 48, Math.PI / 2 - FACE_PHI / 2, FACE_PHI, FACE_THETA0, FACE_THETA));
const INK = '#fbf3e4';

/** Thin white line-art face, drawn fresh every frame. Canvas units are 0..1 across the face patch. */
function drawFace(ctx: CanvasRenderingContext2D, f: FullFace, mouthOpen: number, glow?: string) {
  const S = ctx.canvas.width;
  ctx.clearRect(0, 0, S, S);
  ctx.save();
  ctx.scale(S, S);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 0.02 * S;
  }
  // feature scale around the face centre (thumbnails exaggerate)
  const fs = f.size ?? 1;
  if (fs !== 1) {
    ctx.translate(0.5, 0.55);
    ctx.scale(fs, fs);
    ctx.translate(-0.5, -0.55);
  }
  const lx = (f.look?.[0] ?? 0) * 0.018, ly = (f.look?.[1] ?? 0) * 0.014;
  const eyeY = 0.515 + ly, dx = 0.068;
  const open = Math.max(0, f.eyes);
  const wide = open > 1.12;
  for (const side of [-1, 1]) {
    const cx = 0.5 + side * dx + lx;
    if (open < 0.18) {
      // closed: ∩ when smiling, ‿ otherwise
      ctx.lineWidth = 0.011;
      ctx.beginPath();
      const up = f.mouth > 0.45 ? -1 : 1;
      ctx.moveTo(cx - 0.024, eyeY + 0.004);
      ctx.quadraticCurveTo(cx, eyeY + up * 0.026, cx + 0.024, eyeY + 0.004);
      ctx.stroke();
    } else if (wide) {
      const r = 0.026 + (open - 1.12) * 0.03;
      ctx.beginPath();
      ctx.ellipse(cx, eyeY - 0.005, r, r * 1.12, 0, 0, Math.PI * 2);
      ctx.fill();
      if (f.pupils) {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0a0a0d';
        ctx.beginPath();
        ctx.ellipse(cx + lx * 0.8, eyeY - 0.003, r * 0.34, r * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      ctx.beginPath();
      ctx.ellipse(cx, eyeY, 0.0145, 0.026 * Math.min(1, open), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const lid = f.lid ?? 0;
    if (lid > 0.02 && open >= 0.18) {
      // heavy upper lid: cut the top of the eye along a line tilted by the brow (inner end lower when sly)
      const ry = wide ? 0.03 + (open - 1.12) * 0.034 : 0.026 * Math.min(1, open);
      const cut = eyeY - ry + 2 * ry * lid;
      const tilt = side * (f.lidTilt ?? f.brow ?? 0) * 0.012 * (wide ? 1.4 : 1);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(cx - 0.06, cut - tilt - 0.2);
      ctx.lineTo(cx + 0.06, cut + tilt - 0.2);
      ctx.lineTo(cx + 0.06, cut + tilt);
      ctx.lineTo(cx - 0.06, cut - tilt);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    if (Math.abs(f.brow) > 0.12 || f.browY > 0.1) {
      const by = eyeY - 0.058 - f.browY * 0.03 - (wide ? 0.02 : 0);
      const tilt = f.brow * 0.018;
      ctx.lineWidth = 0.011;
      ctx.beginPath();
      ctx.moveTo(cx + side * 0.03, by + tilt * 0.4);
      ctx.lineTo(cx - side * 0.022, by - tilt);
      ctx.stroke();
    }
    if (f.blush) {
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,130,150,0.5)';
      ctx.beginPath();
      ctx.ellipse(cx + side * 0.03, eyeY + 0.06, 0.024, 0.012, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (f.tears) {
      ctx.save();
      ctx.fillStyle = 'rgba(150,205,255,0.95)';
      ctx.beginPath();
      ctx.ellipse(cx + side * 0.012, eyeY + 0.05, 0.008, 0.016, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  if (f.sweat) {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(160,215,255,0.95)';
    ctx.beginPath();
    ctx.ellipse(0.63, 0.43, 0.011, 0.02, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // mouth
  const mx = 0.5 + lx * 0.6, my = 0.6 + ly * 0.5;
  const mw = 0.03 * (f.width ?? 1);
  const curve = f.mouth;
  ctx.lineWidth = 0.011;
  if (mouthOpen > 0.08) {
    const h = 0.008 + mouthOpen * 0.03;
    ctx.beginPath();
    if (curve > 0.4) {
      ctx.moveTo(mx - mw * 1.1, my - h * 0.2);
      ctx.lineTo(mx + mw * 1.1, my - h * 0.2);
      ctx.quadraticCurveTo(mx + mw, my + h * 1.5, mx, my + h * 1.4);
      ctx.quadraticCurveTo(mx - mw, my + h * 1.5, mx - mw * 1.1, my - h * 0.2);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.ellipse(mx, my + h * 0.2, mw * (0.45 + 0.2 * (1 - mouthOpen)), h, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(mx - mw, my - curve * 0.01);
    ctx.quadraticCurveTo(mx, my + curve * 0.024, mx + mw, my - curve * 0.01);
    ctx.stroke();
  }
  ctx.restore();
}

const FaceShell: React.FC<{ face: FullFace; mouthOpen: number; glow?: string; opacity?: number }> = ({ face, mouthOpen, glow, opacity = 1 }) => {
  const { tex, ctx } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 1024;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { tex: t, ctx: c.getContext('2d')! };
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  drawFace(ctx, face, mouthOpen, glow);
  tex.needsUpdate = true;
  return (
    <mesh geometry={faceGeo} renderOrder={2}>
      <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} opacity={opacity} polygonOffset polygonOffsetFactor={-4} />
    </mesh>
  );
};

// --- clothing -----------------------------------------------------------------------------
function shade(hex: string, k: number) {
  const c = new THREE.Color(hex);
  c.multiplyScalar(k);
  return '#' + c.getHexString();
}

const Top: React.FC<{ s: ActorState; ink: Mat; ghost?: Mat }> = ({ s, ink, ghost }) => {
  const c = s.cast;
  const top = c.top ?? 'none';
  const build = c.build ?? 1;
  const L = DIM.torso;
  if (top === 'none') return <O g={capsule(L * 0.8, 0.07 * build)} m={ink} p={[0, L * 0.5, 0]} />;
  const cloth = ghost || clothMaterial(c.topColor || '#6f45b8');
  const trim = ghost || clothMaterial(c.accent || shade(c.topColor || '#6f45b8', 1.35));
  const len = L + 0.02;
  return (
    <group>
      <O g={hoodieGeo(len)} m={cloth} s={[build, 1, 0.74]} />
      {top === 'hoodie' && (
        <>
          {/* hood resting on the shoulders behind the neck */}
          <O g={hoodGeo} m={cloth} p={[0, L - 0.035, -0.045]} r={[Math.PI / 2 + 0.3, 0, Math.PI * 1.075]} s={[build * 0.95, 0.9, 1.0]} />
          {/* drawstrings with tips */}
          {[-1, 1].map(k => (
            <group key={k}>
              <O g={cyl} m={ghost || flat('#f6f2ff')} p={[k * 0.04, L - 0.12, 0.118]} r={[0.1, 0, 0]} s={[0.0055, 0.13, 0.0055]} outline={false} />
              <O g={cyl} m={ghost || flat('#ffffff')} p={[k * 0.04, L - 0.19, 0.125]} r={[0.1, 0, 0]} s={[0.008, 0.02, 0.008]} outline={false} />
            </group>
          ))}
          {/* kangaroo pocket */}
          <O g={pocketGeo} m={ghost || clothMaterial(shade(c.topColor || '#6f45b8', 0.8))} p={[0, 0.0, 0.112]} r={[-0.06, 0, 0]} s={[build, 1, 1]} />
        </>
      )}
      {top === 'jacket' && (
        <O g={memo('placket', () => new THREE.BoxGeometry(1, 1, 1))} m={ghost || flat(c.accent || '#f4ead6')} p={[0, L * 0.42, 0.122]} s={[0.016, L * 0.86, 0.008]} outline={false} />
      )}
    </group>
  );
};

const HeadGear: React.FC<{ s: ActorState; ink: Mat; ghost?: Mat }> = ({ s, ink, ghost }) => {
  const c = s.cast;
  const r = DIM.headR;
  const out: React.ReactNode[] = [];
  const hair = c.hair ?? 'none';
  if (hair === 'spiky')
    for (let i = 0; i < 6; i++) {
      const a = -0.8 + (i / 5) * 1.6;
      out.push(<O key={'h' + i} g={memo('cone', () => new THREE.ConeGeometry(1, 1, 12))} m={ink} p={[Math.sin(a) * r * 0.62, r * 0.9, -0.04]} r={[-0.5, 0, -a * 0.7]} s={[0.065, 0.2, 0.065]} />);
    }
  if (hair === 'bun') out.push(<O key="bun" g={sphere} m={ink} p={[0, r * 0.7, -r * 0.72]} s={0.1} />);
  if (hair === 'afro') out.push(<O key="afro" g={sphere} m={ink} p={[0, r * 0.15, -r * 0.1]} s={[r * 1.3, r * 1.2, r * 1.22]} />);
  if (hair === 'long' || hair === 'bob') {
    out.push(<O key="hc" g={memo('hairCap', () => new THREE.SphereGeometry(r * 1.06, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.56))} m={ink} p={[0, 0, -0.015]} />);
    const len = hair === 'long' ? 0.4 : 0.18;
    out.push(<O key="hb" g={capsule(len, r * 0.9)} m={ink} p={[0, -len * 0.5, -r * 0.42]} s={[1, 1, 0.55]} />);
  }
  if (hair === 'ponytail') out.push(<O key="pt" g={capsule(0.2, 0.045)} m={ink} p={[0, r * 0.1, -r * 1.12]} r={[0.45, 0, 0]} />);
  if (c.hat === 'cap') {
    const hm = ghost || clothMaterial(c.hatColor || '#f2b632');
    out.push(<O key="cap" g={memo('capDome', () => new THREE.SphereGeometry(r * 1.04, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.43))} m={hm} r={[-0.1, 0, 0]} />);
    out.push(<O key="brim" g={cyl} m={hm} p={[0, r * 0.4, r * 0.84]} r={[0.2, 0, 0]} s={[r * 0.72, 0.016, r * 0.6]} />);
  }
  if (c.hat === 'helmet') {
    // firefighter helmet: tall dome, wide brim that sweeps longer at the back, a cream front shield
    const hm = ghost || clothMaterial(c.hatColor || '#e8b830');
    out.push(<O key="hel" g={memo('helmetDome', () => new THREE.SphereGeometry(r * 1.13, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.47))} m={hm} r={[-0.06, 0, 0]} />);
    out.push(<O key="helBrim" g={cyl} m={hm} p={[0, r * 0.18, -r * 0.2]} r={[-0.1, 0, 0]} s={[r * 1.32, 0.02, r * 1.42]} />);
    out.push(<O key="helShield" g={cyl} m={ghost || flat('#ffd24a')} p={[0, r * 0.78, r * 0.98]} r={[Math.PI / 2 - 0.35, 0, 0]} s={[r * 0.22, 0.02, r * 0.26]} />);
  }
  if (c.hat === 'beanie') out.push(<O key="bn" g={memo('beanie', () => new THREE.SphereGeometry(r * 1.06, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.47))} m={ghost || clothMaterial(c.hatColor || '#6f45b8')} />);
  if (c.hat === 'headband') out.push(<O key="hb2" g={cyl} m={ghost || clothMaterial(c.hatColor || '#c8402f')} p={[0, r * 0.45, 0]} r={[-0.12, 0, 0]} s={[r * 0.93, 0.04, r * 0.93]} />);
  if (c.glasses) {
    // IFOLOGY-style round glasses: tinted lens, white rim, a highlight streak
    const lens = ghost || flat(c.glassesColor || '#8fd0f5', 0.92);
    const rim = ghost || flat('#f4f1ea');
    for (const k of [-1, 1]) {
      const px = k * 0.052, py = -0.008, pz = r * 0.985;
      const ry = k * 0.24;
      out.push(<O key={'gl' + k} g={memo('lensDisc', () => new THREE.CircleGeometry(1, 40))} m={lens} p={[px, py, pz]} r={[0, ry, 0]} s={0.04} outline={false} shadow={false} />);
      out.push(<O key={'gr' + k} g={memo('lensRim', () => new THREE.TorusGeometry(1, 0.1, 8, 40))} m={rim} p={[px, py, pz + 0.002]} r={[0, ry, 0]} s={0.041} outline={false} shadow={false} />);
      out.push(<O key={'gh' + k} g={memo('lensHi', () => new THREE.PlaneGeometry(1, 1))} m={ghost || flat('#ffffff', 0.85)} p={[px - 0.008, py + 0.012, pz + 0.004]} r={[0, ry, 0.7]} s={[0.032, 0.006, 1]} outline={false} shadow={false} />);
    }
    out.push(<O key="gb" g={memo('box', () => new THREE.BoxGeometry(1, 1, 1))} m={rim} p={[0, -0.0, r * 1.0]} s={[0.026, 0.006, 0.006]} outline={false} />);
  }
  if (c.mask) {
    // breathing-apparatus face mask: a tinted visor over the face (features show through), dark rim, respirator
    out.push(<O key="mv" g={memo('maskVisor', () => new THREE.SphereGeometry(r * 1.07, 40, 20, -Math.PI * 0.32, Math.PI * 0.64, Math.PI * 0.22, Math.PI * 0.5))} m={ghost || flat(c.mask, 0.38)} p={[0, 0, 0]} r={[0, Math.PI / 2, 0]} outline={false} shadow={false} />);
    out.push(<O key="mr" g={memo('maskRim', () => new THREE.TorusGeometry(1, 0.06, 8, 40))} m={ghost || flat('#2a2d36')} p={[0, -r * 0.05, r * 0.86]} s={[r * 0.62, r * 0.78, r * 0.5]} outline={false} />);
    out.push(<O key="mp" g={cyl} m={ghost || clothMaterial('#3a3f4c')} p={[0, -r * 0.62, r * 0.88]} r={[Math.PI / 2 - 0.4, 0, 0]} s={[r * 0.2, r * 0.22, r * 0.2]} />);
  }
  return <>{out}</>;
};

const Mitten: React.FC<{ kind?: string; ink: Mat; side: 1 | -1 }> = ({ kind, ink, side }) => {
  if (kind === 'point')
    return (
      <group>
        <O g={sphere} m={ink} s={[0.042, 0.045, 0.036]} p={[0, -0.03, 0]} />
        <O g={capsule(0.06, 0.012)} m={ink} p={[0, -0.085, 0.01]} />
      </group>
    );
  const open = kind === 'open';
  return (
    <group>
      <O g={sphere} m={ink} s={open ? [0.05, 0.062, 0.026] : [0.046, 0.05, 0.04]} p={[0, -0.04, 0]} />
      {/* thumb */}
      <O g={capsule(0.03, 0.014)} m={ink} p={[side * -0.005, -0.03, 0.03]} r={[0.9, 0, side * 0.5]} />
    </group>
  );
};

/** onBeforeRender: place a glow sprite `back` metres behind `at`, on the far side from the camera. */
function glowBehind(at: THREE.Vector3, back: number) {
  const w = new THREE.Vector3();
  return function (this: unknown, _r: unknown, _s: unknown, cam: THREE.Camera) {
    const o = this as unknown as THREE.Object3D;
    w.copy(at).sub(cam.position).normalize().multiplyScalar(back).add(at);
    o.position.copy(o.parent ? o.parent.worldToLocal(w.clone()) : w);
    o.updateMatrixWorld();
  } as unknown as THREE.Object3D['onBeforeRender'];
}

let glowTex: THREE.Texture | null = null;
export function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grd.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

const depthOnly = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true, transparent: true });

function ghostMaterial(color: string, opacity: number) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthFunc: THREE.EqualDepth, toneMapped: false,
    uniforms: { uCol: { value: new THREE.Color(color) }, uEdge: { value: new THREE.Color('#f3e9ff') }, uOp: { value: opacity } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uCol; uniform vec3 uEdge; uniform float uOp; varying vec3 vN; varying vec3 vV;
      void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); vec3 c = mix(uCol, uEdge, pow(f, 2.2));
        gl_FragColor = vec4(c, uOp * (0.6 + 0.4 * f)); gl_FragColor = linearToOutputTexel(gl_FragColor); }`,
  });
}

/** Stamp a render order on a whole subtree. three resets the sort group at every nested Group,
 *  so a renderOrder on the outer group alone is not enough. Runs at commit, before the frame renders. */
const orderRef = (order: number) => (g: THREE.Object3D | null) => {
  if (g) g.traverse(o => { o.renderOrder = order; });
};

/** Afterimage: a single clean translucent silhouette — a depth-only pass, then a colour pass that
 *  only draws the front-most surface (EqualDepth), so limbs never show through the torso. */
const Ghost: React.FC<{ s: ActorState; opacity: number; color: string; order: number }> = ({ s, opacity, color, order }) => {
  const mat = useMemo(() => ghostMaterial(color, opacity), [color, opacity]);
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <>
      <group ref={orderRef(order)}><StickmanBody s={s} ghostMat={depthOnly} /></group>
      <group ref={orderRef(order + 1)}><StickmanBody s={s} ghostMat={mat} /></group>
    </>
  );
};

export const Stickman: React.FC<{ s: ActorState; shadowBlob?: boolean; ghostOpacity?: number; ghostColor?: string; ghostOrder?: number; faceGlow?: string }> = ({ s, shadowBlob = true, ghostOpacity, ghostColor, ghostOrder = 20, faceGlow }) => {
  if (s.spec.ghost || ghostOpacity !== undefined) return <Ghost s={s} opacity={ghostOpacity ?? 0.3} color={ghostColor || s.spec.glow || '#b48cff'} order={ghostOrder} />;
  return <StickmanBody s={s} shadowBlob={shadowBlob} faceGlow={faceGlow} />;
};

const StickmanBody: React.FC<{ s: ActorState; shadowBlob?: boolean; faceGlow?: string; ghostMat?: THREE.Material }> = ({ s, shadowBlob = true, faceGlow, ghostMat }) => {
  const c = s.cast;
  const isGhost = !!ghostMat;
  const ink = ghostMat || inkMaterial();
  const b = s.bones;
  const hasTop = c.top && c.top !== 'none';
  const sleeve = hasTop ? ghostMat || clothMaterial(c.topColor || '#6f45b8') : null;
  const cuff = hasTop ? ghostMat || clothMaterial(c.accent || shade(c.topColor || '#6f45b8', 1.35)) : null;
  const longSleeve = c.top === 'hoodie' || c.top === 'jacket' || c.top === 'coat' || c.top === 'suit';
  const pants = c.bottom && c.bottom !== 'none' ? ghostMat || clothMaterial(c.bottomColor || '#3a2a5c') : null;
  const shoe = ghostMat || (c.shoes ? clothMaterial(c.shoes) : ink);
  const sole = ghostMat || clothMaterial('#ffffff');
  const R = DIM.limbR;
  const ol = !ghostMat;
  const arm = (side: 'L' | 'R') => {
    const up = side === 'L' ? b.upperArmL : b.upperArmR, fo = side === 'L' ? b.forearmL : b.forearmR, ha = side === 'L' ? b.handL : b.handR;
    const kind = side === 'L' ? s.pose.handL : s.pose.handR;
    const held = s.spec.hold?.[side];
    const heldScale = s.spec.hold?.[side === 'L' ? 'scaleL' : 'scaleR'] ?? 1;
    return (
      <group key={side}>
        <Bone m={up}>
          {sleeve ? <Seg len={DIM.upperArm} r={0.054} mat={sleeve} from={0.06} to={c.top === 'tee' ? 0.5 : 1.02} outline={ol} /> : <Seg len={DIM.upperArm} r={R} mat={ink} outline={ol} />}
          {sleeve && c.top === 'tee' && <Seg len={DIM.upperArm} r={R} mat={ink} from={0.5} outline={ol} />}
        </Bone>
        <Bone m={fo}>
          {sleeve && longSleeve ? (
            <>
              <Seg len={DIM.forearm} r={0.05} mat={sleeve} to={0.78} outline={ol} />
              <O g={cyl} m={cuff!} p={[0, -DIM.forearm * 0.8, 0]} s={[0.047, 0.05, 0.047]} outline={ol} />
              <Seg len={DIM.forearm} r={R} mat={ink} from={0.8} outline={ol} />
            </>
          ) : (
            <Seg len={DIM.forearm} r={R} mat={ink} outline={ol} />
          )}
        </Bone>
        <Bone m={ha}>
          <Mitten kind={held ? 'fist' : kind} ink={ink} side={side === 'L' ? 1 : -1} />
          {held && !ghostMat && (heldScale === 1 ? <HandProp type={held} /> : <group scale={heldScale}><HandProp type={held} /></group>)}
        </Bone>
      </group>
    );
  };
  const leg = (side: 'L' | 'R') => {
    const th = side === 'L' ? b.thighL : b.thighR, sh = side === 'L' ? b.shinL : b.shinR, ft = side === 'L' ? b.footL : b.footR;
    return (
      <group key={side}>
        <Bone m={th}>{pants ? <Seg len={DIM.thigh} r={0.042} mat={pants} from={-0.04} to={1.03} outline={ol} /> : <Seg len={DIM.thigh} r={R + 0.004} mat={ink} outline={ol} />}</Bone>
        <Bone m={sh}>
          {pants && c.bottom === 'pants' ? (
            <>
              <Seg len={DIM.shin} r={0.038} mat={pants} to={0.86} outline={ol} />
              <Seg len={DIM.shin} r={R} mat={ink} from={0.85} outline={ol} />
            </>
          ) : (
            <Seg len={DIM.shin} r={R + 0.002} mat={ink} outline={ol} />
          )}
        </Bone>
        <Bone m={ft}>
          <O g={sphere} m={shoe} p={[0, 0.0, 0.05]} s={[0.052, 0.042, 0.1]} outline={ol} />
          <O g={capsule(0.13, 0.03)} m={sole} p={[0, -0.03, 0.05]} r={[Math.PI / 2, 0, 0]} s={[1.75, 1, 0.45]} outline={ol} />
        </Bone>
      </group>
    );
  };
  const lying = Math.abs(s.pose.body[0]) > 45 || s.pose.hipY < -0.7;
  return (
    <OutlineCtx.Provider value={!ghostMat}>
    <group>
      <Bone m={b.hips}>
        <O g={sphere} m={pants || ink} s={[0.09, 0.06, 0.065]} outline={ol} />
        {hasTop && c.top !== 'tee' && (
          <>
            <O g={c.top === 'coat' ? coatTailGeo : c.top === 'dress' ? dressGeo : hemSkirtGeo} m={sleeve!} s={[c.build ?? 1, 1, c.top === 'dress' ? 0.85 : 0.74]} outline={ol} />
            <O g={hemGeo} m={cuff!} p={[0, -0.11, 0]} r={[Math.PI / 2, 0, 0]} s={[0.168 * (c.build ?? 1), 0.168 * 0.74, 0.16]} outline={ol} />
          </>
        )}
      </Bone>
      <Bone m={b.spine}>
        <Top s={s} ink={ink} ghost={ghostMat} />
        {c.backpack && <O g={memo('box', () => new THREE.BoxGeometry(1, 1, 1))} m={ghostMat || clothMaterial(c.backpack)} p={[0, DIM.torso * 0.55, -0.17]} s={[0.24, 0.3, 0.12]} outline={ol} />}
      </Bone>
      <Bone m={b.chest}>
        <O g={capsule(DIM.neck + 0.03, 0.026)} m={ink} p={[0, 0.03, 0]} outline={false} />
      </Bone>
      <Bone m={b.head}>
        <O g={headGeo} m={ink} outline={ol} />
        {!ghostMat && <FaceShell face={s.face} mouthOpen={s.mouthOpen} glow={faceGlow} />}
        <HeadGear s={s} ink={ink} ghost={ghostMat} />
      </Bone>
      {arm('L')}
      {arm('R')}
      {leg('L')}
      {leg('R')}
      {s.spec.glow && !isGhost && (
        // pushed behind the body, away from the lens, every frame: an additive sprite in front of the
        // head's outline hull tinted it green in close-ups (hard-won rule "additive volumes tint ink")
        <sprite position={s.anchors.chest.toArray()} scale={[2.4 * s.scale, 2.8 * s.scale, 1]} renderOrder={5}
          onBeforeRender={glowBehind(s.anchors.chest, 0.45 * s.scale)}>
          <spriteMaterial map={glowTexture()} color={s.spec.glow} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      )}
      {shadowBlob && !lying && !isGhost && (
        <mesh position={[s.pos[0], s.pos[1] + 0.006, s.pos[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.3 * s.scale, 0.3 * s.scale, 1]} renderOrder={1}>
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial color="#000" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      )}
    </group>
    </OutlineCtx.Provider>
  );
};

export { drawFace };
