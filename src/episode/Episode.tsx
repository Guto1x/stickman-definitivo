// The long-form composition: reads public/episodes/<slug>/episode.json + timing.json and lays
// every shot on the timeline; plays mix.wav (voice + music + SFX) when it exists.
//   npx remotion render Episode out.mp4 --props='{"slug":"pilot"}'
import React from 'react';
import { AbsoluteFill, Audio, type CalculateMetadataFunction, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Grade } from '../overlays/Grade';
import type { Episode as EpisodeSpec, Shot3D, Timing } from '../types';
import type { ShotCtx } from './scene';
import { castOf } from './resolve';
import { ShotView } from './ShotView';
import { validate } from './validate';

export type EpisodeProps = { slug: string; episode?: EpisodeSpec; timing?: Timing; hasMix?: boolean; lenient?: boolean; review?: boolean };

export const calculateEpisodeMetadata: CalculateMetadataFunction<EpisodeProps> = async ({ props }) => {
  const base = `episodes/${props.slug}`;
  const episode: EpisodeSpec = await fetch(staticFile(`${base}/episode.json`)).then(r => r.json());
  const timing: Timing = await fetch(staticFile(`${base}/timing.json`)).then(r => {
    if (!r.ok) throw new Error(`no timing.json — run: node tools/episode.mjs draft ${props.slug}`);
    return r.json();
  });
  const hasMix = await fetch(staticFile(`${base}/mix.wav`), { method: 'HEAD' }).then(r => r.ok).catch(() => false);
  const problems = validate(episode);
  if (problems.length) {
    const msg = `episode "${props.slug}" has ${problems.length} problem(s):\n- ` + problems.join('\n- ');
    if (props.lenient) console.warn(msg);
    else throw new Error(msg);
  }
  if (timing.shots.length !== episode.shots.length) throw new Error(`timing.json has ${timing.shots.length} shots but episode.json has ${episode.shots.length} — re-run draft/align`);
  const fps = episode.fps || 30;
  return { durationInFrames: Math.max(1, Math.ceil(timing.total * fps)), fps, props: { ...props, episode, timing, hasMix } };
};

export const Episode: React.FC<EpisodeProps> = ({ slug, episode, timing, hasMix, review }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!episode || !timing) return null;
  const cast = castOf(episode);
  const f = (s: number) => Math.round(s * fps);
  // continuity context: the previous shot, when both are 3D (the renderer decides flow vs cut)
  const prevCtx = (i: number): ShotCtx | undefined => {
    const p = episode.shots[i - 1], c = episode.shots[i];
    if (!p || p.kind === 'card' || c.kind === 'card') return undefined;
    const pt = timing.shots[i - 1];
    return { shot: p as Shot3D, dur: Math.max(1, f(pt.start + pt.dur) - f(pt.start)) / fps, start: pt.start, words: pt.words };
  };
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {episode.shots.map((shot, i) => {
        const tm = timing.shots[i];
        if (!tm) return null;
        // the first shot also covers the narration lead-in (frames before its start), keeping its own time base,
        // so the video never opens on empty frames
        const s0 = f(tm.start), from = i === 0 ? 0 : s0;
        const len = Math.max(1, f(tm.start + tm.dur) - from), dur = Math.max(1, f(tm.start + tm.dur) - s0) / fps;
        return (
          <Sequence key={i} from={from} durationInFrames={len} name={`${i} ${shot.kind === 'card' ? 'card:' + shot.card : (shot as { set: string }).set}`}>
            <ShotView shot={shot} t={(frame - s0) / fps} dur={dur} cast={cast} frame={frame} words={tm.words} start={tm.start}
              prev={prevCtx(i)} review={review ? `#${i} ${shot.id || ''}` : undefined} />
          </Sequence>
        );
      })}
      <Grade vignette={0.55} grain={0.03} />
      {hasMix && !review && <Audio src={staticFile(`episodes/${slug}/mix.wav`)} />}
    </AbsoluteFill>
  );
};
