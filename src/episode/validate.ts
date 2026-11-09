// Checks an episode spec against the registries so mistakes fail fast with a readable list.
// Runs inside calculateMetadata; check from the CLI with:
//   npx remotion compositions src/index.ts --props='{"slug":"<slug>"}'
import { CARDS } from '../cards';
import { SETS } from '../sets';
import { PALETTES } from '../sets/look';
import { FACES, POSES } from '../engine/rig';
import type { Episode, Shot3D } from '../types';
import { castOf } from './resolve';

// Mirrors LIB in tools/sfx/episode_audio.py
export const SFX_NAMES = ['whoosh', 'whooshUp', 'swoosh', 'boom', 'farBoom', 'thud', 'footsteps', 'gulp', 'click', 'pop', 'cloth', 'heartbeat',
  'subdrop', 'riser', 'swell', 'zap', 'crackle', 'wind', 'debris', 'rustle', 'chime', 'glint', 'ticks', 'ring', 'bell', 'whistle', 'groan', 'groanLow',
  'menu', 'tick', 'alert', 'horn', 'crack', 'splash'];
const PROPS = ['table', 'roundTable', 'chair', 'bed', 'desk', 'deskLamp', 'door', 'window', 'shelf', 'plant', 'tree', 'bush', 'lamp', 'fence', 'car', 'house',
  'building', 'clock', 'rug', 'crowd', 'sign', 'screen', 'box', 'crate', 'ball', 'basketball', 'cup', 'phone', 'book', 'laptop', 'glow', 'pillar', 'wall', 'portal', 'cone', 'trophy', 'skateboard', 'spot',
  'fire', 'smoke', 'firetruck', 'basket', 'binoculars', 'trafficlight', 'pizza', 'jar', 'iceHole', 'dog'];
const SHOTS = ['establishing', 'wide', 'full', 'medium', 'close', 'xclose', 'insert'];
const MOVES = ['static', 'drift', 'pushIn', 'pullOut', 'orbitL', 'orbitR', 'craneUp', 'craneDown', 'truckL', 'truckR', 'track', 'crashIn', 'shake', 'handheld'];
const OVERLAYS = ['label', 'title', 'stopwatch', 'stat', 'bubble', 'thought', 'crush', 'caption', 'flash', 'counter', 'news', 'hudList', 'word', 'menu'];

export function validate(ep: Episode): string[] {
  const out: string[] = [];
  const cast = castOf(ep);
  if (!ep.voice?.id) out.push('voice.id missing');
  const speakers = ['narrator', 'male', 'female', ...Object.keys(ep.voices || {})];
  ep.shots.forEach((shot, i) => {
    const at = `shot ${i}`;
    if (shot.who && !speakers.includes(shot.who)) out.push(`${at}: unknown speaker who:"${shot.who}" (have: ${speakers.join(', ')})`);
    if (!shot.vo && !shot.hold) out.push(`${at}: needs "vo" or "hold"`);
    (shot.sfx || []).forEach(c => { if (!SFX_NAMES.includes(c.name)) out.push(`${at}: unknown sfx "${c.name}"`); });
    (shot.overlays || []).forEach(o => { if (!OVERLAYS.includes(o.type)) out.push(`${at}: unknown overlay "${o.type}"`); });
    if (shot.kind === 'card') {
      if (!CARDS[shot.card as string]) out.push(`${at}: unknown card "${shot.card}" (have: ${Object.keys(CARDS).join(', ')})`);
      return;
    }
    const s = shot as Shot3D;
    const set = SETS[s.set];
    if (!set) {
      out.push(`${at}: unknown set "${s.set}" (have: ${Object.keys(SETS).join(', ')})`);
      return;
    }
    if (s.time && !PALETTES[s.time]) out.push(`${at}: unknown time/palette "${s.time}"`);
    const mark = (p: unknown, what: string) => {
      if (typeof p !== 'string') return;
      const name = p.split('+')[0].trim();
      if (!set.marks[name]) out.push(`${at}: ${what} mark "${name}" not in set ${s.set} (have: ${Object.keys(set.marks).join(', ')})`);
    };
    (s.actors || []).forEach(a => {
      if (!cast[a.id]) out.push(`${at}: unknown cast "${a.id}"`);
      mark(a.pos, `actor ${a.id}`);
      (a.path || []).forEach(w => mark(w.pos, `actor ${a.id} path`));
      const poses = [a.pose, ...(a.poses || []).map(k => k.pose)];
      poses.forEach(p => { if (typeof p === 'string' && !POSES[p]) out.push(`${at}: unknown pose "${p}"`); });
      const faces = [a.face, ...(a.faces || []).map(k => k.face)];
      faces.forEach(f => { if (typeof f === 'string' && !FACES[f]) out.push(`${at}: unknown face "${f}"`); });
    });
    (s.props || []).forEach(p => { if (!PROPS.includes(p.type)) out.push(`${at}: unknown prop "${p.type}"`); mark(p.pos, `prop ${p.type}`); });
    const c = s.camera;
    if (c) {
      if (c.shot && !SHOTS.includes(c.shot)) out.push(`${at}: unknown camera.shot "${c.shot}"`);
      if (c.move && !MOVES.includes(c.move)) out.push(`${at}: unknown camera.move "${c.move}"`);
      const ids = Array.isArray(c.target) ? (typeof c.target[0] === 'string' ? (c.target as string[]) : []) : typeof c.target === 'string' ? [c.target] : [];
      ids.forEach(id => { if (!(s.actors || []).some(a => a.id === id)) out.push(`${at}: camera target "${id}" is not in this shot`); });
    }
  });
  (ep.music || []).forEach(m => { if (m.shot >= ep.shots.length) out.push(`music cue at shot ${m.shot} is past the last shot`); });
  return out;
}
