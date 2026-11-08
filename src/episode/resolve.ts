// Turns episode.json shapes into engine shapes: set marks → coordinates, cast merge.
import { CAST } from '../cast';
import { SETS } from '../sets';
import type { ActorInShot, CastMember, Episode, EpisodeActor, Place, Vec3 } from '../types';

/** "desk" → the mark; "desk+0.5,0,1" → mark plus offset; [x,y,z] passes through. */
export function place(p: Place | undefined, set: string, fallback: Vec3 = [0, 0, 0]): Vec3 {
  if (p === undefined) return fallback;
  if (Array.isArray(p)) return p;
  const [name, off] = p.split('+');
  const marks = SETS[set]?.marks || {};
  const base = marks[name.trim()];
  if (!base) {
    console.warn(`unknown mark "${name}" in set "${set}"`);
    return fallback;
  }
  if (!off) return base;
  const o = off.split(',').map(Number);
  return [base[0] + (o[0] || 0), base[1] + (o[1] || 0), base[2] + (o[2] || 0)];
}

export function resolveActor(a: EpisodeActor, set: string): ActorInShot {
  const look = a.look;
  return {
    ...a,
    pos: place(a.pos, set, SETS[set]?.marks.center || [0, 0, 0]),
    path: a.path?.map(w => ({ ...w, pos: place(w.pos, set) })),
    look: look === undefined || look === 'camera' ? look : typeof look === 'string' && !SETS[set]?.marks[look.split('+')[0]] ? look : place(look as Place, set),
  } as ActorInShot;
}

export function castOf(ep: Episode): Record<string, CastMember> {
  // per-character merge: an episode entry like { bestie: { name: 'Caio' } } renames without dropping the outfit
  const out: Record<string, CastMember> = { ...CAST };
  for (const [k, v] of Object.entries(ep.cast || {})) out[k] = { ...(CAST[k] || {}), ...v };
  return out;
}
