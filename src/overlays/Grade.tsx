// Final-look overlays: IFOLOGY's heavy vignette plus fine animated film grain.
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const Grade: React.FC<{ vignette?: number; grain?: number; tint?: string }> = ({ vignette = 0.55, grain = 0.035, tint }) => {
  const frame = useCurrentFrame();
  // A few pre-baked grain tiles cycled per frame (deterministic, cheap).
  const tiles = useMemo(() => {
    const out: string[] = [];
    for (let k = 0; k < 6; k++) {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const g = c.getContext('2d')!;
      const img = g.createImageData(256, 256);
      let s = 1234 + k * 999;
      for (let i = 0; i < img.data.length; i += 4) {
        s = (s * 1664525 + 1013904223) >>> 0;
        const v = s >>> 24;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      out.push(c.toDataURL());
    }
    return out;
  }, []);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {tint && <AbsoluteFill style={{ background: tint, mixBlendMode: 'soft-light' }} />}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 72% 70% at 50% 48%, rgba(0,0,0,0) 52%, rgba(10,6,14,${vignette * 0.55}) 78%, rgba(6,4,10,${vignette}) 100%)`,
        }}
      />
      {grain > 0 && (
        <AbsoluteFill style={{ backgroundImage: `url(${tiles[frame % tiles.length]})`, backgroundSize: '256px 256px', opacity: grain, mixBlendMode: 'overlay' }} />
      )}
    </AbsoluteFill>
  );
};
