// Episode spec: the JSON Claude writes for every video (public/episodes/<slug>/episode.json).
// Everything in a shot is in seconds relative to the shot start; positions are metres,
// y up, a character with rot 0 faces +z (towards the default camera).

export type Vec3 = [number, number, number];

export type Outfit = {
  top?: 'hoodie' | 'jacket' | 'tee' | 'coat' | 'dress' | 'suit' | 'none';
  topColor?: string;
  accent?: string; // drawstrings, zip, stripes
  bottom?: 'pants' | 'shorts' | 'skirt' | 'none';
  bottomColor?: string;
  shoes?: string;
  hat?: 'cap' | 'beanie' | 'headband' | 'helmet' | 'none';
  hatColor?: string;
  hair?: 'none' | 'spiky' | 'bun' | 'afro' | 'long' | 'ponytail' | 'bob' | 'curly';
  glasses?: boolean;
  glassesColor?: string;
  mask?: string; // breathing-apparatus visor tint (firefighters, divers)
  headphones?: string;
  backpack?: string;
};

export type CastMember = Outfit & {
  name?: string;
  height?: number; // 1 = adult (1.75 m); kids ~0.7
  build?: number; // torso width multiplier
};

// A pose is a set of joint angles in degrees. Missing joints fall back to "stand".
export type Pose = {
  hipY?: number; // hips offset from standing height (m), negative = lower
  body?: Vec3; // whole-body rotation (x tips forward/back, z sideways) — lying, falling
  spine?: [number, number, number]; // bend fwd, lean to own left, twist to own left
  head?: [number, number, number]; // nod down, turn to own left, tilt
  armL?: [number, number, number, number]; // fwd raise, out raise, twist, elbow bend
  armR?: [number, number, number, number];
  legL?: [number, number, number]; // fwd raise, out raise, knee bend
  legR?: [number, number, number];
  handL?: 'fist' | 'open' | 'point';
  handR?: 'fist' | 'open' | 'point';
  // Two-bone IK: put the wrist on a body landmark or a root-local point; overrides armL/armR.
  reachL?: Reach;
  reachR?: Reach;
};

export type Reach = {
  to: 'mouth' | 'face' | 'chin' | 'temple' | 'forehead' | 'chest' | 'heart' | 'hip' | 'pocket' | Vec3;
  offset?: Vec3; // extra root-local offset (m)
  pole?: Vec3; // elbow hint, chest-local (+x = character's left)
};

export type Face = {
  eyes?: number; // openness 0..1.4 (1.4 = wide)
  pupils?: boolean; // black pupil dots (shocked close-ups)
  look?: [number, number]; // eye offset -1..1
  brow?: number; // -1 angry V .. 0 neutral .. 1 worried
  browY?: number; // raise
  mouth?: number; // curve: -1 frown .. 1 smile
  open?: number; // 0..1
  width?: number;
  tears?: boolean;
  sweat?: boolean;
  blush?: boolean;
  lid?: number; // 0..0.7 heavy upper lid (smug / bored / sly)
  lidTilt?: number; // lid slope -1..1 (defaults to brow); negative = inner end lower (sly)
  size?: number; // feature scale (thumbnails use ~1.8)
};

export type Key<T> = { t: number; v: T; blend?: number };

export type ActorInShot = {
  id: string; // key into episode.cast
  pos?: Vec3;
  rot?: number; // yaw degrees
  pose?: string | Pose; // starting pose
  face?: string | Face; // starting expression
  poses?: { t: number; pose: string | Pose; blend?: number }[]; // t may be a word cue "@word" in episode.json
  faces?: { t: number; face: string | Face; blend?: number }[];
  path?: { t: number; pos: Vec3; gait?: Gait; rot?: number }[]; // waypoints; moves between them
  gait?: Gait; // default gait for path segments
  strafe?: boolean; // keep facing `rot` while moving along the path (rolling backwards, side-steps)
  look?: string | Vec3 | 'camera'; // head looks at actor id / point
  talk?: [number, number][]; // mouth flaps during these intervals
  hold?: { L?: string; R?: string; scaleL?: number; scaleR?: number }; // props in hands; scaleX enlarges one about the palm (a prop the narration points at)
  scale?: number;
  ghost?: boolean; // translucent copy (afterimages, visions)
  glow?: string; // aura colour
  hidden?: boolean;
  contact?: boolean; // may touch/overlap other characters (hugs, tackles) without an audit error
};

export type Gait = 'walk' | 'run' | 'sprint' | 'dash' | 'sneak' | 'jog' | 'float' | 'glide' | 'carried' | 'shamble'; // shamble: slow zombie drag, arms out in front. carried: moved by something (basket, seat, a flight) — the pose stays as keyed

