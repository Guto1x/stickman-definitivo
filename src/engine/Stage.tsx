// A ThreeCanvas configured for the house look: supersampled, soft shadows, no tone mapping
// (flat toon colours stay exactly as specified), driven by an explicit CamState each frame.
import React from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { LOOK } from './materials';
import type { CamState } from './cam';

const CameraRig: React.FC<{ c: CamState }> = ({ c }) => {
  const { camera, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = c.fov;
  cam.aspect = size.width / size.height;
  cam.near = 0.05;
  cam.far = 900;
  cam.position.copy(c.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(c.look);
  if (c.roll) cam.rotateZ((c.roll * Math.PI) / 180);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return null;
};

/** Writes the view-space rim direction: from upper-left-behind of the subject, as on IFOLOGY. */
export function setRim(dirView: [number, number, number] = [-0.55, 0.8, 0.0], color?: string, tint?: string, ambient = 0) {
  LOOK.uRimView.value.set(...dirView).normalize();
  if (color) LOOK.uRimColor.value.set(color);
  LOOK.uTint.value.set(tint || '#ffffff');
  LOOK.uRimAmbient.value = ambient;
}

export const Stage: React.FC<{
  cam: CamState; width?: number; height?: number; dpr?: number; transparent?: boolean; style?: React.CSSProperties; children?: React.ReactNode;
}> = ({ cam, width = 1920, height = 1080, dpr = 2, transparent, style, children }) => (
  <ThreeCanvas
    width={width}
    height={height}
    dpr={dpr}
    shadows="soft"
    flat
    style={style}
    gl={{ antialias: true, alpha: !!transparent, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
    camera={{ fov: cam.fov, near: 0.05, far: 900, position: cam.pos.toArray() }}
  >
    <CameraRig c={cam} />
    {children}
  </ThreeCanvas>
);
