"""Shared helpers for episode generators (tools/episodes/<slug>.py -> public/episodes/<slug>/episode.json).

Use from a generator:
    import os, sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))   # python -I drops the script dir
    from kit import *

Then build shots with S(...) / C(...), the episode dict with ep = episode(...), and finish with write(SLUG, ep).
Start a new episode from _modelo.py.
"""
import json
import os

__all__ = ['shots', 'A', 'cam', 'S', 'C', 'ladainha', 'apply_ritmo', 'crush', 'walk', 'TALK', 'SW', 'shot_index', 'episode',
           'load_timing', 'resolve_countdowns', 'clean', 'write', 'NARRATOR', 'HOUSE_VOICES']

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
NARRATOR = {'id': '36rVQA1AOIPwpA3Hg1tC', 'model': 'eleven_v4'}  # Matheus, always animated (docs/pipeline/EPISODE.md, Voice)
HOUSE_VOICES = {'adulto': 'u4sbCzXyUVxIAihOtCss', 'adulta': 'dxIMMSJYSsbUSMhioLNb',
                'hero': '7u8qsX4HQsSHJ0f8xsQZ'}  # João Pedro, the hero's own voice (always dynamic/playful, 2026-11-09)

shots = []
TALK = [[0.05, 3.0]]                                             # talk window for a short line


def SW(v):
    """A stopwatch that continues across cuts (no draw-in)."""
    return {'type': 'stopwatch', 'from': v, 'persist': True}


def A(id, pos, rot=0, pose='stand', face='neutral', **kw):
    """An actor."""
    d = {'id': id, 'pos': pos, 'rot': rot, 'pose': pose, 'face': face}
    d.update(kw)
    return d


def cam(shot, target, angle=0, **kw):
    """An automatic camera: shot = xclose|close|medium|full|wide|establishing|insert."""
    d = {'shot': shot, 'target': target, 'angle': angle}
    d.update(kw)
    return d


def S(id, set_, vo=None, actors=None, camera=None, **kw):
    """A 3D shot, appended to `shots`."""
    d = {'id': id, 'set': set_}
    if vo:
        d['vo'] = vo
    if actors:
        d['actors'] = actors
    if camera:
        d['camera'] = camera
    d.update(kw)
    shots.append(d)


def C(id, card, vo, **spec):
    """A card shot (src/cards), appended to `shots`."""
    d = {'id': id, 'kind': 'card', 'card': card, 'vo': vo}
    d.update(spec)
    shots.append(d)


def ladainha(prefix, set_, itens, sfx='chime', color='yellow', **common):
    """A list montage (COLA "Ladainha"): one 3D shot per item, ~4–6 s each, ids prefix1, prefix2, ...
    Each item is a dict of S() fields (vo required; actors, camera, set, fx, ... optional) plus
      word: the item's number or key word, shown as a palavra-destaque on its spoken cue with a short SFX.
            Either (shown text, cue) — ('R$ 3', '@três') — or a plain spoken word ('cinco' → cue '@cinco').
    `common` holds fields every item shares (e.g. coverage='fast'); an item's own fields win.
    sfx=None drops the per-item sound."""
    for i, it in enumerate(itens, 1):
        it = {'repeat': True, **common, **it}  # a ladainha repeats its structure on purpose (episode.mjs check)
        word = it.pop('word', None)
        overlays, cues = list(it.pop('overlays', [])), list(it.pop('sfx', []))
        if word:
            text, cue = word if isinstance(word, (list, tuple)) else (word.upper(), '@' + word.lower())
            overlays.insert(0, {'type': 'word', 'text': text, 'at': cue, 'color': color})
            if sfx:
                cues.insert(0, {'t': cue, 'name': sfx})
        if overlays:
            it['overlays'] = overlays
        if cues:
            it['sfx'] = cues
        S(f'{prefix}{i}', it.pop('set', set_), it.pop('vo'), it.pop('actors', None), it.pop('camera', None), **it)


def crush(actor, value, frm=None, at=0.3, **kw):
    """The pink crush-meter overlay over an actor."""
    d = {'type': 'crush', 'actor': actor, 'value': value, 'at': at}
    if frm is not None:
        d['from'] = frm
    d.update(kw)
    return d


def walk(a, b, t0=0.2, t1=3.0, gait='walk'):
    """A two-key path from a to b."""
    return [{'t': t0, 'pos': a}, {'t': t1, 'pos': b, 'gait': gait}]


def shot_index():
    """{shot id: index}; fails on duplicate ids (edits by id hit the first match)."""
    idx = {s['id']: i for i, s in enumerate(shots)}
    assert len(idx) == len(shots), 'duplicate shot ids'
    return idx


def apply_ritmo(shots_):
    """House pacing (since 2026-11-08): automatic sub-cuts on 3D shots (coverage 'fast' unless the shot sets
    its own; use 'calm' in the dilemma, 'off' for a held tableau). Automatic cameras re-frame per beat; explicit
    pos/path cameras punch in / orbit their own view (scene.ts beatView); over-the-shoulder shots are left alone.
    and a whip / zoom transition, alternating, on every 3D→3D set change that has no explicit cut.
    Smash cuts stay hand-placed (reveals, punchlines)."""
    alt = ['whip', 'zoom']
    n = 0
    for i, sh in enumerate(shots_):
        if sh.get('kind') == 'card':
            continue
        c = sh.get('camera') or {}
        if 'coverage' not in sh and not c.get('over'):
            sh['coverage'] = 'fast'
        prev = shots_[i - 1] if i else None
        if prev and prev.get('kind') != 'card' and 'cut' not in sh and prev.get('set') != sh.get('set'):
            sh['cut'] = alt[n % 2]
            n += 1