export type CameraSpec = {
  shot?: 'establishing' | 'wide' | 'full' | 'medium' | 'close' | 'xclose' | 'insert';
  target?: string | string[] | Vec3; // actor id(s) or a point
  focus?: 'head' | 'chest' | 'hips' | 'feet' | 'handL' | 'handR';
  angle?: number; // yaw around the target; for an actor 0 = in front of them, 90 = their left side
  height?: number; // elevation degrees (negative = low angle looking up)
  dist?: number; // override distance
  fov?: number;
  over?: string; // over-the-shoulder of this actor
  move?: 'static' | 'drift' | 'pushIn' | 'pullOut' | 'orbitL' | 'orbitR' | 'craneUp' | 'craneDown' |
    'truckL' | 'truckR' | 'track' | 'crashIn' | 'shake' | 'handheld';
  amount?: number; // move strength multiplier
  pos?: Vec3; // explicit camera
  look?: Vec3;
  to?: { pos: Vec3; look: Vec3 };
  moveAt?: [number | string, number | string]; // when the explicit `to` move runs (seconds or word cues); default the whole shot
  ease?: 'inOut' | 'linear' | 'out' | 'in' | 'cruise'; // easing of the explicit `to` move (cruise = steady pan that tracks a mover)
  path?: { t: number | string; pos: Vec3; look: Vec3; fov?: number; ease?: 'inOut' | 'linear' | 'out' | 'in' | 'cruise' }[]; // explicit keyframed camera (word cues ok); overrides pos/look/to
  dutch?: number; // roll degrees
  beats?: (number | string)[]; // sub-cut times inside the shot (seconds or word cues): each beat re-frames the same coverage (punch-in, new angle)
};

export type PropSpec = {
  type: string; // see sets/props.tsx registry
  pos?: Vec3;
  rot?: number | Vec3;
  scale?: number;
  color?: string;
  text?: string;
  path?: { t: number; pos: Vec3; rot?: Vec3 }[];
  [k: string]: unknown;
};

export type Overlay =
  | { type: 'label'; text: string; at?: number; until?: number; corner?: 'tl' | 'tr' | 'bl' | 'br' }
  | { type: 'title'; small?: string; big: string; at?: number; until?: number; compact?: number } // compact: s held small for the 9:16 column before growing (default ≥ 1.6, 0 = full size)
  | { type: 'stopwatch'; from?: string; to?: string; switchAt?: number | string; at?: number; until?: number; persist?: boolean; tick?: number; keep?: boolean; corner?: 'tl' | 'tr' | 'bl' | 'br' | 'tc' | 'bc' } // tc / bc = top / bottom centre, inside the 9:16 column (bc stays off faces). tick: live countdown of an "M:SS" from (story s per s); keep: no fade-out at the cut // switchAt may be a word cue ("@two")
  | { type: 'stat'; value: number | string; unit?: string; label?: string; at?: number; prefix?: string; decimals?: number; pos?: 'center' | 'top' | 'right' }
  | { type: 'bubble'; text: string; actor: string; at?: number; until?: number }
  | { type: 'thought'; text: string; actor: string; at?: number; until?: number }
  | { type: 'crush'; actor: string; value: number; from?: number; countDur?: number; at?: number; until?: number } // pink heart + % above the actor's head
  | { type: 'caption'; text: string; at?: number; until?: number }
  | { type: 'flash'; at?: number; color?: string }
  | { type: 'counter'; text: string; at?: number }
  | { type: 'news'; headline: string; ticker?: string; tag?: string; at?: number; until?: number; safe?: boolean } // safe: centred and wrapped inside the 9:16 column
  | { type: 'word'; text: string; at?: number; until?: number; color?: string; y?: 'low' | 'top' | 'mid' } // palavra-destaque: the key word pops in on its cue, centre column (default 1.5 s)
  | { type: 'menu'; rows: { label: string; value: number; from?: number; at?: number | string; warn?: boolean; dim?: boolean }[]; title?: string; note?: string; noteAt?: number | string; alarm?: boolean; y?: 'top' | 'mid' | 'low' | 'above'; at?: number; until?: number } // body-settings HUD (BodyMenu); row `at` / noteAt are shot times or word cues
  | { type: 'hudList'; items: string[]; at?: number; checked?: number };

