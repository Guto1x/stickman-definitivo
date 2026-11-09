// Sound → picture (house rule 2026-11-09: "a informação visual deve acompanhar o som pra reter"). Every scripted
// sound cue in a shot's `sfx` gets an automatic visual answer on its frame, so nothing is heard without being
// seen: a camera kick, a white flash, a punch-in of the frame, an emote on the shot's main actor, a burst.
// Sounds not listed here (diegetic ones: a door, eating, footsteps) need a visible action of their own at the
// cue — the audit warns `[sync]` when a cue has no visual event within 0.25 s.
import type { EmoteKind } from '../overlays/Beats';

export type SfxVisual = {
  shake?: number; // camera kick strength (decays in ~0.25 s)
  flash?: number; // white flash peak 0..1
  zoom?: number; // 2D punch-in of the frame (fraction, e.g. 0.06)
  emote?: EmoteKind; // on the shot's main actor (camera target, else the hero)
  burst?: string; // sunburst colour behind the main actor (~1.6 s)
};

export const SFX_VISUAL: Record<string, SfxVisual> = {
  // hits
  boom: { shake: 1, flash: 0.35, zoom: 0.05 },
  farBoom: { shake: 0.45 },
  subdrop: { shake: 0.6, zoom: 0.04 },
  impact: { shake: 0.8, flash: 0.25, zoom: 0.05 },
  punch: { shake: 0.9, flash: 0.3, zoom: 0.06 },
  nuke: { shake: 1.8, flash: 0.9, zoom: 0.08 },
  thud: { shake: 0.35 },
  crack: { shake: 0.4, zoom: 0.03 },
  fall: { shake: 0.6 },
  debris: { shake: 0.4 },
  splash: { shake: 0.3 },
  water: { shake: 0.25 },
  rumble: { shake: 0.4 },
  // comedy & reactions
  bonk: { shake: 0.5, emote: 'sparkle', zoom: 0.05 },
  shock: { emote: 'exclaim', zoom: 0.07 },
  sting: { emote: 'exclaim', zoom: 0.05 },
  fah: { emote: 'sweat', zoom: 0.06, shake: 0.3 },
  awkward: { emote: 'sweat' },
  angry: { emote: 'anger', zoom: 0.04 },
  sad: { emote: 'tears' },
  villain: { zoom: 0.08, flash: 0.2 },
  badass: { zoom: 0.05 },
  angels: { burst: 'gold' },
  // small UI-like sounds
  ding: { emote: 'sparkle' },
  chime: { emote: 'sparkle' },
  glint: { emote: 'sparkle' },
  notify: { emote: 'exclaim' },
  photo: { flash: 0.7 },
  teleport: { flash: 0.6, zoom: 0.05 },
  zap: { flash: 0.4 },
  heartbeat: { zoom: 0.035 },
  gulp: { emote: 'sweat' },
};
