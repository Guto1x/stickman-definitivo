// Materials for the IFOLOGY-style look:
//  - "ink": matte black with a crisp cream crescent along the lit silhouette edge
//  - toon cloth: two-band cel shading plus a softer cream edge highlight
//  - outline: inverted hull with constant screen-space width (thin black contour)
import * as THREE from 'three';

// Shared uniforms. The active shot writes these each frame (one scene renders per frame).
export const LOOK = {
  uRimColor: { value: new THREE.Color('#f6e7c6') },
  uRimView: { value: new THREE.Vector3(-0.55, 0.8, 0.0).normalize() }, // rim light direction in view space
  uKeyDir: { value: new THREE.Vector3(0.6, 0.55, 0.45).normalize() },
  uRimAmbient: { value: 0.0 },
  uDesat: { value: 0 },
  uTint: { value: new THREE.Color('#ffffff') }, // multiplies rim (purple during power-up)
};

const gradients: Record<string, THREE.DataTexture> = {};
export function toonGradient(levels: number[]): THREE.DataTexture {
  const key = levels.join(',');
  if (gradients[key]) return gradients[key];
  const data = new Uint8Array(levels.length * 4);
  levels.forEach((v, i) => data.set([v, v, v, 255], i * 4));
  const tex = new THREE.DataTexture(data, levels.length, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  gradients[key] = tex;
  return tex;
}

type RimOpts = { rim?: number; width?: number; soft?: number; levels?: number[]; emissive?: string; spec?: number };

function patch(mat: THREE.Material, o: { rim: number; width: number; soft: number; spec: number }) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRimColor = LOOK.uRimColor;
    shader.uniforms.uRimView = LOOK.uRimView;
    shader.uniforms.uRimAmbient = LOOK.uRimAmbient;
    shader.uniforms.uDesat = LOOK.uDesat;
    shader.uniforms.uTint = LOOK.uTint;
    shader.uniforms.uRim = { value: o.rim };
    shader.uniforms.uRimW = { value: o.width };
    shader.uniforms.uSoft = { value: o.soft };
    shader.uniforms.uSpec = { value: o.spec };
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform vec3 uRimColor; uniform vec3 uRimView; uniform float uRimAmbient; uniform float uDesat; uniform vec3 uTint;
uniform float uRim; uniform float uRimW; uniform float uSoft; uniform float uSpec;`,
      )
      .replace(
        '#include <dithering_fragment>',
        `{
  vec3 Nv = normalize(normal);
  vec3 Vv = normalize(vViewPosition);
  float fr = 1.0 - clamp(dot(Nv, Vv), 0.0, 1.0);
  float band = smoothstep(uRimW, uRimW + uSoft, fr);
  float side = mix(uRimAmbient, 1.0, smoothstep(0.02, 0.22, dot(Nv, uRimView)));
  vec3 rc = uRimColor * uTint;
  gl_FragColor.rgb = mix(gl_FragColor.rgb, rc, clamp(band * side * uRim, 0.0, 1.0));
  vec3 H = normalize(uRimView + Vv);
  gl_FragColor.rgb += vec3(1.0, 0.98, 0.94) * smoothstep(0.985, 0.992, max(dot(Nv, H), 0.0)) * uSpec;
  float g = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(g) * vec3(0.93, 0.97, 1.06), uDesat);
}
#include <dithering_fragment>`,
      );
  };
  mat.customProgramCacheKey = () => `rim2-${o.rim}-${o.width}-${o.soft}-${o.spec}`;
}

const cache = new Map<string, THREE.Material>();

/** Cel-shaded material with the cream edge band. Cached by parameters. */
export function toon(color: string, opts: RimOpts = {}): THREE.MeshToonMaterial {
  const o = { rim: opts.rim ?? 0.55, width: opts.width ?? 0.7, soft: opts.soft ?? 0.06, spec: opts.spec ?? 0 };
  const levels = opts.levels ?? [120, 255];
  const key = `t|${color}|${o.rim}|${o.width}|${o.soft}|${o.spec}|${levels}|${opts.emissive ?? ''}`;
  let m = cache.get(key) as THREE.MeshToonMaterial | undefined;
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(levels) });
    if (opts.emissive) {
      m.emissive = new THREE.Color(opts.emissive);
      m.emissiveIntensity = 1;
    }
    patch(m, o);
    cache.set(key, m);
  }
  return m;
}

/** The character "skin": matte black with a crisp cream crescent on the lit edge. */
export function inkMaterial(): THREE.MeshToonMaterial {
  return toon('#020203', { rim: 1.0, width: 0.6, soft: 0.025, levels: [255, 255] });
}

/** Cloth: two-band cel shading, cream edge highlight. */
export function clothMaterial(color: string): THREE.MeshToonMaterial {
  return toon(color, { rim: 0.62, width: 0.68, soft: 0.05, levels: [90, 255] });
}

/** Environment surfaces: three soft bands, a faint edge highlight. */
export function envMaterial(color: string, emissive?: string): THREE.MeshToonMaterial {
  return toon(color, { rim: 0.18, width: 0.8, soft: 0.1, levels: [110, 190, 255], emissive });
}

/** Unlit flat colour (faces, windows, signage, glows). */
export function flat(color: string, opacity = 1): THREE.MeshBasicMaterial {
  const key = `f|${color}|${opacity}`;
  let m = cache.get(key) as THREE.MeshBasicMaterial | undefined;
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, toneMapped: false, depthWrite: opacity >= 1 });
    cache.set(key, m);
  }
  return m;
}

/** Inverted-hull outline, ~2.5 px wide at 1080p regardless of distance. */
let outline: THREE.ShaderMaterial | null = null;
export function outlineMaterial(): THREE.ShaderMaterial {
  if (outline) return outline;
  outline = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { uColor: { value: new THREE.Color('#07070a') }, uT: { value: 0.0014 } },
    vertexShader: `uniform float uT;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        mv.xyz += n * uT * max(0.6, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor, 1.0); }`,
  });
  return outline;
}