export type ShotFx = {
  swap?: { t: number | string; ids: [string, string]; keepPaths?: boolean }; // the two actors trade places at t (blink-blink, flash, afterimages). keepPaths: their paths already encode the jump (momentum gags)
  freeze?: boolean | number; // time-freeze grade (number = start time)
  speedLines?: string; // actor id
  trail?: string; // afterimage trail behind actor id
  particles?: 'dust' | 'snow' | 'rain' | 'sparks' | 'embers' | 'stars';
  grade?: 'none' | 'warm' | 'cool' | 'desat' | 'mono' | 'dream' | 'night' | 'danger' | 'flashback';
  slowmo?: boolean;
  vignette?: number;
  shake?: number;
  bars?: 'in' | 'out';
};

// ---- episode spec (public/episodes/<slug>/episode.json) ------------------------------------
// Positions may be a set mark name ("desk") or "mark+x,y,z" offsets ("sidewalk+1.5,0,0").
export type Place = Vec3 | string;

export type EpisodeActor = Omit<ActorInShot, 'pos' | 'path' | 'look'> & {
  pos?: Place;
  path?: { t: number | string; pos: Place; gait?: Gait; rot?: number }[]; // t may be a word cue
  look?: string | Place | 'camera';
};

export type EpisodeProp = { type: string; pos?: Place; follow?: string | { t: number | string; id: string }[]; // ride on an actor's feet (skateboards); switch actor at t
  rot?: number | Vec3; scale?: number; color?: string; text?: string; path?: { t: number | string; pos: Vec3; rot?: Vec3 }[]; [k: string]: unknown }; // path t may be a word cue

export type Shot3D = {
  kind?: '3d';
  id?: string;
  vo?: string; // narration covered by this shot, in script order, in Portuguese. ElevenLabs audio tags like [whispering] are allowed.
  who?: string; // speaker key in episode.voices (default 'narrator')
  hold?: number; // extra seconds after the narration (or the whole shot if no vo). Ends a voice section.
  set: string; // SETS key
  time?: string; // PALETTES key (default: the set's palette)
  variant?: number;
  actors?: EpisodeActor[];
  props?: EpisodeProp[];
  camera?: CameraSpec;
  overlays?: Overlay[];
  fx?: ShotFx;
  sfx?: SfxCue[];
  cut?: Cut; // default: flow when the framing barely changes in the same set, else cut
  coverage?: 'off' | 'calm' | 'fast'; // automatic sub-cuts on word starts: fast ≈ every 1.6 s, calm ≈ 2.6 s (explicit pos/path cameras: 2.2 / 3.0 s, punch-in or orbit of their own view; `over` cameras: none)
};

// Transitions. whip / zoom / smash play on both sides of the cut (end of the outgoing shot + start of this one).
export type Cut = 'cut' | 'flow' | 'flash' | 'whip' | 'dip' | 'zoom' | 'smash';

export type CardShot = {
  kind: 'card';
  id?: string;
  vo?: string;
  who?: string;
  hold?: number;
  card: string; // CARDS key; the remaining fields are that card's spec
  overlays?: Overlay[];
  sfx?: SfxCue[];
  cut?: Cut;
  [k: string]: unknown;
};

export type Shot = Shot3D | CardShot;

export type SfxCue = { t: number; name: string; vol?: number; dur?: number };

export type MusicCue = { shot: number; mood: 'curious' | 'tension' | 'action' | 'wonder' | 'sad' | 'none'; vol?: number };

export type Episode = {
  slug: string;
  title: string;
  fps?: number;
  voice: { id: string; model?: 'eleven_v4' | 'eleven_multilingual_v2' | 'eleven_turbo_v2_5'; direction?: string; tempo?: number; targetWpm?: number; tempoRange?: [number, number]; maxPause?: number; stability?: number; similarityBoost?: number };
  voices?: Record<string, string>; // extra speakers: key → ElevenLabs voice id (narrator = voice.id)
  cast?: Record<string, CastMember>; // merged over src/cast.ts
  music?: MusicCue[];
  // Shorts the user cuts by hand from the 16:9 (YouTube Shorts / Reels / TikTok): ≥ 4 per long episode,
  // each a self-contained ~90 s run of whole shots (from/to = shot ids, inclusive). The audit checks length.
  clips?: { title: string; from: string; to: string }[];
  hookCheck?: boolean; // false = skip the audit's first-10-seconds retention check (episodes made before the rule, 2026-11-09)
  shots: Shot[];
};

export type Timing = {
  fps: number;
  total: number; // seconds
  draft?: boolean; // estimated (episode.mjs draft), no voice yet
  shots: { start: number; dur: number; section: number | null; words?: [string, number][] }[];
  sections: { file: string; start: number; dur: number }[];
};