def episode(slug, title, cast, music, voices=None, voice=None, ritmo=None, clips=None, shorts=None, **kw):
    """The episode dict. music: [(shot id, mood), ...]. ritmo='rapido' applies the house pacing (apply_ritmo).
    clips: retired (hand-cut ~90 s clips). shorts: the 4 vertical ~60 s shorts (COLA "Shorts"), a list of dicts
    {title, cta, from, to, drop?, shots?, stage?, stageAt?, cutAt?} — rendered by tools/shorts.mjs."""
    if ritmo == 'rapido':
        apply_ritmo(shots)
    idx = shot_index()
    ep = {
        'slug': slug,
        'title': title,
        'voice': dict(voice or NARRATOR),
        'voices': dict(voices if voices is not None else HOUSE_VOICES),
        'cast': cast,
        # music: (shot id, mood) for a procedural bed, or (shot id, 'music/<slug>/track.mp3') for the user's track
        # (house rule since 2026-11-09: the user sends the track before each episode), or (shot id, {file, vol})
        'music': [{'shot': idx[sid], **(m if isinstance(m, dict) else {'file': m, 'vol': -20} if '/' in str(m) else {'mood': m})} for sid, m in music],
        'shots': shots,
    }
    if clips:
        ep['clips'] = [{'title': t, 'from': a, 'to': b} for t, a, b in clips]
    if shorts:
        ep['shorts'] = shorts
    ep.update(kw)
    return ep


class Timing:
    """Real voice timing (timing.json after `align`), by shot id."""

    def __init__(self, tm, idx):
        self.tm, self.idx = tm, idx

    def start(self, sid):
        return self.tm['shots'][self.idx[sid]]['start']

    def dur(self, sid):
        return self.tm['shots'][self.idx[sid]]['dur']

    def word(self, sid, w, n=1):
        """Seconds into shot `sid` where word `w` is spoken (n-th occurrence)."""
        hits = [t for x, t in self.tm['shots'][self.idx[sid]]['words'] if x == w]
        return hits[n - 1]

    def at(self, sid, w, n=1):
        """Absolute episode time of word `w` in shot `sid`."""
        return self.start(sid) + self.word(sid, w, n)

    @staticmethod
    def fmt(sec):
        """m:ss, rounded, never negative."""
        s = max(0, int(round(sec)))
        return f'{s // 60}:{s % 60:02d}'


def load_timing(slug):
    """Timing helper, or None while there's no voice yet or the shot count changed (draft keeps static values)."""
    p = os.path.join(ROOT, 'public', 'episodes', slug, 'timing.json')
    if not os.path.exists(p):
        return None
    with open(p, encoding='utf-8') as f:
        tm = json.load(f)
    if len(tm['shots']) != len(shots):
        return None
    return Timing(tm, shot_index())


def resolve_countdowns(timing, clocks, fallback='4:00'):
    """Live countdowns that line up across cuts (story time can run faster than screen time).

    Mark overlays with {'type': 'stopwatch', 'cd': '<clock name>'}; clocks maps each name to
    (t0, t1, total_seconds, corner, last_shot_id): the clock reads `total` at absolute time t0 and 0 at t1.
    Without timing (draft) every marker shows `fallback`."""
    if timing is None:
        for sh in shots:
            for o in sh.get('overlays', []):
                if o.pop('cd', None):
                    o['from'] = fallback
        return
    for i, sh in enumerate(shots):
        for o in sh.get('overlays', []):
            kind = o.pop('cd', None)
            if not kind:
                continue
            t0, t1, total, corner, last = clocks[kind]
            rate = total / (t1 - t0)
            st = timing.tm['shots'][i]['start']
            begin = max(st, t0)
            left = max(0.0, total - (begin - t0) * rate)
            o.update({'from': f'{int(left // 60)}:{int(round(left % 60)) % 60:02d}' if round(left % 60) < 60 else f'{int(left // 60) + 1}:00',
                      'tick': round(rate, 3), 'corner': corner, 'keep': sh['id'] != last})
            if st < t0:
                o['at'] = round(t0 - st, 3)
            else:
                o['persist'] = True


def clean(o):
    """Drop None values recursively (e.g. glow=None)."""
    if isinstance(o, dict):
        return {k: clean(v) for k, v in o.items() if v is not None}
    if isinstance(o, list):
        return [clean(v) for v in o]
    return o


def write(slug, ep, drop_none=True):
    """Write public/episodes/<slug>/episode.json and print a one-line summary."""
    out = os.path.join(ROOT, 'public', 'episodes', slug, 'episode.json')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(clean(ep) if drop_none else ep, f, ensure_ascii=False, indent=1)
    words = sum(len(s.get('vo', '').split()) for s in ep['shots'])
    print(f'{len(ep["shots"])} shots, {words} words -> {os.path.normpath(out)}')
